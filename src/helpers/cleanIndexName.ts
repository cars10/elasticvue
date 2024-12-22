export const cleanIndexName = (index: string) => {
  return index.replace(/%/g, '%25').replace(/<.*?>/g, (match) => {
    return match
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E')
        .replace(/\//g, '%2F')
        .replace(/\{/g, '%7B')
        .replace(/\}/g, '%7D')
        .replace(/\|/g, '%7C')
        .replace(/\+/g, '%2B')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C')
  })
}
