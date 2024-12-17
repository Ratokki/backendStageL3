import { db } from "../../../config/bd.js";


export const getTaskUser = (req, res) => {
    const { userId } = req.query;

    const query = `
        SELECT 
            t.*, 
            CASE
                WHEN t.statut = 'En cours' THEN 1
                WHEN CURDATE() < DATE(t.date_debut) THEN 2  -- À venir
                WHEN t.statut = 'À faire' THEN 3           -- Non commencé mais dans la période
                WHEN t.statut = 'Terminé' THEN 4
                ELSE 5
            END AS tri_statut
        FROM tache t
        WHERE t.id_responsable = ?
        ORDER BY tri_statut ASC, t.date_debut ASC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des tâches de l'utilisateur:", err.message);
            return res.status(500).json({ message: "Erreur lors de la récupération des tâches." });
        }
        res.status(200).json(results);
    });
};



export const taskNowForUser = (req, res) => {
    console.log("Received request for user ID:", req.query.userId); // Log pour vérification
    const { userId } = req.query;

    const query = `
        SELECT 
            t.id, 
            t.titre, 
            t.date_debut, 
            t.duree, 
            t.statut, 
            t.pourcentage_avancement,
            DATEDIFF(CURDATE(), t.date_debut) + 1 AS jours_ecoules, 
            t.duree - (DATEDIFF(CURDATE(), t.date_debut) + 1) AS jours_restants, 
            t.jours_de_retard 
        FROM tache t
        LEFT JOIN rapport_journalier r 
        ON t.id = r.id_tache 
        AND DATE(r.date_rapport) = CURDATE() 
        WHERE t.date_debut IS NOT NULL 
        AND t.statut <> 'Terminé' 
        AND t.pourcentage_avancement < 100  -- Exclut les tâches terminées
        AND t.id_responsable = ? 
        AND CURDATE() >= DATE(t.date_debut)
        AND (
            (DATEDIFF(CURDATE(), t.date_debut) + 1 <= t.duree + t.jours_de_retard)
            OR t.statut IN ('À faire', 'En cours')
        )
        AND r.id_rapport IS NULL`; // Vérifie qu'aucun rapport du jour n'existe

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des tâches:", err.message);
            return res.status(500).json({ message: "Erreur lors de la récupération des tâches." });
        }
        res.status(200).json(results);
    });
};



// backend: fonction pour initialiser la date de début d'une tâche

export const startTask = (req, res) => {
    const { taskId } = req.body; // Récupérer l'ID de la tâche depuis le corps de la requête
    const now = new Date(); // Date et heure actuelles

    // Récupérer la durée pour calculer la date limite
    const selectQuery = `SELECT duree FROM tache WHERE id = ?`;

    db.query(selectQuery, [taskId], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération de la durée :", err.message);
            return res.status(500).json({ message: "Erreur lors de la récupération de la durée de la tâche." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Tâche introuvable." });
        }

        const duree = results[0].duree;
        
        // Calcul de `date_limite` en ajoutant `duree` jours à `date_debut`
        const dateLimite = new Date(now);
        dateLimite.setDate(dateLimite.getDate() + duree);

        const updateQuery = `UPDATE tache SET date_debut = ?, date_limite = ? WHERE id = ? AND date_debut IS NULL`;

        db.query(updateQuery, [now, dateLimite, taskId], (err, results) => {
            if (err) {
                console.error("Erreur lors de la mise à jour de la tâche :", err.message);
                return res.status(500).json({ message: "Erreur lors de la mise à jour de la tâche." });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "La tâche est déjà commencée ou introuvable." });
            }
            res.status(200).json({ message: "Tâche commencée avec succès.", date_debut: now, date_limite: dateLimite });
        });
    });
};

export const statusTask = (req, res) => {
    const { projectId } = req.params; // Récupère l'ID du projet depuis les paramètres de l'URL

    const query = `
        SELECT statut, COUNT(*) AS count
        FROM tache
        WHERE id_projet = ?
        GROUP BY statut
    `;

    db.query(query, [projectId], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des statuts des tâches :", err.message);
            return res.status(500).json({ message: "Erreur lors de la récupération des statuts des tâches." });
        }
        res.status(200).json(results);
    });
};

