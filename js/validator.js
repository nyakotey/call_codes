const genRegex = (pattern) => new RegExp(pattern, "gmi");

export function isQueryValid(query, pattern) {
    let regex = genRegex(pattern);
    if (regex.test(query)) {
        return true;
    }
    return false;
}