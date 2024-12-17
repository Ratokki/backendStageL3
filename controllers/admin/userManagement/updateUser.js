import { db } from "../../../config/bd.js";
import bcrypt from 'bcrypt'; // Assurez-vous d'importer bcrypt pour le hashage

export const editUser = async (req, res) => {
    const idUtilisateur = req.params.idUtilisateur; // On suppose que l'ID de l'utilisateur est passé dans l'URL
    const { nom, prenom, email, password, profile, role } = req.body;
  
    let q = "UPDATE utilisateur SET nom = ?, prenom = ?, email = ?, profile = ?, role = ? WHERE idUtilisateur = ?";
    let values = [nom, prenom, email, profile, role, idUtilisateur];
  
    // Si un nouveau mot de passe est fourni, on le hash
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      q = "UPDATE utilisateur SET nom = ?, prenom = ?, email = ?, password = ?, profile = ?, role = ? WHERE idUtilisateur = ?";
      values = [nom, prenom, email, hash, profile, role, idUtilisateur];
    }
  
    db.query(q, values, (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json("Utilisateur a été mis à jour avec succès.");
    });
  };