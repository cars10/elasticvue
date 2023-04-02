const isBigNumber = (num: any) => !Number.isSafeInteger(+num)

const enquoteBigNumber = (jsonString: string): string => {
  return jsonString.replaceAll(/([:\s\[,]*)(\d+)([\s,\]]*)/g, (str, prefix, bigNum, suffix) => {
    if (isBigNumber(bigNum)) {
      return `${prefix}"${bigNum}"${suffix}`
    } else {
      return str
    }
  })
}

export const removeComments = (str: string): string => {
  return str.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? '' : m)
}

export const parseJsonCommentsBigInt = (jsonString: string): object => {
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
