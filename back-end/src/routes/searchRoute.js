const express = require("express");
const router = express.Router();

const searchSchool = require("../util/scraper/getSchoolId");

router.get("/:target", (req, res) => {
    const target = req.params.target;

    searchSchool(target, req.query && req.query.dev === "true").then((id) => {
        res.send(id);
    }, (e) => {
        res.send(req.query && req.query.dev === "true" ? e : null);
    }).catch((e) => {
        res.send(req.query && req.query.dev === "true" ? e : null);
    });
});

module.exports = router;
