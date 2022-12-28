import { $, render, setElem } from "./util.js";
import { DialCodeSearch } from "./search.js";
import { genGroupHtml } from "./SearchHelper.js";
import Tracker from "./tracker.js";

// DOM
const infoPane = $(".info")[0];
const input = $(".input_box")[0];
const logs = $(".logs")[0];
const output = $(".output")[0];
const submitButton = $(".input_submit")[0];

// main
input.addEventListener("keydown", submitOnEnter);
submitButton.addEventListener("click", process);

//defs
function submitOnEnter(e) {
    if (e.keyCode == 13 || e.code == "Enter" || e.key == "Enter") {
        process();
    }
}

async function process() {
    let query = input.value;

    if (query == "") return;
    if (Tracker.previous == query) return;
    
    Tracker.previous = query;
    preSearchStyling();
    query = query.split(",").filter((e) => e != "");
    let promiseResults = query.map(searchService);
    let results = await Promise.all(promiseResults);
    let resultsHtml = results.map(genGroupHtml).join("");
    render(output, resultsHtml);
    setElem(logs, Tracker.getlogs("html"));
    postSearchStyling();
}

async function searchService(query, queryId) {
    let search = DialCodeSearch;
    try {
        return search.run(query, ++queryId).results();
    } catch (error) {
        if (error.name == "TypeError") {
            Tracker.log(`your input ${queryId}, "${query}" needs to be revised`);
            return [];
        }
    }
}

function preSearchStyling() {
    submitButton.classList.add("input_submit--disabled");
    infoPane.classList.add("info--hide");
    const loadingHtml = `<div class="loader">
    <i class="fas fa-magnifying-glass search-icon"></i> &nbsp;Searching...
    </div>`;
    render(logs,"");
    render(output, loadingHtml);
}

function postSearchStyling() {
    submitButton.classList.remove("input_submit--disabled");
}