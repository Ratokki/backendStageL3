import { db } from "../../../config/bd.js";

export const getUsers = (req, res) => {
  const q = req.query.idUtilisateur
    ? "SELECT * FROM utilisateur WHERE idUtilisateur=?"
    : "SELECT * FROM utilisateur";
  db.query(q, [req.query.idUtilisateur], (err, data) => {
    if (err) return res.send(err);
    console.log("user Data:", data);
    return res.status(200).json(data);
  });
};
