import { db } from "../../../config/bd.js";

export const selectProject = (req, res) => {
  const id_projet = req.params.id_projet; // Récupérer l'ID du projet à partir des paramètres d'URL

  // Prépare la requête SQL pour un projet spécifique
  const query = "SELECT * FROM projetPropose WHERE id_projet = ?";

  db.query(query, [id_projet], (err, results) => {
    if (err) return res.status(500).json(err);
    
    // Vérifier si un projet a été trouvé
    if (results.length === 0) {
      return res.status(404).json({ message: 'Projet non trouvé.' });
    }

    console.log("project data:", results[0]);
    return res.status(200).json(results[0]); // Renvoie le projet trouvé
  });
};
