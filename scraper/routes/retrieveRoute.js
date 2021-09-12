const express = require("express");
const router = express.Router();

const retrieveClass = require("../getClassInfo");

router.get("/:school/:target", (req, res) => {
    const school = req.params.school;
    const target = req.params.target;

    retrieveClass(school, target, req.query && req.query.dev === "true").then((info) => {
        return res.send(info);
    }).catch((e) => {
        return res.send(req.query && req.query.dev === "true" ? e : null);
    });
});

module.exports = router;
