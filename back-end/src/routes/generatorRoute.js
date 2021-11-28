const express = require("express");
const router = express.Router();

const generator = require("../util/generatorV3");

router.get("/", (req, res) => {
    const prop = JSON.parse(decodeURI(req.query.prop));

    generator(prop).then((info) => {
        res.send(info);
    }, (e) => {
        res.send(req.query && req.query.dev === "true" ? e : null);
    }).catch((e) => {
        res.send(req.query && req.query.dev === "true" ? e : null);
    });
});

module.exports = router;
