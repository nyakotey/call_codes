import Tracker from "./tracker.js";

export async function fetchDB(dbPath) {
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

export function searchDBWithCallBack(db, filterField, searchArg, callback) {
    return db.filter((e) => callback(e, filterField, searchArg));
}

export async function fetchRestCountriesData(srcInfo) {
    let links = [];
    srcInfo.forEach(country => {
        links.push(`https://restcountries.com/v3.1/alpha/${country.isoCode}`)
    });
    const jsons = links.map(async (link) => await fetchDB(link));
    const details = await Promise.all(jsons);
    return details.flat();
}
