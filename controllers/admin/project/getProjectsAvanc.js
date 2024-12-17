import { db } from "../../../config/bd.js";

export const selectProjectsAvanc = (req, res) => {
  const query = `
    SELECT pa.*, p.titre, u.nom AS nom_responsable, u.prenom AS prenom_responsable, 
           u.profile AS profile_utilisateur, pa.pourcentage
    FROM projetAvancement pa
    INNER JOIN (
      SELECT id_projet, MAX(date_debut) AS max_date
      FROM projetAvancement
      GROUP BY id_projet
    ) latest ON pa.id_projet = latest.id_projet AND pa.date_debut = latest.max_date
    INNER JOIN projetPropose p ON pa.id_projet = p.id_projet
    LEFT JOIN utilisateur u ON p.id_responsable = u.idUtilisateur
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des projets:', err.message);
      return res.status(500).json({ message: 'Erreur lors de la récupération des projets.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Aucun projet trouvé.' });
    }

    res.status(200).json(results);
  });
};
// Nouvelle fonction pour récupérer les tâches associées à un projet spécifique
export const getTasksByProject = (req, res) => {
  const { id_projet } = req.params;

  const query = `
      SELECT t.*, u.nom AS nom_responsable, u.prenom AS prenom_responsable, u.profile AS profile_responsable
      FROM tache t
      LEFT JOIN utilisateur u ON t.id_responsable = u.idUtilisateur 
      WHERE t.id_projet = ?
  `;

  db.query(query, [id_projet], (err, results) => {
      if (err) {
          console.error('Erreur lors de la récupération des tâches du projet:', err.message);
          return res.status(500).json({ message: 'Erreur lors de la récupération des tâches.' });
      }
      res.status(200).json(results);
  });
};

// Fonction pour créer des tâches associées à un projet
export const createTasksByProject = async (req, res) => {
  const {
    titre,
    statut,
  } = req.body;

  const { id_projet } = req.params;

  const date_creation = new Date();
  const date_debut = null;
  const date_limite = null;

  const query = `
    INSERT INTO tache (titre, date_creation, date_debut, date_limite, statut, id_projet)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    titre,
    date_creation,
    date_debut,
    date_limite,
    statut || "En création",
    id_projet,
  ];

  try {
    const result = await db.query(query, values);
    res.status(201).json({ message: 'Tâche créée avec succès', taskId: result.insertId });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la tâche:", error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la tâche' });
  }
};


export const taskAssign = async (req, res) => {
  const { id, id_responsable, date_debut, duree, priorite } = req.body;

  // Convertir la date en DateTime en ajoutant l'heure de 7h00
  const dateDebutWithTime = new Date(date_debut);
  dateDebutWithTime.setHours(7, 0, 0, 0); // Heure à 7:00

  // Requête SQL pour mettre à jour les champs d'une tâche, y compris le statut
  const query = `
    UPDATE tache 
    SET id_responsable = ?, date_debut = ?, duree = ?, priorite = ?, statut = 'À faire' 
    WHERE id = ?
  `;

  const values = [id_responsable, dateDebutWithTime, duree, priorite, id];

  try {
    const result = await db.query(query, values);

    if (result && result.affectedRows === 0) { 
      return res.status(404).json({ message: 'Tâche non trouvée.' });
    }
    
    res.status(200).json({ message: 'Tâche assignée avec succès à l\'utilisateur', taskId: id });
  } catch (error) {
    console.error("Erreur lors de l'assignation de la tâche:", error);
    res.status(500).json({ error: 'Erreur lors de l\'assignation de la tâche' });
  }
};




// Nouvelle fonction pour récupérer les employés disponibles avec leurs tâches non terminées
export const employeeAvailable = (req, res) => {
  const query = `
    SELECT u.idUtilisateur, u.nom, u.prenom, COUNT(t.id) AS nombre_taches FROM utilisateur u LEFT JOIN tache t ON u.idUtilisateur = t.id_responsable AND t.statut IN ('À faire', 'En cours') WHERE u.status = 'Accepté' AND u.role = 'Employé' GROUP BY u.idUtilisateur;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des employés disponibles:", err.message);
      return res.status(500).json({ message: 'Erreur lors de la récupération des employés disponibles.' });
    }
    res.status(200).json(results);
  });
};
