import express from "express"
import protectRoute from "../middlewares/protectRoute.js";
import { getMessages, getConversations, sendMessage } from "../controllers/messageController.js";

const router = express.Router()

router.post('/',protectRoute, sendMessage)
router.get('/:otherUserId',protectRoute, getMessages)
router.get('/conversations',protectRoute, getConversations)

export default router;