/**
 * @author Arthur Deng
 * Generate schedule
 */

async function main(packageIn) {
    let data = {},
        locked = [],
        restrictions = {
            minCredit: 0,
            maxCredit: 100,
            minCourses: 0,
            maxCourses: 100
        };
    try {
        let _package = packageIn;
        data = [];
        for (let _class of _package.classList) {
            data.push(await require("../scraper/retrieve.js")(_class[0], _class[1]));
        }
        locked = _package.locked;
        restrictions = _package.restrictions;

    } finally {
        function getClassData(
            _data,
            _locked = [],
            _restrictions = {}
        ) {
            let classData = {};
            // locked, min/max credits
            for (let _class of _data) {
                let lectures = _class.lectures;
                let labs = _class.extras;
                let _name = _class.name;
                let _credit = _class.credits;
                let _id = _class.label;
                classData[_name] = {
                    name: _name,
                    credit: _credit,
                    id: _id,
                    locked: _locked.includes(_name),
                    times: []
                }
                if (labs.length == 0) {
                    for (let lecture of lectures) {
                        let _lec = lecture.slice().splice(1);
                        let result = [];
                        for (let __lec of _lec) {
                            result.push(__lec.concat(lecture[0]));
                        }
                        classData[_name].times.push(result);
                    }
                } else {
                    for (let lecture of lectures) {
                        for (let lab of labs) {
                            let _lec = lecture.slice().splice(1);
                            let _lab = lab.slice().splice(1);
                            let result = [];
                            for (let __lec of _lec) {
                                result.push(__lec.concat(lecture[0]));
                            }
                            for (let __lab of _lab) {
                                result.push(__lab.concat(lab[0]));
                            }
                            // console.log(result);
                            classData[_name].times.push(result);
                        }
                    }
                }
            }
            return classData;
        }
        let classData = getClassData(data, locked, restrictions);

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

        let checkConditions = (schedule, conditions) => {
            return (
                schedule.credits <= conditions.maxCredit &&
                schedule.credits >= conditions.minCredit &&
                schedule.numberOfCourses >= conditions.minCourses &&
                schedule.numberOfCourses <= conditions.maxCourses
            )
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

                if (valid && checkConditions(s, restrictions)) {
                    schedules.push(s);
                }
            }
            return schedules;
        }

        let schedules = generate(classData);
        let _export = [];
        if (schedules.length == 0) {
            console.log("No schedule can be generated for the given courses (conflict exists for all options).");
        } else {

            for (const s of schedules) {
                console.log('===============');
                s.printCourses();
                console.log('===============');
                let _schedule = [];
                let slots = s.timeslots;
                for (const _slot of slots) {
                    _schedule.push([_slot.name, [_slot.start, _slot.end]]);
                }
                _export.push(_schedule);
            }
        }

        return _export;
    }
}

module.exports = main;