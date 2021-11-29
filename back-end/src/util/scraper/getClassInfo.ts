import puppeteer from "puppeteer-extra";
import pluginStealth from "puppeteer-extra-plugin-stealth";
import solve from "./solve";
import { ScrapedSection } from "../type";

async function getClassInfo(schoolCode: string, target: string, dev: boolean = false): Promise<ScrapedSection[]> {
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
                await page.waitForTimeout(100);
            }
        }

        return await page.evaluate(async () => {
            const res: ScrapedSection[] = [];
            const cards = document.querySelectorAll(`div#cardContainer .card.back`);

            for (const card of Array.from(cards)) {
                function sleep(ms: number): Promise<void> {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }

                function cleanedText(el: HTMLElement): string {
                    return el.textContent.replace(/^\s+|\s+$|\n/g, "");
                }

                const name: HTMLElement = card.querySelector(`div.courseNumberBack span.abbrevTitle`);
                const subject: HTMLElement = card.querySelector(`div.courseNumberBack span.subject`);
                const number: HTMLElement = card.querySelector(`div.courseNumberBack span.number`);
                const section: HTMLElement = card.querySelector(`div.courseNumberBack span.section`);
                const time: HTMLElement = card.querySelector(`div.courseNameBack div.time`);
                const days: HTMLElement = card.querySelector(`div.courseNameBack div.days`);
                const infoIcon: HTMLElement = card.querySelector(`div.infoIcon > i`);

                if (name && subject && number && section && time && days && infoIcon) {
                    const className = cleanedText(name);
                    const classLabel = cleanedText(subject) + " " + cleanedText(number);
                    const classSection = "-" + cleanedText(section);
                    const classTime = cleanedText(time);
                    const classDays = cleanedText(days);

                    infoIcon.click();

                    await sleep(100);

                    const credits: HTMLElement = document.querySelector(`.modal-body div.credits`);
                    const creditsTitle: HTMLElement = document.querySelector(`.modal-body div.credits span.creditTitle`);

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

                    const closeBtn: HTMLElement = document.querySelector(`.modal-content .modal-header button`);

                    if (closeBtn) {
                        closeBtn.click();

                        await sleep(100);
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

export default getClassInfo;
