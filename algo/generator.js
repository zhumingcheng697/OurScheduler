/**
 * @author Arthur Deng
 * Generate schedule
 */

const classData = {
    class_1: {
        name: "calculus",
        times: [
            [ // option 1
                [
                    ["9:00", "10:00"],
                    ["13:00", "15:00"]
                ], // 2 sections on Monday, 9 to 10 and 1 to 3pm
                [], // no sections on Tuesday for calculus
                [], // none on Wednesday
                [
                    ["15:00", "17:00"]
                ], // 3 - 5pm on thursday
                [], // none on Friday
                [], // none on Saturday
                [] // none on Sunday
            ],
            [ // option 2
                [
                    ["9:00", "10:00"]
                ],
                [],
                [
                    ["13:00", "15:00"]
                ],
                [
                    ["15:00", "17:00"]
                ],
                [], // none on Friday
                [], // none on Saturday
                [] // none on Sunday
            ]
        ]
    },
    class_2: {
        name: "History",
        times: [
            [ // option 1
                [
                    ["10:00", "11:00"],
                    ["13:00", "15:00"]
                ],
                [],
                [],
                [
                    ["17:00", "19:00"]
                ],
                [], // none on Friday
                [], // none on Saturday
                [] // none on Sunday
            ],
            [ // option 2
                [
                    ["10:00", "11:00"]
                ],
                [],
                [
                    ["12:00", "15:00"]
                ],
                [
                    ["18:00", "19:00"]
                ],
                [], // none on Friday
                [], // none on Saturday
                [] // none on Sunday
            ]
        ]
    }
}

const parseTimeToInt = (times) => {
    const dict = {};
    let i = 0;
    for (const time of times) {
        dict[time] = i;
        i++;
    }
    return dict;
}






let timeToInt = (time) => {
    // time: "XX:XX"
    const timeInt = time.split(":");
    return 60 * parseInt(timeInt[0]) + parseInt(timeInt[1]);
}



let schedule = {}

function TimeSlot(name, start, end, day) {
    // name: String
    // start/end: time converted to int
    // day: int, 0 to 6
    this.name = name;
    this.start = start;
    this.end = end;
    this.day = day;
    this.log = () => {
        console.log("day ", day)
        console.log(start);
        console.log(end);
        console.log(name);
    }
}

function Schedule() {
    this.timeslots = [];
    this.days = 7;
    this.add = (ts) => {
        if (this.checkConflict(ts)) {
            return false;
        }
        this.timeslots.push(ts);
        return true;
        // if successfully added return true
        // return false if conflict exists
    }
    this.checkConflict = (ts) => {
        for (const t of this.timeslots) {
            if (t.day != ts.day) {
                continue;
            }
            if (timeToInt(t.start) == timeToInt(ts.start) ||
                (timeToInt(t.start) < timeToInt(ts.start) && timeToInt(t.end) > timeToInt(ts.start)) ||
                (timeToInt(t.start) < timeToInt(ts.end) && timeToInt(t.start) > timeToInt(ts.start))) {
                // check for conflict
                return true;
            }
        }
        return false;
    }
    this.print = () => {
        for (const ts of this.timeslots) {
            ts.log();
        }
    }
}

function generate(classData) {
    // loop every option of class
    // add schedule to schedules list
    let schedules = [];
    const classes = Object.keys(classData),
        numClasses = classes.length;
    const choices = iterate(numClasses - 1, classes);
    for (const choice of choices) {
        let s = new Schedule(),
            valid = true;
        for (let _class = 0; _class < numClasses; _class++) {
            const ts = choice[_class]; // corresponds to the (numClasses - _class - 1)th 
            // class in the classData dictionary
            for (let day = 0; day < s.days; day++) {
                let timesInDay = ts[day];
                for (let c of timesInDay) {
                    const slot = new TimeSlot(
                        classData[classes[numClasses - _class - 1]].name,
                        c[0],
                        c[1],
                        day
                    )
                    let valid = s.add(slot);
                    if (!valid) { break; }
                }
                if (!valid) { break; }
            }
            if (!valid) { break; }
        }
        if (valid) {
            schedules.push(s);
        }
    }
    return schedules;
}

function iterate(idx, classes) {
    let ret = [];
    if (idx == -1) {
        return [
            []
        ];
    }
    const below = iterate(idx - 1, classes);
    for (const option of classData[classes[idx]].times) {
        let seg = [];
        for (const row of below) {
            let inner = [option].concat(row);
            // console.log(option);
            seg.push(inner);
        }
        ret = ret.concat(seg);
    }
    return ret;
}

let schedules = generate(classData);
for (const s of schedules) {
    console.log('============')
    s.print();
}
// console.log();