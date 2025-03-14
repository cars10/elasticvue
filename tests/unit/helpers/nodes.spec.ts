import { describe, it, expect } from 'vitest'

import { nodeRoleTitle } from '../../../src/helpers/nodes'

const NEWLINE = '\r\n'

describe.concurrent('helpers/nodes.ts', () => {
  describe.concurrent('nodes.ts nodeRoleTitle', () => {
    it('should return empty string when supplied with empty string', () => {
      expect(nodeRoleTitle('')).toBe('')
    })

    it('should return all role titles when input string contains them all', () => {
      // include all lowercase latin alphabet characters and hyphen character for future proofing
      const nodes = new Set(nodeRoleTitle('abcdefghijklmnopqrstuvwxyz-').trimEnd().split(NEWLINE))

      expect(nodes.size).toBe(13)

      expect(nodes).toContain('c - cold node')
      expect(nodes).toContain('d - data node')
      expect(nodes).toContain('f - frozen node')
      expect(nodes).toContain('h - hot node')
      expect(nodes).toContain('i - ingest node')
      expect(nodes).toContain('l - machine learning node')
      expect(nodes).toContain('m - master-eligible node')
      expect(nodes).toContain('r - remote cluster client node')
      expect(nodes).toContain('s - content node')
      expect(nodes).toContain('t - transform node')
      expect(nodes).toContain('v - voting-only node')
      expect(nodes).toContain('w - warm node')
      expect(nodes).toContain('coordinating nodes')
    })

    it('should only include a single role title when input is a single role character', () => {
      const supportedRoles = new Map([
        ['c', 'c - cold node'],
        ['d', 'd - data node'],
        ['f', 'f - frozen node'],
        ['h', 'h - hot node'],
        ['i', 'i - ingest node'],
        ['l', 'l - machine learning node'],
        ['m', 'm - master-eligible node'],
        ['r', 'r - remote cluster client node'],
        ['s', 's - content node'],
        ['t', 't - transform node'],
        ['v', 'v - voting-only node'],
        ['w', 'w - warm node'],
        ['-', 'coordinating nodes']
      ])

      for (const [role, title] of supportedRoles) {
        expect(nodeRoleTitle(role).trimEnd()).toBe(title)
      }
    })

    it('should return an empty string for all unsupported latin-1 lowercase letters', () => {
      const unsupportedRoleTypes = ['a', 'b', 'e', 'g', 'j', 'k', 'n', 'o', 'p', 'q', 'u', 'x', 'y', 'z']

      for (const role of unsupportedRoleTypes) {
        expect(nodeRoleTitle(role)).toBe('')
      }
    })
  })
})