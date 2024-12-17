  import { db } from "../../../config/bd.js";

  export const updateProject = (req, res) => {
    const id_projet = req.params.id_projet; // Récupérer l'ID du projet de l'URL
    const { titre, sigle, date_proposition, budget, statut } = req.body; // Extraire les données du corps de la requête
  
    // Requête pour mettre à jour le projet
    const updateQuery = `
      UPDATE projetPropose
      SET titre = ?, sigle = ?, date_proposition = ?, budget = ?,
          date_acceptation = CASE WHEN statut = 'Accepté' THEN CURDATE() ELSE date_acceptation END
      WHERE id_projet = ?
    `;
  
    db.query(updateQuery, [titre, sigle, date_proposition, budget, id_projet], (err, results) => {
      if (err) {
        console.error('Erreur lors de la mise à jour du projet:', err.message);
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du projet.' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Projet non trouvé.' });
      }
  
      // Vérifier si le statut a été mis à jour à "Accepté"
      if (statut === 'Accepté') {
        // Récupérer les détails du projet proposé pour insertion dans projetAvancement
        const selectQuery = `SELECT titre, sigle, lieu, latitude, longitude FROM projetPropose WHERE id_projet = ?`;
  
        db.query(selectQuery, [id_projet], (err, projetResults) => {
          if (err) {
            console.error('Erreur lors de la récupération du projet proposé:', err.message);
            return res.status(500).json({ message: 'Erreur lors de la récupération du projet proposé.' });
          }
  
          if (projetResults.length === 0) {
            return res.status(404).json({ message: 'Aucun projet trouvé.' });
          }
  
          const projetData = projetResults[0];
          const insertQuery = `
            INSERT INTO projetavancement (id_projet, titre, sigle, lieu, latitude, longitude, budget, date_debut, statut)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), 'À faire')
          `;
  
          const dataToInsert = [
            id_projet,
            projetData.titre,
            projetData.sigle,
            projetData.lieu,
            projetData.latitude,
            projetData.longitude,
            budget,
          ];
  
          db.query(insertQuery, dataToInsert, (err) => {
            if (err) {
              console.error('Erreur lors de l\'insertion dans projetavancement:', err.message);
              return res.status(500).json({ message: 'Erreur lors de l\'insertion dans projetavancement.' });
            }
          });
        });
      }
  
      res.status(200).json({ message: 'Projet mis à jour avec succès.' });
    });
  };

// Exporter la fonction pour récupérer tous les projets dans projetAvancement
export const getAllAvancementProjects = (req, res) => {
    const query = `SELECT * FROM projetavancement`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des projets dans projetAvancement:', err.message);
            return res.status(500).json({ message: 'Erreur lors de la récupération des projets.' });
        }

        res.status(200).json(results);
    });
};

// Fonction pour accepter un projet
export const statusAccept = (req, res) => {
  const id_projet = req.params.id_projet;

  const statut = 'Accepté'; // Mettre à jour le statut à 'Accepté'

  const updateQuery = `
    UPDATE projetPropose
    SET statut = ? , date_acceptation = NOW() 
    WHERE id_projet = ?
  `;

  db.query(updateQuery, [statut, id_projet], (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'acceptation du projet:', err.message);
      return res.status(500).json({ message: 'Erreur lors de l\'acceptation du projet.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Projet non trouvé.' });
    }

    // Insérer dans projetAvancement avec date et heure actuelles
    const insertQuery = `
      INSERT INTO projetAvancement (id_projet, titre, sigle, lieu, latitude, longitude, budget, date_debut, statut)
      SELECT id_projet, titre, sigle, lieu, latitude, longitude, budget, NOW(), 'À faire'
      FROM projetPropose
      WHERE id_projet = ?
    `;

    db.query(insertQuery, [id_projet], (err) => {
      if (err) {
        console.error('Erreur lors de l\'insertion dans projetAvancement:', err.message);
        return res.status(500).json({ message: 'Erreur lors de l\'insertion dans projetAvancement.' });
      }

      res.status(200).json({ message: 'Projet accepté avec succès et inséré dans projetAvancement.' });
    });
  });
};


export const statusRejet = (req, res) => {
  const id_projet = req.params.id_projet;

  const statut = 'Refusé'; // Mettre à jour le statut à 'Refusé'

  // Mettre à jour le statut du projet dans la table projetPropose
  const updateQuery = `
    UPDATE projetPropose
    SET statut = ? , date_refus = NOW() 
    WHERE id_projet = ?
  `;

  db.query(updateQuery, [statut, id_projet], (err, results) => {
    if (err) {
      console.error('Erreur lors du rejet du projet:', err.message);
      return res.status(500).json({ message: 'Erreur lors du rejet du projet.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Projet non trouvé.' });
    }

    // Supprimer le projet de la table projetAvancement
    const deleteQuery = `
      DELETE FROM projetAvancement
      WHERE id_projet = ?
    `;

    db.query(deleteQuery, [id_projet], (err) => {
      if (err) {
        console.error('Erreur lors de la suppression du projet dans projetAvancement:', err.message);
        return res.status(500).json({ message: 'Erreur lors de la suppression du projet dans projetAvancement.' });
      }

      res.status(200).json({ message: 'Projet rejeté avec succès et supprimé de projetAvancement.' });
    });
  });
};
