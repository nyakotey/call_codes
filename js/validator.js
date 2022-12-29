const genRegex = (pattern) => new RegExp(pattern, "gm");

export function isQueryValid(query, type) {
    let regex = genRegex(type);
    if (regex.test(query)) {
        return true;
    }
    return false;
}