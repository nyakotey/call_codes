import { databases, fetchRestCountriesData, searchDB, searchDBWithCallBack } from "./db.js";
import { isQueryValid } from "./validator.js";

class Search {
    constructor(searchStr, searchGroupNum) {
        this.search = searchStr;
        this.group = searchGroupNum;
    }
    /**
 * @returns {Promise} object with keys primaryData, secondaryData, extraData of types Object[] Object[] Object respectively 
 */
    async results() { }
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
            throw new TypeError(`${query} doesn't match`);
        }
    }
}

class NorthAmericanSearch extends Search {
    async results() {
        // initial values
        let primaryData = [];
        let secondaryData = [];
        let extraData = { group: this.group, search: this.search };

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
        extraData = { ...extraData, dialCode: this.search, city: this.region.city }
        return { primaryData, secondaryData, extraData }
    }
}

class GlobalSearch extends Search {
    async results() {
        let primaryData = searchDB(Search.db.global, "dialCode", this.search);
        let secondaryData = await fetchRestCountriesData(primaryData);
        let extraData = { group: this.group, search: this.search }
        return { primaryData, secondaryData, extraData }
    }
}

export class CountrySearch {
    static #modes = {fullName: /^[a-zA-Z ]{3,}$/};
    static run(query, queryId) {
        if (isQueryValid(query, CountrySearch.#modes.fullName)) {
            return new NameSearch(query, queryId);
        }
        else {
            throw new TypeError(`${query} doesn't match`);
        }
    }
}

class NameSearch extends Search {
    async results() {
        function callback(e, filterField, searchArg) {
            return isQueryValid(e[filterField],searchArg);
        }
        let primaryData = searchDBWithCallBack(Search.db.global, "name", this.search, callback);
        let secondaryData = await fetchRestCountriesData(primaryData);
        let extraData = { group: this.group, search: this.search };
        return { primaryData, secondaryData, extraData }
    }
}