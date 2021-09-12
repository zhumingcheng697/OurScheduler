const express = require("express");
const app = express();
const port = process.env.PORT || 4000;

const generatorRoute = require("./routes/generatorRoute");
const retrieveRoute = require("./routes/retrieveRoute");
const searchRoute = require("./routes/searchRoute");

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.use("/generate", generatorRoute);
app.use("/retrieve", retrieveRoute);
app.use("/search", searchRoute);

app.listen(port, () => {
    console.log(`Final back-end is running at port ${port}`);
});
