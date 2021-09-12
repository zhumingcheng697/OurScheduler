const express = require("express");
const router = express.Router();

const generator = require("../generator");

router.get("/", (req, res) => {
    const target = req.query && req.query.prop;
    const prop = JSON.parse(decodeURI(req.query.prop))

    generator(prop).then((info) => {
        console.log(info)
        return res.send(info);
    }).catch((e) => {
        return res.send(req.query && req.query.dev === "true" ? e : null);
    });
});

module.exports = router;
