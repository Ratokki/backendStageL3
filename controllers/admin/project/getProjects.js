import { db } from "../../../config/bd.js";

export const selectProjects = (req, res) => {
  const id_projet = req.query.id_projet; // Récupérer l'ID du projet de la requête

  // Prépare la requête SQL en fonction de la présence de l'ID
  const query = id_projet
    ? "SELECT * FROM projetPropose WHERE id_projet = ?"
    : "SELECT * FROM projetPropose";

  db.query(query, id_projet ? [id_projet] : [], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des projets:', err.message);
      return res.status(500).json({ message: 'Erreur lors de la récupération des projets.' });
    }
    res.status(200).json(results); // Renvoie les résultats
  });
};

export const selectPendingProjects = (req, res) => {
  const query = `
    SELECT *, 
           (SELECT COUNT(*) FROM projetPropose WHERE statut = 'En attente') AS count 
    FROM projetPropose 
    WHERE statut = 'En attente'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des projets en attente :", err.message);
      return res.status(500).json({ message: "Erreur lors de la récupération des projets en attente." });
    }
    // Renvoie la liste des projets ainsi que le compteur
    const count = results.length > 0 ? results[0].count : 0;
    res.status(200).json({ count, projets: results });
  });
};


//Projet aujourdh'ui pour le chef de projet 

// Nouvelle fonction pour afficher le projet ayant lieu aujourd'hui
// Nouvelle fonction pour récupérer les projets de l'utilisateur ayant lieu aujourd'hui
export const projectNow = (req, res) => {
  const userId = req.query.userId; // ID de l'utilisateur, récupéré depuis la requête

  if (!userId) {
    return res.status(400).json({ message: "L'ID de l'utilisateur est requis." });
  }

  // Requête pour récupérer les projets ayant lieu aujourd'hui et dont l'utilisateur est responsable
  const query = `
    SELECT 
      p.id_projet,
      p.titre,
      pa.date_debut AS date_debut_projet,
      pa.date_echeance AS date_fin_projet,
      pa.statut AS statut_avancement,
      pa.pourcentage AS pourcentage_avancement
    FROM 
      projetPropose p
    JOIN 
      projetAvancement pa ON p.id_projet = pa.id_projet
    JOIN 
      utilisateur u ON p.id_responsable = u.idUtilisateur
    WHERE 
      CURDATE() BETWEEN DATE(pa.date_debut) AND DATE(pa.date_echeance)
      AND u.idUtilisateur = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération du projet d'aujourd'hui pour l'utilisateur:", err.message);
      return res.status(500).json({ message: "Erreur lors de la récupération du projet d'aujourd'hui." });
    }

    if (results.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(results); // Renvoie les projets en cours aujourd'hui pour l'utilisateur
  });
};


//Voir le rapport des taches d'un projet 
export const allRapport = (req, res) => {
  const projectId = req.params.idProjet; // Récupération de l'ID du projet depuis les paramètres de la route

  if (!projectId) {
    return res.status(400).json({ message: "L'ID du projet est requis." });
  }

  // Requête SQL pour récupérer les rapports du projet avec l'ID passé
  const query = `
  SELECT 
    r.id_rapport,
    r.id_tache,
    r.id_employe,
    r.date_rapport,
    r.heures_travaillees,
    r.pourcentage_avancement,
    r.retard_jours,
    r.commentaire,
    u.nom AS nom_employe,
    u.prenom AS prenom_employe,
    u.profile AS profil_employe,
    t.titre
FROM 
    rapport_journalier r
JOIN 
    tache t ON r.id_tache = t.id
JOIN 
    utilisateur u ON r.id_employe = u.idUtilisateur
WHERE 
    t.id_projet = ?
AND 
    r.id_rapport IN (
        SELECT MAX(r1.id_rapport)
        FROM rapport_journalier r1
        GROUP BY r1.id_tache
    )
ORDER BY 
    r.id_tache ASC;

`;


  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des rapports :", err.message);
      return res.status(500).json({ message: "Erreur lors de la récupération des rapports." });
    }

    res.status(200).json(results); // Renvoie les rapports du projet
  });
};


