export const buildFetchAuthHeader = (username, password) => {
  if (username.length > 0 && password.length > 0) {
    return 'Basic ' + btoa(username + ':' + password)
  } else if (username.length > 0) {
    return 'Basic ' + btoa(username)
  } else if (password.length > 0) {
    // If no username was given, we assume that password is an api key
    return 'ApiKey ' + password
  }
}

export const addTrailingSlash = uri => {
  return uri[uri.length - 1] === '/' ? uri : uri + '/'
}
