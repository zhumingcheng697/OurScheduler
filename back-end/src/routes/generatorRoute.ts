import express from "express";
const router = express.Router();

import { ClassSelection } from "../util/type";
import generator from "../util/generatorV3";

router.get("/", (req, res) => {
    const prop: ClassSelection = JSON.parse(decodeURI(req.query.prop as string));

    generator(prop).then((info) => {
        res.send(info);
    }, (e) => {
        res.send(req.query && req.query.dev === "true" ? e : null);
    }).catch((e) => {
        res.send(req.query && req.query.dev === "true" ? e : null);
    });
});

export default router;
