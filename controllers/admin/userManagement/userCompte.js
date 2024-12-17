import { db } from "../../../config/bd.js";

// Récupérer tous les utilisateurs dans compteUtilisateur
export const selectAccountUsers = (req, res) => {
  const query = `
    SELECT u.idUtilisateur, u.nom, u.prenom, u.email, u.role, c.createdAt, u.profile, u.status
    FROM compteUtilisateur c
    JOIN utilisateur u ON c.idUtilisateur = u.idUtilisateur
    WHERE c.createdAt = (
      SELECT MAX(createdAt)
      FROM compteUtilisateur
      WHERE idUtilisateur = c.idUtilisateur
    )
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs :', err.message);
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
    }
    res.status(200).json(results); // Renvoie les résultats
  });
};


// Bloquer ou débloquer un utilisateur
export const userStatus = (req, res) => {
  const { idUtilisateur } = req.params;

  // Récupérer l'utilisateur actuel pour déterminer son statut
  const querySelect = 'SELECT status FROM utilisateur WHERE idUtilisateur = ?';
  
  db.query(querySelect, [idUtilisateur], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération du statut de l\'utilisateur :', err.message);
      return res.status(500).json({ message: 'Erreur lors de la récupération du statut.' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Déterminer le nouveau statut
    const currentStatus = results[0].status;
    const newStatus = currentStatus === 'Rejeté' ? 'Accepté' : 'Rejeté';

    // Mettre à jour le statut de l'utilisateur
    const queryUpdate = 'UPDATE utilisateur SET status = ? WHERE idUtilisateur = ?';

    db.query(queryUpdate, [newStatus, idUtilisateur], (err) => {
      if (err) {
        console.error('Erreur lors de la mise à jour du statut de l\'utilisateur :', err.message);
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du statut.' });
      }
      res.status(200).json({ message: `Utilisateur ${newStatus === 'Rejeté' ? 'bloqué' : 'débloqué'} avec succès.` });
    });
  });
};
