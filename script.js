const $ = (elem) => document.querySelectorAll(elem);


const getQuery = () => input.value;


const genRegex = (pattern) => new RegExp(pattern, "gm");


function validateQuery(query) {
    // valid [.+0-9\-,]
    const nonMatch = genRegex(/[a-zA-Z;:' "?<>/.{}\\\[\]@_=!#$%^&*]/);
    if (nonMatch.test(query) || query == "") {
        return false;
    }
    return true;
}


async function fetchDB(dbPath) {
    let resp = await fetch(dbPath);
    json = await resp.json();
    return json;
}


function generate3PHtml(json) {
    if (!("currencies" in json)) {
        return "";
    }
    const currencies = [], languages = [], timezones = [];
    for (const lang in json.languages) {
        languages.push([json.languages[lang]]);
    }
    for (const currency in json.currencies) {
        currencies.push(`(${json.currencies[currency].symbol}) ${json.currencies[currency].name}`);
    }
    for (const tz of json.timezones) {
        timezones.push(tz);
    }
    // limit max to 3 by splicing
    let html = `
    <div class="country_extra">
        <div class="continent_title">Continent</div>
        <div class="continent_content">${json.continents[0]}</div>
        <div class="currencies_title">Currencies</div>
        <div class="currencies_content">${currencies.splice(0, 3).join(", ")}</div>
        <div class="lang_title">Languages</div>
        <div class="lang_content">${languages.splice(0, 3).join(", ")}</div>
        <div class="tz_title">Timezones</div>
        <div class="tz_content">${timezones.splice(0, 3).join(", ")}</div>
        <!--<div class="coa_title">Coat of Arms</div>
        <div class="coa_content"><img src="${json.coatOfArms.png}" style="width:4rem;height:auto"/></div>-->
    </div>    
`;
    return html
}


function searchDB(db, filterField, searchArg) {
    return db.filter((e) => e[filterField] == searchArg);
}


async function fetchAndFilter(searchArg, filterField, dbLink) {
    let json = await fetchDB(dbLink);
    let city = searchDB(json, filterField, searchArg);
    return city;
}


async function searchNorthAmerica(searchArg) {
    let result = [];
    const northAmericaRegex = genRegex(/[+]1-[0-9]{3,}/);

    if (northAmericaRegex.test(searchArg)) {
        statesDB = [["canada_city_codes.json", "Canada"], ["usa_city_codes.json", "United States"]];
        for (const state of statesDB) {
            let city = await fetchAndFilter(searchArg.split("+")[1], "Phone Code", state[0]);
            if (city.length != 0) {
                city.push(state[1]);
                result = city;
                break;
            }
        }
        if (result.length == 0) {
            return undefined
        }
        result[0]["country"] = result[1];
        return result[0];
    }
}


function generateHtml(mainData, externalInfo = {}, city = {}) {
    let AllCountryHtml = "";
    let notFoundHtml = `<div class="error">Not found</div>`;
    let cityHtml = "Description" in city ? `<span class="country_region">${city["Description"]},</span>` : "";

    if (mainData.length == 0) {
        return notFoundHtml;
    }

    for (let i = 0; i < mainData.length; i++) {
        const details = mainData[i];
        let extraHtml = generate3PHtml(externalInfo[i]);
        countryHtml = `
            <div class="country">
            <p class="country_name">${cityHtml} ${details.name}</p>
            <div class="country_flag"><img src="${details.flag}" alt="" class="country_flag_img"></div>
            ${extraHtml}
            </div>    
            `;
        AllCountryHtml += countryHtml;
    };
    return AllCountryHtml;
}


async function response() {
    const loadingHtml = "<div style='color: #aaaaaabb;'>loading...</div>";
    output.innerHTML = loadingHtml;

    let query = getQuery();
    let validQuery = validateQuery(query);
    if (validQuery) {
        let mainInfo;
        const db = await fetchDB("countries.json");
        let northAmerican = await searchNorthAmerica(query);

        if (typeof (northAmerican) != 'undefined') {
            mainInfo = searchDB(db, "name", northAmerican["country"]);
        }
        else {
            mainInfo = searchDB(db, "dialCode", query);
        }

        AllExternalInfo = await getExtraDetails(mainInfo);
        output.innerHTML = generateHtml(mainInfo, AllExternalInfo, northAmerican);
    }
    else {
        const errQueryHtml = `<div class="error">Please revise your input</div>`;
        output.innerHTML = errQueryHtml;
    }
}


async function getExtraDetails(srcInfo) {
    let links = [];
    srcInfo.forEach(country => {
        links.push(`https://restcountries.com/v3.1/name/${country.name}`)
    });
    const jsons = links.map(async (link) => await fetchDB(link));
    const details = await Promise.all(jsons);
    return details.flat();
}


function submitOnEnter(e) {
    if (e.keyCode == 13 || e.code == "Enter" || e.key == "Enter") {
        response();
    }
}


async function tests() {
    const testRandomCountry = () => {
        countries = ["+255", "+241", "+239", "+44", "+237", "+1", "+1264"];
        i = Math.floor(Math.random() * countries.length);
        return countries[i];
    };
    db = await fetchDB("countries.json");
    data = searchDB(db, "dialCode", testRandomCountry());

    AllExternalInfo = await getExtraDetails(data);
    output.innerHTML = generateHtml(data, AllExternalInfo);
}
// tests();


// main
const input = $("input")[0];
const output = $(".display")[0];
const submitButton = $("button")[0];

input.addEventListener("enter", response);
input.addEventListener("keydown", submitOnEnter);
submitButton.addEventListener("click", response);
