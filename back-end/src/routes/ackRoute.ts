import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.send(req.socket.address());
});

export default router;
