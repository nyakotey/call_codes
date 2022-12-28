import Tracker from "./tracker.js";

async function fetchDB(dbPath) {
    try {
        let resp = await fetch(dbPath);
        return await resp.json();
    } catch (error) {
        Tracker.log("failed to Fetch Data");
    }
}
export function searchDB(db, filterField, searchArg) {
    return db.filter((e) => e[filterField] == searchArg);
}

export async function fetchRestCountriesData(srcInfo) {
    let links = [];
    srcInfo.forEach(country => {
        links.push(`https://restcountries.com/v3.1/alpha/${country.isoCode}`)
    });
    // console.table(links);
    const jsons = links.map(async (link) => await fetchDB(link));
    const details = await Promise.all(jsons);
    return details.flat();
}

async function DBs() {
    let global = await fetchDB("/db/countries.json");
    let canada = await fetchDB("/db/canada_city_codes.json");
    let usa = await fetchDB("/db/usa_city_codes.json");

    return {
        global, canada, usa
    }
}

let databases = await DBs();
export { databases };
