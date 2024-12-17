import { db } from "../../../config/bd.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';

export const register = (req, res) => {
  console.log('Requête reçue:', req.body);

  const requiredFields = ['email', 'nom', 'prenom', 'password', 'profile', 'role', 'genre'];
  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    console.log('Champs manquants:', missingFields);
    return res.status(400).json({ error: "Missing required fields.", fields: missingFields });
  }

  const q = "SELECT * FROM utilisateur WHERE email = ? OR (nom = ? AND prenom = ?)";
  db.query(q, [req.body.email, req.body.nom, req.body.prenom], (err, data) => {
    if (err) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length) {
      console.log('Utilisateur existant:', data);
      return res.status(409).json({ error: "User already exists!" });
    }

    // Hash the password and create a user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const insertQuery = "INSERT INTO utilisateur(`nom`, `prenom`, `email`, `password`, `profile`, `role`, `genre` ) VALUES (?)";
    const values = [
      req.body.nom,
      req.body.prenom,
      req.body.email,
      hash,
      req.body.profile,
      req.body.role,
      req.body.genre,
    ];

    db.query(insertQuery, [values], (err, data) => {
      if (err) {
        console.error("Erreur d'insertion dans la base de données :", err);
        return res.status(500).json({ error: "Erreur lors de la création de l'utilisateur." });
      }
      console.log("Nouvel utilisateur ajouté avec succès :", data);
      return res.status(200).json({ message: "User has been created." });
    });
  });
};

export const login = (req, res) => {
  const q = "SELECT * FROM utilisateur WHERE email=?";
  db.query(q, [req.body.email], (err, data) => {
    if (err) return res.json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );
    if (!isPasswordCorrect)
      return res.status(400).json("Wrong password or username");

    // Vérifier si l'utilisateur est accepté
    const userStatus = data[0].status; // Obtenez le statut de l'utilisateur

    if (!data[0].idUtilisateur) {
      console.error("User id not found:", data[0]);
      return res.status(500).json("User id not found!");
    }

    const token = jwt.sign({ id: data[0].idUtilisateur }, "jwtkey");
    const { password, ...other } = data[0];

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ token, user: other, status: userStatus }); // Ajoutez le statut à la réponse
  });
};



  export const logout = (req, res) => {
    res
    .clearCookie("access_token", {
      httpOnly: true,
      sameSite: "None", 
      secure: true,
    })
    .status(200)
    .json("user has been logged out.");
  };
  export const checkUserByEmail = (req, res) => {
    const { email } = req.body;
  
    const q = "SELECT nom, prenom, email, role, genre FROM utilisateur WHERE email = ?";
    db.query(q, [email], (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const userInfo = { nom: results[0].nom, prenom: results[0].prenom, email: results[0].email, role: results[0].role, genre: results[0].genre };
      res.status(200).json({ message: 'User found', user: userInfo });
    });
  };

  export const sendVerificationCode = (req, res) => {
    const { email } = req.body;
  
    // Générer un code aléatoire à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000);
  
    // Enregistrer le code dans la base de données de l'utilisateur
    const updateQuery = "UPDATE utilisateur SET resetCode = ? WHERE email = ?";
    db.query(updateQuery, [code, email], (updateError, updateResults) => {
      if (updateError) {
        console.error(updateError);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      // Envoyer l'email avec le code de vérification
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'itokkiralaiarivelo@gmail.com', // Remplacez par votre adresse email Gmail
          pass: '' // Remplacez par le mot de passe d'application de votre compte Gmail
        }
      });
  
      transporter.sendMail({
        from: 'itokkiralaiarivelo@gmail.com',
        to: email,
        subject: 'Code de vérification',
        text: `Votre code de vérification est : ${code}`
      });
  
      res.status(200).json({ message: 'Code envoyé avec succès' });
    }); 
  };