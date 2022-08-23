const $ = (elem) => document.querySelectorAll(elem);
const input = $("input")[0];
const output = $(".display")[0];
const submitButton = $("button")[0];

async function fetchDB() {
    let resp = await fetch("countries.json");
    json = await resp.json();
    return json;
}

function submitOnEnter(e) {
    if (e.keyCode == 13 || e.code == "Enter" || e.key == "Enter"){
        response(e)
    }
}
function getQuery(e) {
        return e.target.value;
        input.value = "";
}

function search(db, searchArg) {
    return db.filter((e) => e.dialCode == searchArg);
}

function resultHtml(result) {
    return `<img src="${result.flag}" alt="country flag" class="country-flag">
    <p class="country-name">${result.name}</p>`;
}

async function response(e) {
    db = await fetchDB();
    console.log(db);
    query = getQuery(e);
    data = search(db, query);
    output.innerHTML = resultHtml(...data);
}

input.addEventListener("enter", response);
input.addEventListener("keydown", submitOnEnter);
submitButton.addEventListener("click",response);