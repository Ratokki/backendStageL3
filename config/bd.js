import mysql from "mysql";
import dotenv from "dotenv";
dotenv.config();
console.log(process.env);
export const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});
