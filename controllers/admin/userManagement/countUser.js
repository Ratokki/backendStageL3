import { db } from "../../../config/bd.js";

export const accountUsers = (req, res) => {
  const query = `
    SELECT 
    u.role, 
    u.status,
    COUNT(DISTINCT c.idUtilisateur) AS count
FROM 
    compteUtilisateur c
JOIN 
    utilisateur u ON c.idUtilisateur = u.idUtilisateur
WHERE 
    c.createdAt IN (
        SELECT MAX(createdAt)
        FROM compteUtilisateur
        GROUP BY idUtilisateur
    )
GROUP BY 
    u.role, u.status;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs :', err.message);
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
    }
    res.status(200).json(results); // Renvoie les résultats
  });
};

export const userDiscu = (req, res) => {
  const { idUtilisateur } = req.query;
  console.log("idUtilisateur reçu :", idUtilisateur);

  // Requête pour récupérer les utilisateurs associés + le DAF
  const query = `
    SELECT DISTINCT u.* 
    FROM utilisateur u
    JOIN tache t ON u.idUtilisateur = t.id_responsable
    JOIN projetpropose p ON t.id_projet = p.id_projet
    WHERE p.id_responsable = ? 
    AND u.role IN ('Employé', 'DAF')

    UNION

    SELECT DISTINCT u.*
    FROM utilisateur u
    WHERE u.role = 'DAF';
  `;

  db.query(query, [idUtilisateur], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs associés :', err.message);
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
    }
    res.status(200).json(results);
  });
};


export const allUserDiscu = (req, res) => {
  const { idUtilisateur } = req.query; // L'ID de Sophie, ici 3

  if (!idUtilisateur) {
    return res.status(400).json({ message: "L'ID de l'utilisateur est manquant" });
  }

  console.log("ID Utilisateur connecté :", idUtilisateur);

  const chefProjetQuery = `
    SELECT u.* 
    FROM utilisateur u
    JOIN projetpropose p ON p.id_responsable = u.idUtilisateur
    JOIN tache t ON t.id_projet = p.id_projet
    WHERE t.id_responsable = ? AND u.role = 'Chef de projet'
    LIMIT 1
  `;

  const coequipiersQuery = `
  SELECT DISTINCT u.*
  FROM utilisateur u
  JOIN tache t ON t.id_responsable = u.idUtilisateur
  JOIN projetpropose p ON p.id_projet = t.id_projet
  WHERE p.id_responsable IN (
    SELECT p2.id_responsable
    FROM projetpropose p2
    JOIN tache t2 ON p2.id_projet = t2.id_projet
    WHERE t2.id_responsable = ?
  ) 
  AND u.idUtilisateur != ? 
  AND u.role = 'Employé'
`;

  try {
    db.query(chefProjetQuery, [idUtilisateur], (err, chefResult) => {
      if (err) {
        console.error("Erreur lors de la récupération du chef de projet :", err.message);
        return res.status(500).json({ message: "Erreur lors de la récupération du chef de projet." });
      }

      db.query(coequipiersQuery, [idUtilisateur, idUtilisateur], (err, coequipiersResult) => {
        if (err) {
          console.error("Erreur lors de la récupération des coéquipiers :", err.message);
          return res.status(500).json({ message: "Erreur lors de la récupération des coéquipiers." });
        }

        res.status(200).json({
          chefProjet: chefResult[0] || null,
          coequipiers: coequipiersResult
        });
      });
    });
  } catch (error) {
    console.error("Erreur interne :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export const allProjectManagers = (req, res) => {
  const { status } = req.query; // Permet de filtrer par statut (optionnel)

  let query = `
    SELECT 
      u.idUtilisateur, 
      u.nom, 
      u.prenom, 
      u.email, 
      u.profile, 
      u.createdAt, 
      u.updatedAt, 
      u.role, 
      u.genre, 
      u.status
    FROM 
      utilisateur u
    WHERE 
      u.role = 'Chef de projet'
  `;

  // Ajouter un filtre de statut si fourni
  if (status) {
    query += ` AND u.status = ?`;
  }

  db.query(query, [status].filter(Boolean), (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des chefs de projet :", err.message);
      return res.status(500).json({
        message: "Erreur interne du serveur lors de la récupération des chefs de projet.",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Aucun chef de projet trouvé.",
      });
    }

    res.status(200).json({
      message: "Chefs de projet récupérés avec succès.",
      data: results,
    });
  });
};
