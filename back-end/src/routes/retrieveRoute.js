const express = require("express");
const router = express.Router();

const retrieveClass = require("../util/database/retrieve");

router.get("/:school/:target", (req, res) => {
    const school = req.params.school;
    const target = req.params.target;

    retrieveClass(school, target, req.query && req.query.dev === "true").then((info) => {
        if (info) {
            res.send(info);
        }
        if (!info || (Date.now() - info.lastCached.valueOf()) > 10 * 24 * 60 * 60 * 1000) {
            const scrapeClass = require("../util/scraper/getClassInfo");
            const insert = require("../util/database/insert");

            scrapeClass(school, target, req.query && req.query.dev === "true").then(async (info) => {
                await insert(school, info);
                const newInfo = await retrieveClass(school, target, req.query && req.query.dev === "true");
                if (!info) {
                    res.send(newInfo);
                }
            }, (e) => {
                if (!info) {
                    res.send(req.query && req.query.dev === "true" ? e : null);
                }
            });
        }
    }, (e) => {
        res.send(req.query && req.query.dev === "true" ? e : null);
    }).catch((e) => {
        res.send(req.query && req.query.dev === "true" ? e : null);
    });
});

module.exports = router;
