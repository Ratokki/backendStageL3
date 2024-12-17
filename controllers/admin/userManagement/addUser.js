import { db } from "../../../config/bd.js";
import bcrypt from 'bcrypt';

export const insertUser = async (req, res) => {
  const { nom, prenom, email, password, profile, role } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);
    const q = "INSERT INTO utilisateur (`nom`, `prenom`, `email`, `password`, `profile`, `role`) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [nom, prenom, email, hash, profile, role];

    db.query(q, values, (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json("Utilisateur a été créé avec succès.");
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur:", error);
    return res.status(500).json("Erreur lors de la création de l'utilisateur.");
  }
};
