const router = require("express").Router();
const ctrl = require("../controllers/chatController");

const { protect: auth } = require("../middleware/auth");

// conversation
router.post("/conversation", auth, ctrl.createConversation); // done
router.get("/conversations", auth, ctrl.getConversations); // done

// messages
router.get("/messages", auth, ctrl.getMessages); // done
router.post("/messages", auth, ctrl.sendMessage); // done

// read
router.post("/conversation/read", auth, ctrl.markAsRead);

module.exports = router;