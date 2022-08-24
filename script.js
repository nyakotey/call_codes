const $ = (elem) => document.querySelectorAll(elem);
const input = $("input")[0];
const output = $(".display")[0];
const submitButton = $("button")[0];
const errQueryHtml = `<div class="error">Please revise your input</div>`;

async function fetchDB() {
    let resp = await fetch("countries.json");
    json = await resp.json();
    return json;
}

function submitOnEnter(e) {
    if (e.keyCode == 13 || e.code == "Enter" || e.key == "Enter") {
        response(e);
    }
}
function getQuery() {
    query = input.value;
    // input.value = "";
    return query;
}

function search(db, searchArg) {
    return db.filter((e) => e.dialCode == searchArg);
}

function res2Html(result) {
    if (result.length == 0) {
        return `<div class="error">Not found</div>`;
    }
    result = result[0];
    return `
<div class="country">
    <p class="country_name">${result.name}</p>
    <div class="country_flag"><img src="${result.flag}" alt="" class="country_flag_img"></div>
</div>    
`;
}
function validateQuery(query) {
    // valid [.+0-9\-,]
    const nonMatch = /[a-zA-Z;:' "?<>/.{}\\\[\]@_=!#$%^&*]/gm;
    regex = new RegExp(nonMatch);
    if (regex.test(query) || query == "") {
        return false;
    }
    return true;
}

async function response() {
    query = getQuery();
    validQuery = validateQuery(query);
    if (validQuery) {
        db = await fetchDB();
        data = search(db, query);
        output.innerHTML = res2Html(data);
    } else {
        output.innerHTML = errQueryHtml;
    }
}

input.addEventListener("enter", response);
input.addEventListener("keydown", submitOnEnter);
submitButton.addEventListener("click", response);

async function tests() {
    const testRandomCountry = () => {
        countries = ["+255", "+241", "+239", "+237", "+1"];
        i = Math.floor(Math.random() * countries.length);
        return countries[i];
    };
    // const fake = {
    //     target: { value: randomCountry() },
    // };
    // response(fake);
    db = await fetchDB();
        data = search(db, testRandomCountry());
        output.innerHTML = res2Html(data);

}
// tests();
