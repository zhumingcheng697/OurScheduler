async function dbRetrieve(schoolInfo, classInfo) {
    const client = await require("./dbHelper");
    const dbName = "Classes";

    try {
        const db = client.db(dbName);
        const col = db.collection(schoolInfo);
        const query = { $or: [{ name: classInfo.toUpperCase() }, { label: classInfo.toUpperCase() }] };
        return await col.findOne(query);
    } catch (e) {
        console.error(e);
    }
}

module.exports = dbRetrieve;

// (async () => {
//     console.log(require("util").inspect(await dbRetrieve("nyu", "CSUY 2124"), false, null));
// })();
