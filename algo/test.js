let LEC = [
    ["-101", [540, 600],
        [1800, 1860]
    ],
    ["-102", [600, 660],
        [1860, 1920]
    ]
];
let EXT = [
    ["-A", [3200, 3260]],
    ["-B", [3260, 3320]]
];

for (let lecture of LEC) {
    for (let lab of EXT) {
        let _lec = lecture.slice().splice(1);
        let _lab = lab.slice().splice(1);
        let result = [];
        for (let __lec of _lec) {
            result.push(__lec.concat(lecture[0]));
        }
        for (let __lab of _lab) {
            result.push(__lab.concat(lab[0]));
        }
        console.log(result);

    }
}