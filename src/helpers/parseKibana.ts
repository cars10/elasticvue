const kibanaBodyRegex = /^(GET|POST|PUT|PATCH|HEAD|OPTIONS|DELETE)(?:\s(.*)?)?/

type KibanaRequest = {
    method: string | null,
    path: string | null,
    body: string | null
}

export const parseKibana = (input: string): KibanaRequest => {
    const lines = input.split('\n')
    const possibleRequestLine = lines[0]
    const [, ...rest] = lines
    
    const matches = possibleRequestLine.match(kibanaBodyRegex)

    const matchedMethod = matches?.[1]?.trim()
    if (matchedMethod && matchedMethod.length > 0) {
      const matchedpath = matches?.[2]?.trim()
      const path = matchedpath || ''
      const body = rest.join('\n')

      return { method: matchedMethod, path, body }
    } else {
      return { method: null, path: null, body: input }
    }
}
