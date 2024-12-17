import { db } from "../../../config/bd.js";
import moment from "moment"; // Utiliser moment.js pour manipuler les dates

// Assigner un utilisateur à un projet et mettre à jour les informations du projet
export const assignProject = (req, res) => {
    const { projectId, userId, startDate, duration, priority } = req.body;

    // Vérifier que les données nécessaires sont présentes
    if (!projectId || !userId || !startDate || !duration) {
        return res.status(400).json({ message: "Les informations du projet ou de l'utilisateur sont manquantes." });
    }

    // Vérifier si l'utilisateur a le statut 'Accepté'
    const checkUserStatusQuery = "SELECT status FROM utilisateur WHERE idUtilisateur = ?";
    db.query(checkUserStatusQuery, [userId], (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length === 0 || results[0].status !== 'Accepté') {
            return res.status(403).json({ message: 'L\'utilisateur doit avoir le statut "Accepté" pour être assigné à un projet.' });
        }

        // Calcul de la date d'échéance en ajoutant la durée à la date de début
        const startDateFormatted = moment(startDate);
        const endDate = startDateFormatted.clone().add(duration, 'days').format("YYYY-MM-DD HH:mm:ss");

        // Requête pour mettre à jour le projet dans `projetAvancement`
        const updateProjectAvancementQuery = `
            UPDATE projetAvancement 
            SET date_debut = ?, duree = ?, date_echeance = ?, priorite = ? 
            WHERE id_projet = ?
        `;

        console.log('Start Date:', startDate);
console.log('End Date:', endDate);
        
        db.query(updateProjectAvancementQuery, [startDate, duration, endDate, priority, projectId], (err, avancementResults) => {
            if (err) return res.status(500).json(err);

            if (avancementResults.affectedRows === 0) {
                return res.status(404).json({ message: 'Projet non trouvé dans projetAvancement.' });
            }

            // Requête pour mettre à jour le responsable dans `projetPropose`
            const updateProjectProposeQuery = `
                UPDATE projetPropose 
                SET id_responsable = ?, priorite = ? 
                WHERE id_projet = ?
            `;
            
            db.query(updateProjectProposeQuery, [userId, priority, projectId], (err, proposeResults) => {
                if (err) return res.status(500).json(err);

                if (proposeResults.affectedRows === 0) {
                    return res.status(404).json({ message: 'Projet non trouvé dans projetPropose.' });
                }

                return res.status(200).json({ message: 'Utilisateur assigné avec succès et projet mis à jour.' });
            });
        });
    });
};
