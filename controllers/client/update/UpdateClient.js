import { db } from "../../../config/bd.js";

export const updateUser = (req, res) => {
  const UserId = req.params.idUtilisateur;

  // Debug : afficher les données reçues
  console.log("Requête reçue : ", req.body);
  console.log("Fichier reçu : ", req.file);

  // Si un fichier est uploadé, construisez l'URL du nouveau profil
  let profileUrl = req.body.profile; // garder l'ancienne image si aucun nouveau fichier n'est uploadé
  if (req.file) {
    profileUrl = `uploads/${req.file.filename}`; // Mettre à jour l'URL si un nouveau fichier est uploadé
  }

  // Requête SQL pour récupérer l'ancienne image si aucun nouveau fichier n'est envoyé
  const getOldProfileQuery = "SELECT profile FROM utilisateur WHERE idUtilisateur = ?";
  
  db.query(getOldProfileQuery, [UserId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la récupération de l'image existante :", err);
      return res.status(500).json({ message: "Erreur lors de la récupération de l'image existante", error: err });
    }

    // Utiliser l'ancienne image si aucun fichier n'a été uploadé
    if (!req.file && result.length > 0) {
      profileUrl = result[0].profile; // Garder l'ancienne image
    }

    // Requête SQL pour mettre à jour l'utilisateur
    const updateQuery = "UPDATE utilisateur SET `nom`=?, `prenom`=?, `email`=?, `profile`=?, `role`=?, `genre`=? WHERE `idUtilisateur`=?";
    const values = [
      req.body.nom,
      req.body.prenom,
      req.body.email,
      profileUrl,
      req.body.role,
      req.body.genre
    ];

    // Exécuter la requête SQL pour mettre à jour l'utilisateur
    db.query(updateQuery, [...values, UserId], (err, data) => {
      if (err) {
        console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
        return res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur", error: err });
      }

      // Retourner une réponse avec succès et l'URL du nouveau profil
      res.json({
        message: "Utilisateur mis à jour avec succès",
        profileUrl
      });
    });
  });
};
