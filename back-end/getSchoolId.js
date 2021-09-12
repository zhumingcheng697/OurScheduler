const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const solve = require("./solve.js");

async function getSchoolId(target, dev) {
    puppeteer.use(pluginStealth());

    const browser = await puppeteer.launch({
        headless: !dev,
        args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-web-security", "--disable-features=IsolateOrigins", " --disable-site-isolation-trials", "--disable-setuid-sandbox"]
    });

    try {
        const page = await browser.newPage();

        await page.goto(
            `https://www.google.com/search?q=${target.replace(/\s/g, "+")}+Coursicle`
        );

        await page.waitForFunction(() =>
            (document.querySelectorAll("iframe[src*=\"api2/anchor\"], #search div a").length)
        );

        const needSolving = await page.evaluate(() => {
            return !!document.querySelector("iframe[src*=\"api2/anchor\"]");
        });

        if (needSolving) {
            await solve(page);
        }

        return await page.evaluate(() => {
            const anchors = document.querySelectorAll(`#search div a`);

            for (let index = 0; index < anchors.length; ++index) {
                const match = anchors[index].href.match(/\/\/www.coursicle.com\/([^\/]+)\//);
                if (match && match[1]) {
                    return match[1];
                }
            }
        });
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

// (async () => {
//     for (const school of ["New York University", "UNC", "Cornell", "University of Southern California", "UCB", "Penn State"]) {
//         const webUrl = await getSchoolUrl(school, true);
//         console.log(webUrl);
//     }
// })();

module.exports = getSchoolId;
