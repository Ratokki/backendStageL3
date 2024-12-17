import { db } from "../../../config/bd.js";

// Changer le statut d'un utilisateur
export const acceptUser = (req, res) => {
  const idUtilisateur = req.params.idUtilisateur; // Récupérer l'ID de l'utilisateur à partir des paramètres de la requête

  // Vérifier le statut actuel de l'utilisateur
  db.query("SELECT status FROM utilisateur WHERE idUtilisateur = ?", [idUtilisateur], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération du statut de l\'utilisateur:', err.message);
      return res.status(500).json({ message: 'Erreur lors de la récupération du statut.' });
    }

    // Vérifier si l'utilisateur a été trouvé
    if (results.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Déterminer le nouveau statut
    const currentStatus = results[0].status;
    const newStatus = currentStatus === 'Accepté' ? 'Rejeté' : 'Accepté';

    // Mettre à jour le statut de l'utilisateur
    db.query("UPDATE utilisateur SET status = ? WHERE idUtilisateur = ?", [newStatus, idUtilisateur], (err) => {
      if (err) {
        console.error('Erreur lors de la mise à jour du statut de l\'utilisateur:', err.message);
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du statut.' });
      }

      // Si le nouvel statut est 'Accepté', ajouter le compte utilisateur
      if (newStatus === 'Accepté') {
        db.query("INSERT INTO compteutilisateur (idUtilisateur) VALUES (?)", [idUtilisateur], (err) => {
          if (err) {
            console.error('Erreur lors de l\'ajout du compte utilisateur:', err.message);
            return res.status(500).json({ message: 'Erreur lors de l\'ajout du compte utilisateur.' });
          }
          return res.status(200).json({ message: 'Utilisateur accepté et compte ajouté avec succès.' });
        });
      } else {
        res.status(200).json({ message: 'Statut de l\'utilisateur mis à jour avec succès.' });
      }
    });
  });
};
