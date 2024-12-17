import { db } from "../../../config/bd.js";

export const deleteProject = (req, res) => {
    const id_projet = req.params.id_projet; // Récupérer l'ID du projet à supprimer
  
    // Vérifiez si l'ID est valide
    if (!id_projet) {
      return res.status(400).json({ message: 'ID de projet manquant.' });
    }
  
    const query = "DELETE FROM projetPropose WHERE id_projet = ?";
  
    db.query(query, [id_projet], (err, results) => {
      if (err) {
        console.error('Erreur lors de la suppression du projet:', err.message);
        return res.status(500).json({ message: 'Erreur lors de la suppression du projet.' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Projet non trouvé.' });
      }
  
      res.status(200).json({ message: 'Projet supprimé avec succès.' });
    });
  };
  