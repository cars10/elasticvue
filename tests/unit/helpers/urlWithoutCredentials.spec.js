import { urlWithoutCredentials } from '@/helpers'

describe('helpers/urlWithoutCredentials', () => {
  it('returns the url when no credentials are given', () => {
    const url = 'http://localhost'
    expect(urlWithoutCredentials(url)).to.eql(url)
  })

  it('removes the credentials when only username is given', () => {
    const url = 'http://user@localhost'
    expect(urlWithoutCredentials(url)).to.eql(url.replace('user@', ''))
  })

  it('removes the credentials when username and password are given', () => {
    const url = 'http://user:password@localhost'
    expect(urlWithoutCredentials(url)).to.eql(url.replace('user:password@', ''))
  })
})
