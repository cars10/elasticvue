import {DefaultClient} from "./DefaultClient";

export class DockerClient extends DefaultClient {
  constructor(instance) {
    super(instance);
  }

  request (path, method, params) {
      const url = new URL(this.host + path)

      if (method === 'GET' && typeof params === 'object') {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
      }
      path = url.pathname + url.search;
      let body = null
      if (method === 'PUT' || method === 'POST') body = params

      const options = {
        method,
        'X-EV-path': path,
        body: body && typeof body !== 'string' ? stringifyJsonBigInt(body) : body,
        headers: Object.assign({}, REQUEST_DEFAULT_HEADERS)
      }

      if (this.username.length > 0 || this.password.length > 0) {
        options.headers.Authorization = buildFetchAuthHeader(this.username, this.password)
      }
      const proxypath = location.protocol + '//' + location.host + (location.port ? ':' + location.port : '' ) + '/proxy';
      return new Promise((resolve, reject) => {
        return fetchMethod(proxypath, options)
          .then(response => {
            if (options.method === 'HEAD') {
              return resolve(response.ok)
            }

            if (response.ok) {
              resolve(response)
            } else {
              reject(response)
            }
          }).catch(reject)
      })

  }
}
