import { db } from "../../../config/bd.js";

export const sendMessage = (req, res) => {
    const { id_envoyeur, id_recepteur, message } = req.body;
    console.log(req.body);
  
    const query = `
      INSERT INTO messages (id_envoyeur, id_recepteur, message)
      VALUES (?, ?, ?)

    `;
  
    db.query(query, [id_envoyeur, id_recepteur, message], (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'envoi du message :', err.message);
        return res.status(500).json({ message: 'Erreur lors de l\'envoi du message.' });
      }
      res.status(201).json({ message: 'Message envoyé avec succès' });
    });
  };

