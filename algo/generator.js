/**
 * @author Arthur Deng
 * Generate schedule
 */
const data = {
    "name": "test1",
    "credits": 3,
    "label": "TEST 001",
    "lectures": [
        ["-101", [540, 600],
            [1800, 1860]
        ],
        ["-102", [600, 660],
            [1860, 1920]
        ]
    ],
    "extras": [
        ["-A", [3200, 3260]],
        ["-B", [3260, 3320]]
    ]
}
const classData = {
    class_1: {
        name: "calculus",
        credit: 3,
        id: "MATH001",
        locked: true,
        times: [
            [
                [540, 600, 'lab'],
                [1800, 1860, 'lecture'],
                [3600, 3660, 'lecture']
            ],
            [
                [600, 700, 'lab'],
                [1500, 1560, 'lecture'],
                [3000, 3120, 'lecture']
            ]
        ]
    },
    class_2: {
        name: "history",
        credit: 3,
        id: "Hist031",
        locked: true,
        times: [
            [
                [540, 700, 'lab'],
                [1400, 1460, 'lecture'],
                [3600, 3660, 'lecture']
            ],
            [
                [1200, 1300, 'lab'],
                [1500, 1560, 'lecture'],
                [3000, 3120, 'lecture']
            ]
        ]
    },
    class_3: {
        name: "Data Structures",
        credit: 3,
        id: "CS182",
        locked: false,
        times: [
            [
                [1, 2, 'lab'],
                [10, 11, 'lecture'],
                [12, 23, 'lecture']
            ],
            [
                [1, 2, 'lab'],
                [2, 3, 'lecture'],
                [3000, 3120, 'lecture']
            ]
        ]
    }
}

let conditions = {
    minCredit: 0,
    maxCredit: 25,
    minCourses: 0,
    maxCourses: 6
}

function TimeSlot(name, id, start, end) {
    // name: String
    // start/end: time converted to int
    // day: int, 0 to 6
    this.name = name;
    this.id = id;
    this.start = start;
    this.end = end;
    this.log = () => {
        console.log(this.name);
        console.log(this.id);
        console.log(this.start);
        console.log(this.end);
    }
}

function Schedule() {
    this.timeslots = [];
    this.credits = 0;
    this.numberOfCourses = 0;
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
            if (
                (t.start == ts.start) ||
                (t.start < ts.start && t.end > ts.start) ||
                (t.start < ts.end && t.start > ts.start)
            ) {
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
    this.printCourses = () => {
        for (const ts of this.timeslots) {
            console.log(ts.id);
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
        for (let classIdx = 0; classIdx < numClasses; classIdx++) {
            const ts = choice[classIdx]; // corresponds to the (numClasses - _class - 1)th 
            // class in the classData dictionary
            if (ts.length == 0) {
                continue;
            }
            _class = classData[classes[numClasses - classIdx - 1]]
            for (let time of ts) {
                const slot = new TimeSlot(
                    _class.name,
                    _class.id + time[2],
                    time[0],
                    time[1]
                )
                valid = s.add(slot);
                if (!valid) { break; }
            }
            s.credits += _class.credit;
            s.numberOfCourses += 1;
            if (!valid) { break; }
        }

        if (valid && checkConditions(s, conditions)) {
            schedules.push(s);
        }
    }
    return schedules;
}


let checkConditions = (schedule, conditions) => {
    return (
        schedule.credits <= conditions.maxCredit &&
        schedule.credits >= conditions.minCredit &&
        schedule.numberOfCourses >= conditions.minCourses &&
        schedule.numberOfCourses <= conditions.maxCourses
    )
}

function iterate(idx, classes) {
    let ret = [];
    if (idx == -1) {
        return [
            []
        ];
    }
    const below = iterate(idx - 1, classes);
    const _class = classData[classes[idx]];
    for (const option of _class.times) {
        let seg = [];
        for (const row of below) {
            let inner = [option].concat(row);
            // console.log(option);
            seg.push(inner);
        }
        ret = ret.concat(seg);
    }
    if (!_class.locked) {
        let seg = [];
        for (const row of below) {
            let inner = [
                []
            ].concat(row);
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
    s.printCourses();
}