import express from "express";
import fs from 'fs';
import path from 'path';
import multer from "multer";
import { AuthControllerClient } from "../../controllers/client/index.js";
import { ControllerClient } from "../../controllers/client/index.js";
import { checkUserByEmail, sendVerificationCode } from "../../controllers/client/auth/AuthControllerClient.js";

const router = express.Router();

// Création automatique du dossier "uploads" s'il n'existe pas
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Dossier uploads créé');
}

// Configuration multer pour sauvegarder les images dans le dossier "uploads"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve('uploads'));
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
const upload = multer({ storage });

// AUTH
router.post("/register", AuthControllerClient.register);
router.post("/login", AuthControllerClient.login);
router.post("/logout", AuthControllerClient.logout);

// Password reset
router.post("/check", checkUserByEmail);
router.post("/sendVerificationCode", sendVerificationCode);

// CRUD user
// Utiliser `upload.single('profile')` pour permettre l'upload d'image de profil dans la requête PUT
router.put("/:idUtilisateur", upload.single("profile"), ControllerClient.updateUser);
router.get("/", ControllerClient.getUsers);

// COMMENT
// router.post("/comment", ControllerCommentClient.addComment);
// router.get("/comment", ControllerCommentClient.getAllComments);
// router.get("/comment/:IdComment", ControllerCommentClient.getOneComment);

export default router;
