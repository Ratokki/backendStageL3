import { db } from "../../../config/bd.js";

export const getAcceptedChefs = (req, res) => {
  const query = `
    SELECT 
      u.idUtilisateur, 
      u.nom, 
      u.prenom, 
      u.profile,
      COUNT(p.id_projet) AS nombre_projets 
    FROM utilisateur u
    LEFT JOIN projetpropose p ON p.id_responsable = u.idUtilisateur AND p.statut = 'Accepté'
    WHERE u.status = 'Accepté' AND u.role = 'Chef de projet'
    GROUP BY u.idUtilisateur
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: err });
    }
  
    console.log(results); // Vérifier les données renvoyées
    return res.status(200).json(results);
  });
};

