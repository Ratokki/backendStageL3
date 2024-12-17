import { db } from "../../../config/bd.js";

export const delUser = (req, res) => {
    const idUtilisateur = req.params.idUtilisateur; // On suppose que l'ID de l'utilisateur est passé dans l'URL
  
    const q = "DELETE FROM utilisateur WHERE idUtilisateur = ?";
    
    db.query(q, [idUtilisateur], (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json("Utilisateur a été supprimé avec succès.");
    });
  };
  