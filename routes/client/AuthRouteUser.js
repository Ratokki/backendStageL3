import express from "express";
import { AuthControllerClient } from "../../controllers/client/index.js";
import { ControllerClient } from "../../controllers/client/index.js";
import { ControllerCommentClient } from "../../controllers/client/index.js";
const router = express.Router();

// AUTH
router.post("/register", AuthControllerClient.register);
router.post("/login", AuthControllerClient.login);
router.post("/logout", AuthControllerClient.logout);
//RU user
router.put("/:IdUser", ControllerClient.updateUser);
router.get("/", ControllerClient.getUsers);
router.get("/:IdUser", ControllerClient.getUser);
router.put("/", ControllerClient.updatePassword);
//COMMENT
router.post("/comment", ControllerCommentClient.addComment);
router.get("/comment", ControllerCommentClient.getAllComments);
router.get("/comment/:IdComment", ControllerCommentClient.getOneComment);
export default router;
