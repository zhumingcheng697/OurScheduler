import express from "express";
const router = express.Router();

import retrieveClass from "../util/database/retrieve";
import scrapeClass from "../util/scraper/getClassInfo";
import insert from "../util/database/insert";

router.get("/:school/:target", (req, res) => {
    const school = req.params.school;
    const target = req.params.target;

    retrieveClass(school, target).then((info) => {
        if (info) {
            res.send(info);
        }

        if (!info || (Date.now() - info.lastCached.valueOf()) > 10 * 24 * 60 * 60 * 1000) {
            scrapeClass(school, target, req.query && req.query.dev === "true").then(async (scraped) => {
                await insert(school, scraped);
                if (!info) {
                    const newInfo = await retrieveClass(school, target);
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

export default router;
