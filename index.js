import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import AuthRouteAdminRoute from "./routes/admin/AuthRouteAdmin.js";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import AuthRouteUser from "./routes/client/AuthRouteUser.js";
import RouteDiscussionMess from "./routes/discussion/routeDiscussion.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";
import { fileURLToPath } from 'url';
import multer from "multer";
import cron from "node-cron"; // Importer node-cron
import { db } from "./config/bd.js"; // Importer la configuration de la base de données
import "./utils/cronTasks.js";

// Environment Variables
dotenv.config();
const port = process.env.PORT || 5000;
const serverUrl = process.env.SWAGGER_URL || "http://localhost:5000";

// Handle __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Swagger Documentation
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Doc E-commerce API",
      version: "1.0.0",
      description: "E-commerce API",
    },
    servers: [
      {
        url: serverUrl,
      },
    ],
  },
  apis: ["./utils/*.js"],
};
const specs = swaggerJsDoc(options);

// Express App and Middleware
const app = express();
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use('/uploads', express.static('uploads'));

// Configuration de multer pour sauvegarder les images dans le dossier "uploads"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve('uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// HTTP Server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Un utilisateur est connecté");

  socket.on('messageSent', (message) => {
    // Diffuser le message aux autres utilisateurs
    io.emit('newMessage', message);
  });

  // Gestion de la déconnexion
  socket.on("disconnect", () => {
    console.log("Un utilisateur est déconnecté");
  });
});

// Routes
app.use("/admin", AuthRouteAdminRoute);
app.use("/user", AuthRouteUser);
app.use("/discussion", RouteDiscussionMess);

// Route de mise à jour du profil utilisateur
app.put("/user/:idUtilisateur", upload.single('profile'), (req, res) => {
  const UserId = req.params.idUtilisateur;

  console.log("Requête reçue : ", req.body);
  console.log("Fichier reçu : ", req.file);

  let profileUrl = req.body.profile;
  if (req.file) {
    profileUrl = `uploads/${req.file.filename}`;
  }

  const q = "UPDATE utilisateur SET `nom`=?, `prenom`=?, `email`=?, `profile`=?, `role`=? WHERE `idUtilisateur`=?";
  const values = [req.body.nom, req.body.prenom, req.body.email, profileUrl, req.body.role];

  db.query(q, [...values, UserId], (err, data) => {
    if (err) {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
      return res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur", error: err });
    }

    res.json({
      message: "Utilisateur mis à jour avec succès",
      profileUrl
    });
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to our E-commerce APIs");
});

// Tâche cron pour ajouter 8 heures de retard aux tâches sans rapport à la fin de la journée
cron.schedule('1 20 * * *', () => { // Exécution quotidienne à 20:01
  console.log("Exécution de la tâche cron pour ajouter 8 heures de retard aux tâches sans rapport.");

  const query = `
    UPDATE tache t
    LEFT JOIN rapport_journalier r 
    ON t.id = r.id_tache 
    AND DATE(r.date_rapport) = CURDATE() 
    SET t.jours_de_retard = t.jours_de_retard + 8
    WHERE t.date_debut IS NOT NULL 
    AND t.statut <> 'Terminé' 
    AND (DATEDIFF(CURDATE(), t.date_debut) + 1) <= t.duree + t.jours_de_retard 
    AND r.id_tache IS NULL`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la mise à jour des heures de retard:", err.message);
    } else {
      console.log("Mise à jour des heures de retard effectuée pour les tâches sans rapport.");
    }
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start Server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
