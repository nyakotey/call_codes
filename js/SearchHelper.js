function generateHtml(primData, secData, extra) {
    if (!secData || !primData) {
        return "<span></span>";
    }
    let cityHtml = extra?.city ? `<span class="country_region">${extra.city},</span>` : "";
    const currencies = [], languages = [], timezones = [];
    for (const lang in secData.languages) {
        languages.push([secData.languages[lang]]);
    }
    for (const currency in secData.currencies) {
        currencies.push(`<span class="currency_symbol">${secData.currencies[currency].symbol || ":("}</span> ${secData.currencies[currency].name}`);
    }
    for (const tz of secData.timezones) {
        timezones.push(tz);
    }
    // limit max results to 3
    return /* html*/ `
        <div class="country">
            <div class="search-group">${extra.group}</div>
            <p class="country_name">${cityHtml} ${primData.name}</p>
            <div class="country_flag"><img src="${primData.flag}" alt="" class="country_flag_img"></div>
            <div class="country_extra">
                <div class="code_title">
                    <i class="fas fa-tty fa-fw extra_icons"></i>
                    <span> DialCode </span>
                </div>
                <div class="continent_content">${ extra.dialCode || primData.dialCode}</div>
                <div class="continent_title">
                    <i class="fas fa-globe fa-fw extra_icons"></i>
                    <span> Continent </span>
                </div>
                <div class="continent_content">${secData.continents[0]}</div>

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
                    ${timezones.slice(0, 2).join(", ") + "<br />" + (timezones[2] || "")}
                </div>
            </div>
        </div>`;
}

export function genGroupHtml(data) {
    if (data.length == 0) {
        return ""
    }
    let groupHtml = "";
    for (let c = 0; c < data.primaryData.length; c++) {
        groupHtml += generateHtml(data.primaryData[c], data.secondaryData[c], data.extraData);
    }
    return groupHtml || `
    <div class="country country--notFound">
    <div class="search-group">${data.extraData.group}</div>
    <div class="country_flag"><img src="/img/world-map.svg" alt="" class="country_flag_img"></div>
    <div class="country_extra">
        <div class="error">
            <p>${data.extraData.search} was not Found </p>
            <p style="color:var(--error-color)"><i class="fas fa-face-frown fa-2x"></i></p>
        </div>
    </div>
</div>
    `;
}