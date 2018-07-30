import { buildFetchAuthHeaderFromUrl } from '@/helpers'

describe('helpers/buildFetchAuthHeaderFromUrl', () => {
  it('returns empty object when no credentials are given', () => {
    const url = 'http://localhost'
    expect(buildFetchAuthHeaderFromUrl(url)).to.eql({})
  })

  it('returns the correct header and removes the credentials from the url when complete auth is given', () => {
    const url = 'http://user:password@localhost'
    const cred = 'Basic ' + Buffer.from('user:password').toString('base64')
    const expected = {'Authorization': cred}
    expect(buildFetchAuthHeaderFromUrl(url)).to.eql(expected)
  })

  it('returns the correct header and removes the credentials from the url when complete auth is given', () => {
    const url = 'http://user@localhost'
    const cred = 'Basic ' + Buffer.from('user').toString('base64')
    const expected = {'Authorization': cred}
    expect(buildFetchAuthHeaderFromUrl(url)).to.eql(expected)
  })
})
