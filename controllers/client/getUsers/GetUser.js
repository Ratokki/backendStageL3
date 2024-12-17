import { db } from "../../../config/bd.js";

export const getUser = (req, res) => {
  const q = "SELECT * FROM utilisateur WHERE idUtilisateur=?";
  db.query(q, [req.params.idUtilisateur], (err, data) => {
    if (err) return res.status(500).json(err);
    console.log("user data:", data[0]);
    return res.status(200).json(data[0]);
  });
};
