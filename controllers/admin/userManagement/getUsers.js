import { db } from "../../../config/bd.js";

export const selectUsers = (req, res) => {
  const idUtilisateur = req.query.idUtilisateur; // Récupérer l'ID du projet de la requête

  // Prépare la requête SQL en fonction de la présence de l'ID
  const query = idUtilisateur
    ? "SELECT * FROM utilisateur WHERE idUtilisateur = ?"
    : "SELECT * FROM utilisateur";

  db.query(query, idUtilisateur ? [idUtilisateur] : [], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err.message);
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
    }
    res.status(200).json(results); // Renvoie les résultats
  });
};
