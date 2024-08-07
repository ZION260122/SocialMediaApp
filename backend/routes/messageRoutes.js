import express from "express"
import protectRoute from "../middlewares/protectRoute";
import { sendMessage } from "../controllers/messageController";

const router = express.router()

router.get('/',protectRoute, sendMessage)

export default router;