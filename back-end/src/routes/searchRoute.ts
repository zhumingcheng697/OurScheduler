import express from "express";
const router = express.Router();

import searchSchool from "../util/scraper/getSchoolId";

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

export default router;
