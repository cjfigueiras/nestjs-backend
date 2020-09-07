export const toSnake = (o) => {
    if (o instanceof Array) {
        return o.map((value) => {
            if (typeof value === 'object') {
                value = toSnake(value);
            } else if (typeof value === 'string') {
                value = snake(value);
            }
            return value;
        });
    } else {
        const newO = {};
        for (const origKey in o) {
            if (o.hasOwnProperty(origKey)) {
                const newKey = snake(origKey);
                let value = o[origKey];
                if (value instanceof Array || (value !== null && value.constructor === Object)) {
                    value = toSnake(value);
                }
                newO[newKey] = value;
            }
        }
        return newO;
    }
};

function snake(str) {
    let transformed: string = '';
    let last: number = 0;
    for (let c of str) {
        if (('A' <= c && c <= 'Z') || ('0' <= c && c <= '9')) {
            transformed += '_' + c;
        } else {
            transformed += c;
        }
    }
    return transformed.toLowerCase();
}
