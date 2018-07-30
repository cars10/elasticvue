import { extractUrlCredsToAuthHeader } from '@/helpers'

describe('helpers/extractUrlCredsToAuthHeader', () => {
  it('returns empty object when no credentials are given', () => {
    const url = 'http://localhost'
    expect(extractUrlCredsToAuthHeader(url)).to.eql({url: url, header: {}})
  })

  it('returns the correct header and removes the credentials from the url when only username is given', () => {
    const url = 'http://user@localhost'
    const cred = 'Basic ' + Buffer.from('user').toString('base64')
    const expected = {url: 'http://localhost', header: {'Authorization': cred}}
    expect(extractUrlCredsToAuthHeader(url)).to.eql(expected)
  })

  it('returns the correct header and removes the credentials from the url when complete auth is given', () => {
    const url = 'http://user:password@localhost'
    const cred = 'Basic ' + Buffer.from('user:password').toString('base64')
    const expected = {url: 'http://localhost', header: {'Authorization': cred}}
    expect(extractUrlCredsToAuthHeader(url)).to.eql(expected)
  })
})
