import { ClassData, ClassSelection, SelectionRestriction } from "./type";
import retrieve from "./database/retrieve";

type ScheduleOption = [string, [number, number]][]

async function main(packageIn: ClassSelection): Promise<ScheduleOption[]> {
    type TempSectionData = [string, ...[number, number][]];

    interface TempClassData {
        name: string,
        credits: number,
        label: string,
        lectures: TempSectionData[],
        extras: TempSectionData[]
    }

    type ClassCandidate = [number, number, string][];

    interface SelectedClass {
        name: string,
        credit: number,
        id: string,
        locked: boolean,
        times: ClassCandidate[]
    }

    let _package = packageIn;
    let data: ClassData[] = [];
    for (let _class of _package.classList) {
        data.push(await retrieve(_class[0], _class[1]));
    }

    let locked = new Set(_package.locked);
    let restrictions = _package.restrictions;

    function getClassData(
        _data: TempClassData[],
        _locked: Set<string>,
        _restrictions: SelectionRestriction
    ): { [name: string]: SelectedClass } {
        let classData: { [name: string]: SelectedClass } = {};
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
                locked: _locked.has(_name) || _locked.has(_id),
                times: []
            };
            if (labs.length === 0) {
                for (let [lecName, ..._lec] of lectures) {
                    classData[_name].times.push(_lec.map((e: [number, number]) => [...e, lecName]));
                }
            } else {
                for (let [lecName, ..._lec] of lectures) {
                    for (let [labName, ..._lab] of labs) {
                        const mappedLec: [number, number, string][] = _lec.map((e: [number, number]) => [...e, lecName]);
                        const mappedLab: [number, number, string][] = _lab.map((e: [number, number]) => [...e, labName]);
                        classData[_name].times.push(mappedLec.concat(mappedLab));
                    }
                }
            }
        }
        return classData;
    }

    let classData = getClassData(data, locked, restrictions);

    class TimeSlot {
        name: string;
        id: string;
        start: number;
        end: number;

        constructor(name: string, id: string, start: number, end: number) {
            this.name = name;
            this.id = id;
            this.start = start;
            this.end = end;
        }
    }

    class Schedule {
        timeslots: TimeSlot[];
        credits: number;
        numberOfCourses: number;

        constructor() {
            this.credits = 0;
            this.numberOfCourses = 0;
            this.timeslots = [];
        }

        add(ts: TimeSlot) {
            this.timeslots.push(ts);
        }
    }

    // function Schedule() {
    //     this.timeslots = [] as TimeSlot[];
    //     this.credits = 0;
    //     this.numberOfCourses = 0;
    //     this.add = (ts: TimeSlot) => {
    //         this.timeslots.push(ts);
    //     };
    // }

    type ScheduleCandidate = [ClassCandidate[], number, number];

    function iterate(idx: number, classes: string[]): ScheduleCandidate[] {
        let ret: ScheduleCandidate[] = [];
        if (idx < 0) {
            return [
                [[], 0, 0]
            ];
        }
        const below = iterate(idx - 1, classes);
        const _class = classData[classes[idx]];
        const credit = _class.credit;
        const maxCourse = restrictions.maxCourses;
        const maxCredit = restrictions.maxCredit;
        for (const option of _class.times) {
            let seg: ScheduleCandidate[] = [];
            for (const [row, currCourse, currCredit] of below) {
                if ((currCourse + 1 <= maxCourse) && (currCredit + credit <= maxCredit)) {
                    let inner = [option];
                    let hasConflict = false;

                    for (const _class of row) {
                        for (const [startT, endT] of _class) {
                            for (const [_start, _end] of option) {
                                if ((_start < endT) && (startT < _end)) {
                                    hasConflict = true;
                                    break;
                                }
                            }
                            if (hasConflict) {break;}
                        }
                        if (hasConflict) {
                            break;
                        } else {
                            inner.push(_class);
                        }
                    }

                    if (!hasConflict) {
                        seg.push([inner, currCourse + 1, currCredit + credit]);
                    }
                }
            }
            for (const s of seg) {
                ret.push(s);
            }
        }
        if (!_class.locked) {
            let seg: ScheduleCandidate[] = [];
            for (const [row, currCourse, currCredit] of below) {
                let inner = [[]].concat(row);
                seg.push([inner, currCourse, currCredit]);
            }
            for (const s of seg) {
                ret.push(s);
            }
        }
        return ret;
    }

    let checkConditions = (schedule: Schedule, conditions: SelectionRestriction) => {
        return (
            schedule.credits <= conditions.maxCredit &&
            schedule.credits >= conditions.minCredit &&
            schedule.numberOfCourses >= conditions.minCourses &&
            schedule.numberOfCourses <= conditions.maxCourses
        );
    };

    function generate(classData: { [name: string]: SelectedClass }): Schedule[] {
        // loop every option of class
        // add schedule to schedules list
        let schedules: Schedule[] = [];
        const classes = Object.keys(classData),
            numClasses = classes.length;
        const choices = iterate(numClasses - 1, classes);
        for (const [choice] of choices) {
            let s = new Schedule();
            for (let classIdx = 0; classIdx < numClasses; classIdx++) {
                const ts = choice[classIdx]; // corresponds to the (numClasses - _class - 1)th
                // class in the classData dictionary
                if (ts.length === 0) {
                    continue;
                }

                let _class = classData[classes[numClasses - classIdx - 1]];

                for (let time of ts) {
                    const slot = new TimeSlot(
                        _class.name,
                        _class.id + time[2],
                        time[0],
                        time[1]
                    );
                    s.add(slot);
                }
                s.credits += _class.credit;
                s.numberOfCourses += 1;
            }

            if (checkConditions(s, restrictions)) {
                schedules.push(s);
            }
        }
        return schedules;
    }

    let schedules = generate(classData);
    let _export: ScheduleOption[] = [];
    if (schedules.length === 0) {
        console.warn("No schedule can be generated for the given courses (conflict exists for all options).");
    } else {
        for (const s of schedules) {
            let _schedule: ScheduleOption = [];
            let slots = s.timeslots;
            for (const _slot of slots) {
                _schedule.push([_slot.name, [_slot.start, _slot.end]]);
            }
            _export.push(_schedule);
        }
    }

    return _export;
}

export default main;
