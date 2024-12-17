import express from "express";

import { StartMessController } from "../../controllers/discussion/index.js";
import { FetchMessController } from "../../controllers/discussion/index.js";

const router = express.Router();

router.post("/sendMessage", StartMessController.sendMessage);
router.get("/messages", FetchMessController.getMessages);

export default router;