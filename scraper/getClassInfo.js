const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const solve = require("./solve.js");

async function getClassInfo(schoolCode, target, dev) {
    puppeteer.use(pluginStealth());

    const browser = await puppeteer.launch({
        headless: !dev,
        args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-web-security", "--disable-features=IsolateOrigins", " --disable-site-isolation-trials", "--disable-setuid-sandbox"]
    });

    try {
        const page = await browser.newPage();

        await page.goto(
            `https://www.coursicle.com/${schoolCode}/#search=${target}`
        );

        await page.waitForFunction(() =>
            (document.querySelectorAll("iframe[src*=\"api2/anchor\"], #cardContainer").length)
        );

        const needSolving = await page.evaluate(() => {
            return !!document.querySelector("iframe[src*=\"api2/anchor\"]");
        });

        if (needSolving) {
            await solve(page);
        }

        let loadFinished = false;

        while (!loadFinished) {
            try {
                await page.click(`#moreButton`);
                await page.waitForTimeout(500);
            } catch (e) {
                loadFinished = true;
                await page.waitForTimeout(1000);
            }
        }

        return await page.evaluate(async () => {
            const res = [];
            const cards = document.querySelectorAll(`div#cardContainer .card.back`);

            // const scraped = [["test1", "TEST 001", "-101", [0,2], "1:50pm-2:50pm", 3],
            //     ["test1", "TEST 001", "-102", [0,2], "2:50pm-3:50pm", 3],
            //     ["test1", "TEST 001", "-A", [4], "1:50pm-2:50pm", 0],
            //     ["test1", "TEST 001", "-B", [4], "2:50pm-3:50pm", 0]];

            for (const card of Array.from(cards)) {
                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }

                /**
                 * @param {HTMLElement} el
                 * @return {string}
                 */
                function cleanedText(el) {
                    return el.textContent.replace(/^\s+|\s+$|\n/g, "");
                }

                const name = card.querySelector(`div.courseNumberBack span.abbrevTitle`);
                const subject = card.querySelector(`div.courseNumberBack span.subject`);
                const number = card.querySelector(`div.courseNumberBack span.number`);
                const section = card.querySelector(`div.courseNumberBack span.section`);
                const time = card.querySelector(`div.courseNameBack div.time`);
                const days = card.querySelector(`div.courseNameBack div.days`);
                const infoIcon = card.querySelector(`div.infoIcon > i`);

                if (name && subject && number && section && time && days && infoIcon) {
                    const className = cleanedText(name);
                    const classLabel = cleanedText(subject) + " " + cleanedText(number);
                    const classSection = "-" + cleanedText(section);
                    const classTime = cleanedText(time);
                    const classDays = cleanedText(days);

                    infoIcon.click();

                    await sleep(1000);

                    const credits = document.querySelector(`.modal-body div.credits`);
                    const creditsTitle = document.querySelector(`.modal-body div.credits span.creditTitle`);

                    if (credits && creditsTitle && !classTime.includes("TBA") && !classDays.includes("TBA")) {
                        const classCredit = cleanedText(credits).replace(cleanedText(creditsTitle), "").replace(/\s+/g, "");

                        const daysArray = [];

                        if (classDays.includes("M")) {
                            daysArray.push(0);
                        }
                        if (classDays.match(/T$|T[^h]/g)) {
                            daysArray.push(1);
                        }
                        if (classDays.includes("W")) {
                            daysArray.push(2);
                        }
                        if (classDays.includes("Th")) {
                            daysArray.push(3);
                        }
                        if (classDays.includes("F")) {
                            daysArray.push(4);
                        }
                        if (classDays.includes("Sa")) {
                            daysArray.push(5);
                        }

                        res.push([className.toUpperCase(), classLabel.toUpperCase(), classSection.toUpperCase(), daysArray, classTime, +classCredit]);
                    }

                    const closeBtn = document.querySelector(`.modal-content .modal-header button`);

                    if (closeBtn) {
                        closeBtn.click();

                        await sleep(1000);
                    }
                }
            }

            return res.sort((a, b) => {
                if (a[5] > b[5]) {
                    return -1;
                } else if (a[5] < b[5]) {
                    return 1;
                } else {
                    return 0;
                }
            });
        });
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

// (async () => {
//     const classesInfo = await getClassInfo("nyu", "mauy 2314", true);
//     console.log(classesInfo);
//     require("./insert")("nyu", classesInfo);
// })();

module.exports = getClassInfo;