// Nouvelle fonction pour récupérer uniquement les projets "Acceptés"
export const getAccept = (req, res) => {
    // Requête SQL pour récupérer les projets acceptés avec les informations de l'utilisateur responsable
    const query = `
        SELECT p.*, u.nom AS nom_responsable, u.prenom AS prenom_responsable, u.profile AS profile_responsable
        FROM projetPropose p
        LEFT JOIN utilisateur u ON p.id_responsable = u.idUtilisateur
        WHERE p.statut = 'Accepté'
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des projets acceptés:', err.message);
            return res.status(500).json({ message: 'Erreur lors de la récupération des projets acceptés.' });
        }
        res.status(200).json(results); // Renvoie les résultats des projets acceptés
    });
};


export const projectStats = (req, res) => {
  // Requête pour les projets en cours, terminés et à faire dans projetAvancement (sans doublons d'id_projet)
  const avancementQuery = `
    SELECT 
      COUNT(DISTINCT CASE WHEN statut = 'En cours' THEN id_projet END) AS projets_en_cours,
      COUNT(DISTINCT CASE WHEN statut = 'Terminé' THEN id_projet END) AS projets_termine,
      COUNT(DISTINCT CASE WHEN statut = 'À faire' THEN id_projet END) AS projets_faire,
      COUNT(DISTINCT id_projet) AS total_avancement 
    FROM projetAvancement`;

  // Requête pour les projets proposés
  const proposeQuery = `
    SELECT 
      COUNT(*) AS projets_proposes
    FROM projetPropose`;

  // Exécuter la requête pour projetAvancement
  db.query(avancementQuery, (errAv, resultsAv) => {
    if (errAv) {
      console.error("Erreur lors de la récupération des statistiques d'avancement:", errAv.message);
      return res.status(500).json({ message: "Erreur lors de la récupération des statistiques d'avancement." });
    }

    // Exécuter la requête pour projetPropose
    db.query(proposeQuery, (errPro, resultsPro) => {
      if (errPro) {
        console.error("Erreur lors de la récupération des statistiques de projets proposés:", errPro.message);
        return res.status(500).json({ message: "Erreur lors de la récupération des statistiques de projets proposés." });
      }

      const stats = {
        projets_en_cours: resultsAv[0].projets_en_cours,
        projets_termine: resultsAv[0].projets_termine,
        projets_faire: resultsAv[0].projets_faire,
        total_avancement: resultsAv[0].total_avancement,  // Total des projets uniques dans projetAvancement
        projets_proposes: resultsPro[0].projets_proposes,
      };

      res.status(200).json(stats); // Renvoie les statistiques
    });
  });
};


export const selectionProject = (req, res) => {
  const id_projet = req.query.id_projet; // Récupérer l'ID du projet de la requête

  // Prépare la requête SQL en fonction de la présence de l'ID
  // Filtrer uniquement les projets acceptés

  const query = id_projet
  ? `
      SELECT p.*, 
             u.profile,
             u.nom,
             u.prenom,
             pa.statut AS statut_avancement, 
             pa.pourcentage AS pourcentage_avancement,
             MAX(pa.date_debut) AS date_debut, 
             MAX(pa.date_echeance) AS date_echeance,
             SUM(t.jours_de_retard) AS total_retard,
             SUM(t.duree) AS total_duree
      FROM projetPropose AS p 
      LEFT JOIN utilisateur AS u ON p.id_responsable = u.idUtilisateur
      LEFT JOIN projetAvancement AS pa ON p.id_projet = pa.id_projet
      LEFT JOIN tache AS t ON p.id_projet = t.id_projet
      WHERE p.id_projet = ?
      GROUP BY p.id_projet
    `
  : `
      SELECT p.*, 
             u.profile,
             u.nom,
             u.prenom,
             pa.statut AS statut_avancement, 
             pa.pourcentage AS pourcentage_avancement,
             MAX(pa.date_debut) AS date_debut, 
             MAX(pa.date_echeance) AS date_echeance,
             SUM(t.jours_de_retard) AS total_retard,
             SUM(t.duree) AS total_duree
      FROM projetPropose AS p
      LEFT JOIN utilisateur AS u ON p.id_responsable = u.idUtilisateur
      LEFT JOIN projetAvancement AS pa ON p.id_projet = pa.id_projet
      LEFT JOIN tache AS t ON p.id_projet = t.id_projet
      WHERE p.statut = 'Accepté'
      GROUP BY p.id_projet
    `;


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

// Récupérer les projets d'un utilisateur (par ID)
export const getProjectsByUser = (req, res) => {
  const userId = req.query.userId; // ID de l'utilisateur, récupéré depuis la requête

  if (!userId) {
    return res.status(400).json({ message: "L'ID de l'utilisateur est requis." });
  }

  // Requête pour récupérer les projets où l'utilisateur est responsable
  const query = `
    SELECT p.*, u.nom AS nom_responsable, u.prenom AS prenom_responsable, pa.statut AS statut_avancement, pa.date_debut AS date_debut_avancement, pa.date_echeance AS date_fin_cible ,pa.priorite AS priorite_avancement FROM projetPropose p LEFT JOIN utilisateur u ON p.id_responsable = u.idUtilisateur LEFT JOIN projetAvancement pa ON p.id_projet = pa.id_projet AND pa.date_debut = (SELECT MAX(date_debut) FROM projetAvancement WHERE id_projet = p.id_projet) WHERE u.idUtilisateur = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des projets de l\'utilisateur:', err.message);
      return res.status(500).json({ message: 'Erreur lors de la récupération des projets.' });
    }

    if (results.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(results); // Renvoie les projets associés à cet utilisateur
  });
};

