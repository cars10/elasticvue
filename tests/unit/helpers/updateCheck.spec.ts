import { describe, it, expect } from 'vitest'
import { platformFromUserAgent, updateCheckUrl, updateMode, versionFromResponse } from '../../../src/helpers/updateCheck'

const LINUX_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
const MAC_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
const WINDOWS_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

describe('helpers/updateCheck', () => {
  describe('platformFromUserAgent', () => {
    it('maps linux amd64 to x86_64', () => {
      expect(platformFromUserAgent(LINUX_UA)).toEqual({ target: 'linux', arch: 'x86_64' })
    })

    it('maps macos to darwin and falls back to aarch64', () => {
      expect(platformFromUserAgent(MAC_UA)).toEqual({ target: 'darwin', arch: 'aarch64' })
    })

    it('maps windows', () => {
      expect(platformFromUserAgent(WINDOWS_UA)).toEqual({ target: 'windows', arch: 'x86_64' })
    })

    it('returns empty values for an unknown user agent', () => {
      expect(platformFromUserAgent('')).toEqual({ target: '', arch: '' })
    })
  })

  describe('updateCheckUrl', () => {
    it('builds the url from version, build mode and platform', () => {
      const url = updateCheckUrl({ version: '2.0.0', buildMode: 'docker', variant: '', userAgent: LINUX_UA })
      expect(url).toBe('https://update.elasticvue.com/api/update/2.0.0/docker/linux/x86_64')
    })

    it('appends the variant', () => {
      const url = updateCheckUrl({ version: '2.0.0', buildMode: 'browser_extension', variant: 'firefox', userAgent: LINUX_UA })
      expect(url).toBe('https://update.elasticvue.com/api/update/2.0.0/browser_extension/linux/x86_64/firefox')
    })

    it('skips unknown platform parts', () => {
      const url = updateCheckUrl({ version: '2.0.0', buildMode: 'other', userAgent: '' })
      expect(url).toBe('https://update.elasticvue.com/api/update/2.0.0/other')
    })
  })

  describe('updateMode', () => {
    it('self updates in the desktop app when supported', () => {
      expect(updateMode('tauri', true)).toBe('self_update')
    })

    it('only notifies in desktop installs that cannot update themselves', () => {
      expect(updateMode('tauri', false)).toBe('package_manager')
    })

    it('never self updates outside the desktop app', () => {
      expect(updateMode('docker', true)).toBe('docker')
      expect(updateMode('browser_extension', true)).toBe('browser_extension')
      expect(updateMode('other', true)).toBe('manual')
    })
  })

  describe('versionFromResponse', () => {
    it('returns the version of a 200 response', () => {
      expect(versionFromResponse(200, '{"version":"2.1.0"}')).toBe('2.1.0')
    })

    it('returns null for 204', () => {
      expect(versionFromResponse(204, '')).toBeNull()
    })

    it('throws for error responses', () => {
      expect(() => versionFromResponse(500, '')).toThrow()
      expect(() => versionFromResponse(404, '')).toThrow()
    })

    it('throws when the response has no version', () => {
      expect(() => versionFromResponse(200, '{}')).toThrow()
      expect(() => versionFromResponse(200, 'not json')).toThrow()
    })
  })
})
