import cron from "node-cron";
import { db } from "../config/bd.js";  // Assurez-vous que le chemin vers bd.js est correct

console.log("CronTasks.js est chargé");

// Exécute la tâche une fois par jour à 20h01 pour les tâches sans rapport entre 17h et 20h
cron.schedule("1 20 * * *", () => {
    console.log("Exécution de checkAndInsertDailyReport une fois par jour à 20h01");
    checkAndInsertDailyReport();
}, {
    timezone: "Europe/Paris",
});

// Fonction principale pour vérifier et insérer un rapport si aucune entrée n'est trouvée entre 17h et 20h
function checkAndInsertDailyReport() {
    console.log("Exécution de la tâche cron pour les rapports journaliers...");

    const checkReportQuery = `
        SELECT t.id AS id_tache, t.id_responsable AS id_employe, t.id_projet
        FROM tache t
        WHERE t.statut = 'En cours' AND NOT EXISTS (
            SELECT 1 
            FROM rapport_journalier rj
            WHERE rj.id_tache = t.id 
              AND DATE(rj.date_rapport) = CURDATE() 
              AND HOUR(rj.date_rapport) BETWEEN 17 AND 20
        )
    `;

    db.query(checkReportQuery, (err, tasksWithoutReports) => {
        if (err) {
            console.error("Erreur lors de la vérification des rapports :", err.message);
            return;
        }

        tasksWithoutReports.forEach(task => {
            const { id_tache, id_employe, id_projet } = task;

            const insertReportQuery = `
                INSERT INTO rapport_journalier (id_tache, id_employe, date_rapport, heures_travaillees, retard_jours, commentaire)
                SELECT ?, ?, NOW(), 0, 8, 'Rapport automatique'
                WHERE NOT EXISTS (
                    SELECT 1 FROM rapport_journalier
                    WHERE id_tache = ? AND DATE(date_rapport) = CURDATE()
                )
            `;

            db.query(insertReportQuery, [id_tache, id_employe, id_tache], (err, results) => {
                if (err) {
                    console.error("Erreur lors de l'insertion du rapport automatique :", err.message);
                    return;
                }

                console.log(`Rapport automatique ajouté pour la tâche ${id_tache} avec 8 heures de retard.`);

                const updateTaskQuery = `
                    UPDATE tache 
                    SET jours_de_retard = jours_de_retard + 1
                    WHERE id = ?
                `;

                db.query(updateTaskQuery, [id_tache], (err, results) => {
                    if (err) {
                        console.error("Erreur lors de la mise à jour de la tâche pour le retard :", err.message);
                        return;
                    }

                    console.log(`Mise à jour des jours de retard effectuée pour la tâche ${id_tache}.`);

                    const calculateProjectProgressQuery = `
                        SELECT AVG(pourcentage_avancement) AS pourcentage_global 
                        FROM tache 
                        WHERE id_projet = ?
                    `;

                    db.query(calculateProjectProgressQuery, [id_projet], (err, results) => {
                        if (err) {
                            console.error("Erreur lors du calcul de l'avancement global du projet :", err.message);
                            return;
                        }

                        const pourcentage_global = results[0].pourcentage_global;
                        let projectStatus;

                        if (pourcentage_global === 0) {
                            projectStatus = 'À faire';
                        } else if (pourcentage_global > 0 && pourcentage_global < 100) {
                            projectStatus = 'En cours';
                        } else if (pourcentage_global === 100) {
                            projectStatus = 'Terminé';
                        }

                        const updateProjectQuery = `
                            UPDATE projetavancement 
                            SET pourcentage = ?, statut = ?
                            WHERE id_projet = ?
                        `;

                        db.query(updateProjectQuery, [pourcentage_global, projectStatus, id_projet], (err, results) => {
                            if (err) {
                                console.error("Erreur lors de la mise à jour du projet :", err.message);
                                return;
                            }

                            console.log(`Projet ${id_projet} mis à jour avec un pourcentage global de ${pourcentage_global}% et un statut ${projectStatus}.`);
                        });
                    });
                });
            });
        });
    });
}
