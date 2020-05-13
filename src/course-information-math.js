/**
 * @author Larry Tseng
 * @date 5/12/2020
 * @desc Scrapes the UMass Mathematics website for course descriptions. Modeled off Daniel Melanson's CICS scraper.
 */

const fetch = require('node-fetch');
const cheerio = require('cheerio');

const baseURL = "https://www.math.umass.edu/course-descriptions/";
const cachePeriod = 1000*60*60*24;  // 1 day

let cache = {
    lastUpdatedStamp: new Date().getTime(),
    get expirationStamp() {
        return this.lastUpdatedStamp + cachePeriod
    },
    courses: []
};

async function updateCache() {
    let $ = cheerio();

    // Fetch the courses from the website
    await fetch(baseURL)
        .then((res) => res.text())
        .then((body) => $ = cheerio.load(body))
        .catch((err) => console.error(err));

    // Empty the cache and reset the clock
    cache.courses = [];
    cache.lastUpdatedStamp = new Date().getTime();

    // Parse the website and load the cache
    $('.node').each((index, element) => {
        cache.courses.push({
            name: $('.field-title', element).text().split(":")[0].trim(),
            title: $('.field-title', element).text().split(":")[1].trim(),
            instructors: $('.field-course-descr-instrtime', element).text().trim(),
            description: $('.field-course-descr-description', element).text().trim().trimEnd(),
            semester: "Fall 2020"
        })
    });

    console.log("Math courses cache loaded. Number of courses: " + cache.courses.length);
}

async function getMathClass(id) {
    console.log("Getting course " + id);

    // if cache has expired, reload cache (or if there is no cache)
    if (Date.now() > cache.expirationStamp || cache.courses.length === 0) {
        console.log("Updating cache.");
        await updateCache();
    }

    let result = cache.courses.find((course) => course.name === id);
    if (result === undefined) {
        result = cache.courses.find((course) => course.name === id + ".1")      // hack for STAT classes
    }

    // parse id
    return result;
}

// getMathClass('MATH 131').then((res) => console.log(res));

module.exports = {
    getMathClass: getMathClass,
};