export const budgetCount = (req, res) => {
  const budgetAcceptQuery = `
    SELECT 
      'Tous' AS type_projet,
      SUM(budget) AS total_budget
    FROM projetPropose
    WHERE statut = 'Accepté'
    UNION ALL
    SELECT 
      type_projet,
      SUM(budget) AS total_budget
    FROM projetPropose
    WHERE statut = 'Accepté'
    GROUP BY type_projet`;

  db.query(budgetAcceptQuery, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération du budget des projets acceptés par type:", err.message);
      return res.status(500).json({ message: "Erreur lors de la récupération du budget des projets acceptés par type." });
    }

    const budgets = results.map(row => ({
      type_projet: row.type_projet,
      total_budget: row.total_budget || 0
    }));

    res.status(200).json({ budgets });
  });
};

export const getProjectWeeklyProgress = (req, res) => {
  const { id_projet, startDate, endDate } = req.query;

  // Vérification des paramètres requis
  if (!id_projet) {
    return res.status(400).json({ message: "ID du projet requis." });
  }

  if (!startDate || !endDate) {
    return res.status(400).json({ message: "Les dates de début et de fin sont requises." });
  }

  const query = `
    SELECT jours_semaine.jour_nom, COALESCE(rapport.pourcentage_avancement_jour, 0) AS pourcentage_avancement_jour
    FROM (
        SELECT 'lundi' AS jour_nom, DATE_ADD(DATE(?), INTERVAL -WEEKDAY(DATE(?)) DAY) AS jour_date
        UNION ALL
        SELECT 'mardi', DATE_ADD(DATE(?), INTERVAL -WEEKDAY(DATE(?)) + 1 DAY)
        UNION ALL
        SELECT 'mercredi', DATE_ADD(DATE(?), INTERVAL -WEEKDAY(DATE(?)) + 2 DAY)
        UNION ALL
        SELECT 'jeudi', DATE_ADD(DATE(?), INTERVAL -WEEKDAY(DATE(?)) + 3 DAY)
        UNION ALL
        SELECT 'vendredi', DATE_ADD(DATE(?), INTERVAL -WEEKDAY(DATE(?)) + 4 DAY)
        UNION ALL
        SELECT 'samedi', DATE_ADD(DATE(?), INTERVAL -WEEKDAY(DATE(?)) + 5 DAY)
        UNION ALL
        SELECT 'dimanche', DATE_ADD(DATE(?), INTERVAL -WEEKDAY(DATE(?)) + 6 DAY)
    ) AS jours_semaine
    LEFT JOIN (
        SELECT DATE(r.date_rapport) AS jour_date,
               SUM((r.heures_travaillees / (t.duree * 8)) * 100) / COUNT(t.id) AS pourcentage_avancement_jour
        FROM projetpropose p
        JOIN tache t ON p.id_projet = t.id_projet
        JOIN rapport_journalier r ON t.id = r.id_tache
        WHERE r.date_rapport BETWEEN DATE(?) AND DATE(?)
        AND p.id_projet = ?
        GROUP BY DATE(r.date_rapport)
    ) AS rapport ON jours_semaine.jour_date = rapport.jour_date
    ORDER BY jours_semaine.jour_date;
`;

// Exécution de la requête avec les paramètres
db.query(
    query,
    [
        startDate, startDate, // Pour lundi
        startDate, startDate, // Pour mardi
        startDate, startDate, // Pour mercredi
        startDate, startDate, // Pour jeudi
        startDate, startDate, // Pour vendredi
        startDate, startDate, // Pour samedi
        startDate, startDate, // Pour dimanche
        startDate, endDate, id_projet
    ],
    (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération de l'avancement hebdomadaire :", err.message);
            return res.status(500).json({ message: "Erreur lors de la récupération de l'avancement." });
        }
        res.status(200).json(results); // Renvoie les résultats d'avancement
    }
);
};



