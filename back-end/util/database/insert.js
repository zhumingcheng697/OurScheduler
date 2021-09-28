async function dbInsert(schoolInfo, classInfo) {
    const { MongoClient } = require("mongodb");
    const url = "mongodb+srv://admin:hackersunion@myscheduler.wcsib.mongodb.net/Myscheduler_classes?retryWrites=true&w=majority";
    const client = new MongoClient(url);
    const dbName = "Classes";
    const school = schoolInfo;
    const lectures = [];
    const extras = [];
    const scraped = classInfo;
    for (let i = 0; i < scraped.length; i++) {
        const time_arr = scraped[i][4].split("-");

        const start_time_nums = time_arr[0].slice(0, -2).split(":");
        let start_time = parseInt(start_time_nums[0]) * 60 + parseInt(start_time_nums[1]);
        const start_time_ampm = time_arr[0].slice(-2);
        if (start_time_ampm === "pm" && start_time_nums[0] != 12) {
            start_time += 720;
        }

        const end_time_nums = time_arr[1].slice(0, -2).split(":");
        let end_time = parseInt(end_time_nums[0]) * 60 + parseInt(end_time_nums[1]);
        const end_time_ampm = time_arr[1].slice(-2);
        if (end_time_ampm === "pm" && end_time_nums[0] != 12) {
            end_time += 720;
        }

        const temp = [scraped[i][2]];
        for (let j = 0; j < scraped[i][3].length; j++) {
            temp.push([start_time + scraped[i][3][j] * 1440, end_time + scraped[i][3][j] * 1440]);
        }
        if (scraped[i][5] == 0) {
            extras.push(temp);
        } else {
            lectures.push(temp);
        }
    }

    async function run() {
        try {
            await client.connect();
            //console.log("Connected correctly to server");
            const db = client.db(dbName);
            const col = db.collection(school);
            let classDocument = {
                "name": scraped[0][0], //course name as given
                "credits": scraped[0][5], //scrape credits
                "label": scraped[0][1], //class id until '-'
                "lectures": lectures, //lecture sections
                "extras": extras //extra sections
            };
            const p = await col.insertOne(classDocument);
            //const myDoc = await col.findOne();
            //console.log(myDoc);
        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }

    await run();
}

module.exports = dbInsert;
