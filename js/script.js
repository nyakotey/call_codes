const $ = (elem) => document.querySelectorAll(elem);


const render = (elem, data) => elem.innerHTML = data;


const getQuery = () => input.value;


const genRegex = (pattern) => new RegExp(pattern, "gm");


function validateQuery(query) {
    const general = genRegex(/^[+]{1}(\d\d?-){0,1}[0-9]{1,4}$/);
    if (general.test(query)) {
        return true;
    }
    return false;
}


async function fetchDB(dbPath) {
    try {
        let resp = await fetch(dbPath);
        return await resp.json();
    } catch (error) {
        render(output, err.oops);
    }
}


function searchDB(db, filterField, searchArg) {
    return db.filter((e) => e[filterField] == searchArg);
}


async function fetchAndFilter(searchArg, filterField, dbLink) {
    let json = await fetchDB(dbLink);
    let city = searchDB(json, filterField, searchArg);
    return city;
}

async function searchRegion(query) {
    // region regex
    const northAmericaRegex = genRegex(/[+]1-[0-9]{3,}/);
    // region search
    if (northAmericaRegex.test(query)) {
        return await searchNorthAmerica(query);
    }
}


async function searchNorthAmerica(searchArg) {
    let result = [];
    const statesDB = [["/db/canada_city_codes.json", "Canada"], ["/db/usa_city_codes.json", "United States"]];
    for (const state of statesDB) {
        const city = await fetchAndFilter(searchArg.split("+")[1], "Phone Code", state[0]);
        if (city.length != 0) {
            city.push(state[1]);
            result = city;
            break;
        }
    }
    if (result.length == 0) {
        return undefined;
    }
    result[0]["country"] = result[1];
    return result[0];
}


async function getExtraDetails(srcInfo) {
    let links = [];
    srcInfo.forEach(country => {
        links.push(`https://restcountries.com/v3.1/alpha/${country.isoCode}`)
    });
    console.table(links);
    const jsons = links.map(async (link) => await fetchDB(link));
    const details = await Promise.all(jsons);
    return details.flat();
}


function generate3PHtml(json = {}, query) {
    if (!("currencies" in json)) {
        return "";
    }
    const currencies = [], languages = [], timezones = [];
    for (const lang in json.languages) {
        languages.push([json.languages[lang]]);
    }
    for (const currency in json.currencies) {
        currencies.push(`<span class="currency_symbol">${json.currencies[currency].symbol || ":("}</span> ${json.currencies[currency].name}`);
    }
    for (const tz of json.timezones) {
        timezones.push(tz);
    }
    // limit max results to 3
    let html = /* html*/ `
    <div class="country_extra">
        <div class="code_title"> 
            <i class="fas fa-tty fa-fw extra_icons"></i>
            <span> DialCode </span>
        </div>
        <div class="continent_content">${query}</div>
        <div class="continent_title"> 
            <i class="fas fa-globe fa-fw extra_icons"></i>
            <span> Continent </span>
        </div>
        <div class="continent_content">${json.continents[0]}</div>

        <div class="currencies_title"> 
            <i class="fas fa-money-bill-alt fa-fw extra_icons"></i>
            <span> Currencies </span>
        </div>
        <div class="currencies_content">${currencies.splice(0, 3).join("<br>")}</div>

        <div class="lang_title"> 
            <i class="fas fa-language fa-fw extra_icons"></i>
            <span> Languages </span>
        </div>
        <div class="lang_content">${languages.splice(0, 3).join("<br>")}</div>

        <div class="tz_title"> 
            <i class="fas fa-clock fa-fw extra_icons"></i>
            <span> Timezones </span>
        </div>
        <div class="tz_content">
            ${timezones.slice(0, 2).join(", ") + "<br/>" + (timezones[2] || "")}
        </div>
        
        <!-- <div class="coa_title"> 
            <i class="fas fa-horse-head fa-fw extra_icons"></i>
            <span> Coat of Arms </span>
        </div>
        <div class="coa_content"><img src="${json.coatOfArms.png}" style="width:4rem;height:auto"/></div> -->
    </div>    
`;
    return html;
}


function generateHtml(mainData, externalInfo = [{}], city = {}, query = "+XXX") {
    let AllCountryHtml = "";
    let cityHtml = "Description" in city ? `<span class="country_region">${city["Description"]},</span>` : "";

    if (mainData.length == 0) {
        return err.notFound;
    }

    for (let i = 0; i < mainData.length; i++) {
        const details = mainData[i];
        let extraHtml = generate3PHtml(externalInfo[i], query);
        let countryHtml = `
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
    hideInfoPane();
    const loadingHtml = "<div style='color: #aaaaaabb;'>loading...</div>";
    render(output, loadingHtml);

    let query = getQuery();
    let validQuery = validateQuery(query);
    if (validQuery) {
        let mainInfo, region, allExternalInfo, countryHtml;
        const db = await fetchDB("/db/countries.json");
        region = await searchRegion(query);

        if (typeof (region) != 'undefined') {
            mainInfo = searchDB(db, "name", region["country"]);
        }
        else {
            mainInfo = searchDB(db, "dialCode", query);
        }
        allExternalInfo = await getExtraDetails(mainInfo);
        countryHtml = generateHtml(mainInfo, allExternalInfo, region, query);
        render(output, countryHtml);
    }
    else {
        render(output, err.invalidInput);
    }
}


function submitOnEnter(e) {
    if (e.keyCode == 13 || e.code == "Enter" || e.key == "Enter") {
        response();
    }
}


function hideInfoPane() {
    const infoPane = $(".info")[0];
    if (infoPane) {
        infoPane.classList.add("hide-info");
    }
}


async function tests() {
    render(output, "<b style='color:#ccc'>testing...</b>");

    const testRandomCountry = () => {
        let i = Math.floor(Math.random() * countries.length);
        return countries[i];
    };
    let countries = ["+255", "+241", "+239", "+44", "+237", "+1", "+1264", "+350", "+63", "+850", "+61", "+358", "+970", "+974", "+47"];
    let country = testRandomCountry();
    let db = await fetchDB("/db/countries.json");
    let data = searchDB(db, "dialCode", country);
    let allExternalInfo = await getExtraDetails(data);
    let countryHtml = generateHtml(data, allExternalInfo, undefined, country);

    render(output, countryHtml);
}


// main
const err = {
    invalidInput: `<div class="error">Please revise your input</div>`,
    notFound: `<div class="error">Not found</div>`,
    oops: `<div class="error">Oops an error occurred</div>`,
}
// dom
const input = $("input")[0];
const output = $(".display")[0];
const submitButton = $("button")[0];

input.addEventListener("enter", response);
input.addEventListener("keydown", submitOnEnter);
submitButton.addEventListener("click", response);

// tests();