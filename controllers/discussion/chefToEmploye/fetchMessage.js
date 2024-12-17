/*import { db } from "../../../config/bd.js";

export const getMessages = (req, res) => {
    const { id_envoyeur, id_recepteur } = req.query;
  
    const query = `
      SELECT message, date_envoi, 
        CASE WHEN id_envoyeur = ? THEN 'envoyeur' ELSE 'recepteur' END AS type_message
      FROM messages
      WHERE (id_envoyeur = ? AND id_recepteur = ?)
         OR (id_envoyeur = ? AND id_recepteur = ?)
      ORDER BY date_envoi ASC
    `;
  
    db.query(query, [id_envoyeur, id_envoyeur, id_recepteur, id_recepteur, id_envoyeur], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des messages :', err.message);
        return res.status(500).json({ message: 'Erreur lors de la récupération des messages.' });
      }
      res.status(200).json(results);
    });
  };*/

  import { db } from "../../../config/bd.js";

export const getMessages = (req, res) => {
    const { id_envoyeur, id_recepteur } = req.query;

    const query = `
      SELECT message, fichier, date_envoi, 
        CASE WHEN id_envoyeur = ? THEN 'envoyeur' ELSE 'recepteur' END AS type_message
      FROM messages
      WHERE (id_envoyeur = ? AND id_recepteur = ?)
         OR (id_envoyeur = ? AND id_recepteur = ?)
      ORDER BY date_envoi ASC
    `;

    db.query(query, [id_envoyeur, id_envoyeur, id_recepteur, id_recepteur, id_envoyeur], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des messages :", err.message);
            return res.status(500).json({ message: "Erreur lors de la récupération des messages." });
        }
        res.status(200).json(results);
    });
};

  