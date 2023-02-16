const isBigNumber = num => !Number.isSafeInteger(+num)

const enquoteBigNumber = (jsonString) => {
    return jsonString.replaceAll(/([:\s\[,]*)(\d+)([\s,\]]*)/g, (str, prefix, bigNum, suffix) => {
        if (isBigNumber(bigNum)) {
            return `${prefix}"${bigNum}"${suffix}`
        } else {
            return str
        }
    })
}

const removeComments = (str) => {
    return str.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m);
}

export const parseJsonCommentsBigInt = (jsonString) => {
    const quoted = enquoteBigNumber(jsonString)
    const clean = removeComments(quoted)
    return JSON.parse(clean, (key, value) => {
        if (!isNaN(value) && isBigNumber(value)) {
            return BigInt(value)
        } else {
            return value
        }
    })
}
