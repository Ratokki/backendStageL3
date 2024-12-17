import { db } from "../../../config/bd.js";

export const selectionProject = (req, res) => {
    const id_projet = req.query.id_projet; // Récupérer l'ID du projet de la requête
  
    // Prépare la requête SQL en fonction de la présence de l'ID
    const query = id_projet
      ? "SELECT * FROM projetPropose WHERE id_projet = ?"
      : "SELECT * FROM projetPropose WHERE statut = 'Accepté'"; // Filtrer uniquement les projets acceptés
  
    db.query(query, id_projet ? [id_projet] : [], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des projets:', err.message);
        return res.status(500).json({ message: 'Erreur lors de la récupération des projets.' });
      }
      res.status(200).json(results); // Renvoie les résultats
    });
  };

  export const getTasks = (req, res) => {
    const { id_projet } = req.params;
  
    const query = "SELECT * FROM tache WHERE id_projet = ?";
    
    db.query(query, [id_projet], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des tâches:', err.message);
        return res.status(500).json({ message: 'Erreur lors de la récupération des tâches.' });
      }
      res.status(200).json(results); // Renvoie les résultats
    });
  };
  