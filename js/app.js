import { $, render, setElem } from "./util.js";
import { genGroupHtml } from "./SearchHelper.js";
import Tracker from "./tracker.js";
import { SearchController } from "./search.js";

// DOM
const infoPane = $(".info")[0];
const input = $(".input_box")[0];
const logs = $(".logs")[0];
const output = $(".output")[0];
const submitButton = $(".input_submit")[0];
const control = $("#search-mode")[0];

// main
input.addEventListener("keydown", submitOnEnter);
submitButton.addEventListener("click", process);
control.addEventListener("change", bindControlEvents);

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
    query = formatInput(query);
    let promiseResults = query.map(searchService);
    let results = await Promise.all(promiseResults);
    let resultsHtml = results.map(genGroupHtml).join("");
    render(output, resultsHtml);
    setElem(logs, Tracker.getlogs("html"));
    postSearchStyling();
}

function formatInput(input) {
    let raw = input.split(",");
    let queries = raw.map((q) => q.trim());
    return queries.filter((e) => e != "");
}

async function searchService(query, queryId) {
    let search = SearchController(control.value);
    try {
        return search.run(query, ++queryId).results();
    } catch (error) {
        console.log(error);
        if (error.name == "TypeError") {
            Tracker.log(`your input ${queryId}, "${query}" needs to be revised`);
            return [];
        }
    }
}

function preSearchStyling() {
    submitButton.classList.add("input_submit--disabled");
    submitButton.disabled = true;
    infoPane.classList.add("info--hide");
    const loadingHtml = `<div class="loader">
    <i class="fas fa-magnifying-glass search-icon"></i> &nbsp;Searching...
    </div>`;
    render(logs, "");
    render(output, loadingHtml);
}

function postSearchStyling() {
    submitButton.classList.remove("input_submit--disabled");
    submitButton.disabled = false;
}

function bindControlEvents(event) {
    Tracker.previous = "";
    switch (event.target.value) {
        case "dialCode":
            input.setAttribute("placeholder", "+233,+44");
                        input.setAttribute("type", "tel");
            break;
        case "country":
            input.setAttribute("placeholder", "New Zealand");
                        input.setAttribute("type", "text");
        default:
            break;
    }
}
