import { db } from "../../../config/bd.js";

export const insertReport = (req, res) => {
    const { id_tache, id_employe, heures_travaillees, commentaire } = req.body;

    // Étape 1: Récupérer la durée et l'avancement actuel de la tâche
    const getDurationQuery = `SELECT duree, pourcentage_avancement, id_projet FROM tache WHERE id = ?`;
    db.query(getDurationQuery, [id_tache], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération de la durée :", err.message);
            return res.status(500).json({ message: "Erreur lors de la récupération de la durée." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Tâche non trouvée." });
        }

        const { duree, pourcentage_avancement: currentProgress, id_projet } = results[0];
        const heures_manquantes = Math.max(0, 8 - heures_travaillees);

        // Étape 2: Insérer le rapport dans rapport_journalier
        const insertQuery = `
            INSERT INTO rapport_journalier (id_tache, id_employe, date_rapport, heures_travaillees, pourcentage_avancement, retard_jours, commentaire)
            VALUES (?, ?, NOW(), ?, ROUND((? / (? * 8)) * 100, 2), ?, ?)
        `;
        db.query(insertQuery, [id_tache, id_employe, heures_travaillees, heures_travaillees, duree, heures_manquantes, commentaire], (err, results) => {
            if (err) {
                console.error("Erreur lors de l'insertion du rapport :", err.message);
                return res.status(500).json({ message: "Erreur lors de l'insertion du rapport." });
            }

            // Calcul du nouveau pourcentage d'avancement pour la tâche
            const newProgress = Math.min(100, currentProgress + (heures_travaillees / (duree * 8)) * 100);
            let newStatus;
            
            // Déterminer le statut en fonction du pourcentage d'avancement de la tâche
            if (newProgress === 0) {
                newStatus = 'À faire';
            } else if (newProgress > 0 && newProgress < 100) {
                newStatus = 'En cours';
            } else if (newProgress >= 100) {
                newStatus = 'Terminé';
            }

            const updateTaskQuery = `
                UPDATE tache 
                SET 
                    pourcentage_avancement = ?,
                    statut = ?,
                    jours_de_retard = jours_de_retard + ?
                WHERE id = ?
            `;

            db.query(updateTaskQuery, [newProgress, newStatus, heures_manquantes, id_tache], (err, results) => {
                if (err) {
                    console.error("Erreur lors de la mise à jour de la tâche :", err.message);
                    return res.status(500).json({ message: "Erreur lors de la mise à jour de la tâche." });
                }

                // Étape 3: Calculer le pourcentage global d'avancement pour le projet
                const calculateProjectProgressQuery = `
                    SELECT AVG(pourcentage_avancement) AS pourcentage_global 
                    FROM tache 
                    WHERE id_projet = ?
                `;
                
                db.query(calculateProjectProgressQuery, [id_projet], (err, results) => {
                    if (err) {
                        console.error("Erreur lors du calcul de l'avancement global du projet :", err.message);
                        return res.status(500).json({ message: "Erreur lors du calcul de l'avancement global du projet." });
                    }

                    const pourcentage_global = results[0].pourcentage_global;
                    let projectStatus;

                    // Déterminer le statut du projet en fonction du pourcentage global
                    if (pourcentage_global === 0) {
                        projectStatus = 'À faire';
                    } else if (pourcentage_global > 0 && pourcentage_global < 100) {
                        projectStatus = 'En cours';
                    } else if (pourcentage_global === 100) {
                        projectStatus = 'Terminé';
                    }

                    // Étape 4: Mettre à jour le pourcentage et le statut dans projetavancement
                    const updateProjectQuery = `
                        UPDATE projetavancement 
                        SET 
                            pourcentage = ?, 
                            statut = ?
                        WHERE id_projet = ?
                    `;

                    db.query(updateProjectQuery, [pourcentage_global, projectStatus, id_projet], (err, results) => {
                        if (err) {
                            console.error("Erreur lors de la mise à jour du projet :", err.message);
                            return res.status(500).json({ message: "Erreur lors de la mise à jour du projet." });
                        }

                        res.status(200).json({ message: "Rapport inséré et mise à jour effectuée avec succès." });
                    });
                });
            });
        });
    });
};


export const statEmploye = (req, res) => {
    const query = `
        SELECT u.idUtilisateur AS id_employe, u.profile AS profile_employe, CONCAT(u.nom, ' ', u.prenom) AS nom_complet,SUM(rj.heures_travaillees) AS total_heures_travaillees,AVG(rj.pourcentage_avancement) AS avancement_moyen, COUNT(DISTINCT t.id) AS nombre_de_taches FROM utilisateur u JOIN rapport_journalier rj ON u.idUtilisateur = rj.id_employe JOIN tache t ON rj.id_tache = t.id WHERE  rj.date_rapport = CURDATE() GROUP BY u.idUtilisateur ORDER BY avancement_moyen DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des statistiques des employés :", err.message);
            return res.status(500).json({ message: "Erreur lors de la récupération des statistiques des employés." });
        }

        res.status(200).json(results);
    });
};

// Nouvelle fonction pour récupérer les statistiques pour le jour précédent (hier)
export const statEmployePrevious = (req, res) => {
    const query = `
        SELECT u.idUtilisateur AS id_employe, u.profile AS profile_employe, CONCAT(u.nom, ' ', u.prenom) AS nom_complet,
            SUM(rj.heures_travaillees) AS total_heures_travaillees,
            AVG(rj.pourcentage_avancement) AS avancement_moyen,
            COUNT(DISTINCT t.id) AS nombre_de_taches
        FROM utilisateur u
        JOIN rapport_journalier rj ON u.idUtilisateur = rj.id_employe
        JOIN tache t ON rj.id_tache = t.id
        WHERE rj.date_rapport = CURDATE() - INTERVAL 1 DAY
        GROUP BY u.idUtilisateur
        ORDER BY avancement_moyen DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des statistiques des employés pour hier :", err.message);
            return res.status(500).json({ message: "Erreur lors de la récupération des statistiques des employés pour hier." });
        }

        res.status(200).json(results);
    });
};