const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send(req.connection.address());
});

module.exports = router;