// Export pour récupérer l'avancement quotidien
export const getProjectDailyProgress = (req, res) => {
  const { id_projet, date } = req.query;

  if (!id_projet || !date) {
    return res.status(400).json({ message: "ID du projet et date requis." });
  }

  // Requête SQL pour récupérer l'avancement pour la date spécifiée
  const query = `
    SELECT 
        p.id_projet,
        DATE(r.date_rapport) AS jour,
        SUM((r.heures_travaillees / (t.duree * 8)) * 100) / COUNT(t.id) AS pourcentage_avancement
    FROM 
        projetpropose p
    JOIN 
        tache t ON p.id_projet = t.id_projet
    JOIN 
        rapport_journalier r ON t.id = r.id_tache
    WHERE 
        DATE(r.date_rapport) = ?
        AND p.id_projet = ?
    GROUP BY 
        p.id_projet, DATE(r.date_rapport);
  `;

  db.query(query, [date, id_projet], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération de l'avancement quotidien :", err.message);
      return res.status(500).json({ message: "Erreur lors de la récupération de l'avancement quotidien." });
    }
    if (results.length === 0) {
      // Si aucun rapport n'est trouvé pour la date, renvoyer un avancement de 0%
      return res.status(200).json({ pourcentage_avancement: 0 });
    }
    res.status(200).json(results[0]); // Renvoie l'avancement de la journée sélectionnée
  });
};

export const countTaskStatusByProject = (req, res) => {
  const id_projet = req.params.id_projet; // Utilisez req.params ici

  if (!id_projet) {
    return res.status(400).json({ message: "L'ID du projet est requis." });
  }

  const query = `
    SELECT statut, COUNT(*) AS count
    FROM tache
    WHERE id_projet = ?
    GROUP BY statut
  `;

  db.query(query, [id_projet], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération du nombre de tâches par statut:", err.message);
      return res.status(500).json({ message: "Erreur lors de la récupération des tâches." });
    }

    // Structure les résultats pour faciliter l'utilisation dans le frontend
    const statusCounts = {
      aFaire: 0,
      enCours: 0,
      termine: 0,
      enCreation: 0,
    };

    results.forEach(row => {
      if (row.statut === "À faire") statusCounts.aFaire = row.count;
      if (row.statut === "En cours") statusCounts.enCours = row.count;
      if (row.statut === "Terminé") statusCounts.termine = row.count;
      if (row.statut === "En création") statusCounts.enCreation = row.count;
    });

    res.status(200).json(statusCounts);
  });
};
