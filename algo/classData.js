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
                    ["13:00, 15:00"]
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
                    ["13:00, 15:00"]
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
                    ["12:00, 15:00"]
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