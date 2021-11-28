const express = require("express");
const router = express.Router();

const retrieveClass = require("../util/database/retrieve");

router.get("/:school/:target", (req, res) => {
    const school = req.params.school;
    const target = req.params.target;

    retrieveClass(school, target, req.query && req.query.dev === "true").then((info) => {
        if (!info || (Date.now() - info.lastCached.valueOf()) > 10 * 24 * 60 * 60 * 1000) {
            const scrapeClass = require("../util/scraper/getClassInfo");
            const insert = require("../util/database/insert");

            scrapeClass(school, target, req.query && req.query.dev === "true").then(async (info) => {
                await insert(school, info);
                const newInfo = await retrieveClass(school, target, req.query && req.query.dev === "true");
                return res.send(newInfo);
            }, (e) => {
                return res.send(req.query && req.query.dev === "true" ? e : null);
            })
        }

        if (info) {
            return res.send(info);
        }
    }, (e) => {
        return res.send(req.query && req.query.dev === "true" ? e : null);
    }).catch((e) => {
        return res.send(req.query && req.query.dev === "true" ? e : null);
    });
});

module.exports = router;
