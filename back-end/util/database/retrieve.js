async function dbRetrieve(schoolInfo, classInfo) {
    const { MongoClient } = require("mongodb");
    const url = "mongodb+srv://admin:hackersunion@myscheduler.wcsib.mongodb.net/Myscheduler_classes?retryWrites=true&w=majority";
    const client = new MongoClient(url);
    const dbName = "Classes";
    const school = schoolInfo;

    async function run() {
        try {
            await client.connect();
            const db = client.db(dbName);
            const col = db.collection(school);
            const query = { $or: [{ name: classInfo }, { label: classInfo }] };
            return await col.findOne(query);
        } finally {
            await client.close();
        }
    }

    return await run();
}

module.exports = dbRetrieve;

// (async () => {
//     console.log(require("util").inspect(await dbRetrieve("nyu", "CSUY 2124"), false, null));
// })();
