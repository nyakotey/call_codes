import { fetchRestCountriesData, searchDB, searchDBWithCallBack, fetchDB, } from "./db.js";
import { isQueryValid } from "./validator.js";

class Search {
    deps = {};
    static #cacheDB = new Map();

    constructor(searchStr, searchGroupNum) {
        this.search = searchStr;
        this.group = searchGroupNum;
    }
    /**
     * @returns {Promise} object with keys primaryData, secondaryData, extraData of types Object[] Object[] Object respectively
     */
    async results() { }

    async accessDB(db = "") {
        if (Search.#cacheDB.has(db)) return Search.#cacheDB.get(db);
        Search.#cacheDB.set(db, fetchDB(db));
        return await Search.#cacheDB.get(db);
    }
}

export class DialCodeSearch {
    static #modes = {
        global: /^[+]{1}(\d\d?-){0,1}[0-9]{1,4}$/,
        region: {
            northAmerica: /[+]1-[0-9]{3,}$/,
        },
    };

    static run(query, queryId) {
        if (isQueryValid(query, DialCodeSearch.#modes.region.northAmerica)) {
            return new NorthAmericanSearch(query, queryId);
        }
        if (isQueryValid(query, DialCodeSearch.#modes.global)) {
            return new GlobalSearch(query, queryId);
        }
        throw new TypeError(`${query} doesn't match ${this.name} regex`);
    }
}

class NorthAmericanSearch extends Search {
    deps = {
        global: "db/countries.js",
        canada: "db/canada_city_codes.js",
        usa: "db/usa_city_codes.js",
    }

    async results() {
        // initial values
        let primaryData = [];
        let secondaryData = [];
        let extraData = { group: this.group, search: this.search };
        
        let areaCode = this.search.split("+")[1];
        let canadaDB = await this.accessDB(this.deps.canada);
        let usaDB = await this.accessDB(this.deps.usa);

        let cityCanada = searchDB(canadaDB, "Phone Code", areaCode);
        if (cityCanada.length != 0) {
            this.region = { name: "Canada", city: cityCanada[0].Description };
        }
        else {
            let cityUSA = searchDB(usaDB, "Phone Code", areaCode);
            if (cityUSA.length != 0) {
                this.region = { name: "United States", city: cityUSA[0].Description, };
            }
        }
        if (!this.region) {
            return { primaryData, secondaryData, extraData };
        }
        primaryData = searchDB(await this.accessDB(this.deps.global), "name", this.region.name);
        secondaryData = await fetchRestCountriesData(primaryData);
        extraData = { ...extraData, dialCode: this.search, city: this.region.city, };
        return { primaryData, secondaryData, extraData };
    }
}

class GlobalSearch extends Search {
    deps = { global: "db/countries.js" };

    async results() {
        let primaryData = searchDB(await this.accessDB(this.deps.global), "dialCode", this.search);
        let secondaryData = await fetchRestCountriesData(primaryData);
        let extraData = { group: this.group, search: this.search };
        return { primaryData, secondaryData, extraData };
    }
}

export class CountrySearch {
    static #modes = { fullName: /^[a-zA-Z ]{3,}$/ };

    static run(query, queryId) {
        if (isQueryValid(query, CountrySearch.#modes.fullName)) {
            return new NameSearch(query, queryId);
        }
        throw new TypeError(`${query} doesn't match ${this.name} regex`);
    }
}

class NameSearch extends Search {
    deps = { global: "db/countries.js" };

    async results() {
        function callback(e, filterField, searchArg) {
            return isQueryValid(e[filterField], searchArg);
        }
        let primaryData = searchDBWithCallBack(await this.accessDB(this.deps.global), "name", this.search, callback);
        let secondaryData = await fetchRestCountriesData(primaryData);
        let extraData = { group: this.group, search: this.search };
        return { primaryData, secondaryData, extraData };
    }
}

export function SearchController(searchMode) {
    let search;
    switch (searchMode) {
        case "dialCode":
            search = DialCodeSearch;
            break;
        case "country":
            search = CountrySearch;
            break;
        default:
            break;
    }
    return search;
}