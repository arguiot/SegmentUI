function getAtPath(obj, path) {
    const parts = path.split(".");
    let val = obj[parts[0]];

     for (let p = 1; p < parts.length; p++) {
        val = val[parts[p]];
    }

     return val;
}

function handlebars(string, obj) {
    return string.replace(/{{\S+}}/gm, (match, offset, string) => {
        const m = match.slice(2, -2)
        const v = getAtPath(obj, m)
        if (typeof v == "undefined") {
            return match
        }
        return v
    })
}

export default handlebars
