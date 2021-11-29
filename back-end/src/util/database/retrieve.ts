import { ClassData } from "../type";
import dbHelper from "./dbHelper";

async function dbRetrieve(schoolInfo: string, classInfo: string): Promise<ClassData> {
    const dbName = "Classes";

    try {
        const client = await dbHelper;
        const db = client.db(dbName);
        const col = db.collection(schoolInfo);
        const query = { $or: [{ name: classInfo.toUpperCase() }, { label: classInfo.toUpperCase() }] };
        return await col.findOne(query) as ClassData;
    } catch (e) {
        console.error(e);
    }
}

export default dbRetrieve;

// (async () => {
//     console.log(require("util").inspect(await dbRetrieve("nyu", "CSUY 2124"), false, null));
// })();
