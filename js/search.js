import { databases, fetchRestCountriesData, searchDB } from "./db.js";
import { isQueryValid } from "./validator.js";

class Search {
    constructor(searchStr, searchGroupNum) {
        this.search = searchStr;
        this.group = searchGroupNum;
    }
    static db = databases;
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
        else {
            throw new TypeError(`${this.search} needs to be revised`);
        }
    }
}

class NorthAmericanSearch extends Search {
    async results() {
        // initial values
        let primaryData = []
        let secondaryData = []
        let extraData = { group: this.group, search: this.search }

        let cityCanada = searchDB(Search.db.canada, "Phone Code", this.search.split("+")[1]);
        if (cityCanada.length != 0) {
            this.region = { name: "Canada", city: cityCanada[0].Description };
        }
        else {
            let cityUSA = searchDB(Search.db.usa, "Phone Code", this.search.split("+")[1]);
            if (cityUSA.length != 0) {
                this.region = { name: "United States", city: cityUSA[0].Description };
            }
        }
        if ([null, undefined].includes(this.region)) {
            return { primaryData, secondaryData, extraData };
        }
        primaryData = searchDB(Search.db.global, "name", this.region.name);
        secondaryData = await fetchRestCountriesData(primaryData);
        extraData = { group: this.group, dialCode: this.search, city: this.region.city }
        return { primaryData, secondaryData, extraData }
    }
}

class GlobalSearch extends Search {
    /**
     * @returns {Promise} object with keys primaryData, secondaryData, extraData of types Object[] Object[] Object respectively 
     */
    async results() {
        let primaryData = searchDB(Search.db.global, "dialCode", this.search);
        let secondaryData = await fetchRestCountriesData(primaryData);
        let extraData = { group: this.group}
        return { primaryData, secondaryData, extraData }
    }
}