export const buildFetchAuthHeader = (username: string, password: string): string => {
  if (username.length > 0 && password.length > 0) {
    return 'Basic ' + base64EncodeUtf8(username + ':' + password)
  } else if (username.length > 0) {
    return 'Basic ' + base64EncodeUtf8(username)
  } else if (password.length > 0) {
    // If no username was given, we assume that password is an api key
    return 'ApiKey ' + password
  }

  return ''
}

const base64EncodeUtf8 = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)))
}

export const addTrailingSlash = (uri: string): string => {
  return uri[uri.length - 1] === '/' ? uri : uri + '/'
}
