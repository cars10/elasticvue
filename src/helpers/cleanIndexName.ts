export const cleanIndexName = (index: string) => {
  let result = index.replace(/%(?![\dA-Fa-f]{2})/g, '%25')

  result = result.replace(/<([^>]*)>/g, (_, content) => {
    const encodedContent = content
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E')
      .replace(/\//g, '%2F')
      .replace(/\{/g, '%7B')
      .replace(/\}/g, '%7D')
      .replace(/\|/g, '%7C')
      .replace(/\+/g, '%2B')
      .replace(/:/g, '%3A')
      .replace(/,/g, '%2C')
    return `%3C${encodedContent}%3E`
  })

  return result
}
