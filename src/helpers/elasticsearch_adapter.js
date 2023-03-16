export const buildFetchAuthHeader = (username, password) => {
  if (username.length > 0 && password.length > 0) {
    return 'Basic ' + base64EncodeUtf8(username + ':' + password)
  } else if (username.length > 0) {
    return 'Basic ' + base64EncodeUtf8(username)
  } else if (password.length > 0) {
    // If no username was given, we assume that password is an api key
    return 'ApiKey ' + password
  }
}

const base64EncodeUtf8 = str => {
  return btoa(unescape(encodeURIComponent(str)))
}

export const addTrailingSlash = uri => {
  return uri[uri.length - 1] === '/' ? uri : uri + '/'
}
