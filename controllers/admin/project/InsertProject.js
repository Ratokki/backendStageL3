import { db } from "../../../config/bd.js";

// Fonction pour ajouter un projet
export const addProject = (req, res) => {
  const { titre, sigle, description, budget, raison_proposition, date_proposition, latitude, longitude, lieu } = req.body;

  // Requête SQL pour insérer le projet
  const query = 'INSERT INTO projetPropose (titre, sigle, description, budget, raison_proposition, date_proposition, latitude, longitude, lieu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  
  db.query(query, [titre, sigle, description, budget, raison_proposition, date_proposition, latitude, longitude, lieu], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'insertion du projet:', err);
      return res.status(500).json({ message: 'Erreur lors de l\'insertion du projet.' });
    }
    res.status(201).json({ message: 'Projet ajouté avec succès !', id: result.insertId });
  });
};