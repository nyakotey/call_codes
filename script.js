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
        query = e.target.value;
        input.value = "";
        return query;
}

function search(db, searchArg) {
    return db.filter((e) => e.dialCode == searchArg);
}

function res2Html(result) {
    if (result.length == 0 ){
        return `<div class="error">Not found</div>`;
    }
    result = result[0];
    return `
<div class="country">
    <img src="${result.flag}" alt="country flag" class="country_flag">
    <p class="country_name">${result.name}</p>
</div>    
`;
}

async function response(e) {
    db = await fetchDB();
    console.log(db);
    query = getQuery(e);
    data = search(db, query);
    output.innerHTML = res2Html(data);
}

input.addEventListener("enter", response);
input.addEventListener("keydown", submitOnEnter);
submitButton.addEventListener("click",response);