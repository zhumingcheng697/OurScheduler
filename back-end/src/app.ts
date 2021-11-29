import express from "express";

const app = express();
const port = process.env.PORT || 4000;

import dotenv from "dotenv";
dotenv.config();

import ackRoute from "./routes/ackRoute";
import generatorRoute from "./routes/generatorRoute";
import retrieveRoute from "./routes/retrieveRoute";
import searchRoute from "./routes/searchRoute";

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.use("/keep-alive", ackRoute);
app.use("/generate", generatorRoute);
app.use("/retrieve", retrieveRoute);
app.use("/search", searchRoute);

app.listen(port, () => {
    console.log(`Final back-end is running at port ${port}`);
});
