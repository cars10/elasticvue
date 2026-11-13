import { UAParser } from 'ua-parser-js'
import { BuildMode } from '../buildConfig.ts'
import { parseJson } from './json/parse.ts'

const UPDATE_API_URL = 'https://update.elasticvue.com/api/update'
export const RELEASES_URL = 'https://github.com/cars10/elasticvue/releases'

export type UpdateMode = 'self_update' | 'package_manager' | 'docker' | 'browser_extension' | 'manual'

type UpdateCheckUrlOptions = {
  version: string
  buildMode: string
  variant?: string
  userAgent: string
}

export const platformFromUserAgent = (userAgent: string) => {
  const data = new UAParser(userAgent).getResult()

  let target = (data.os.name || '').toLowerCase()
  let arch = data.cpu.architecture || ''

  if (target === 'macos') target = 'darwin'

  if (arch === 'amd64') {
    arch = 'x86_64'
  } else if (!arch && target === 'darwin') {
    arch = 'aarch64'
  }

  return { target, arch }
}

export const updateCheckUrl = ({ version, buildMode, variant, userAgent }: UpdateCheckUrlOptions) => {
  const { target, arch } = platformFromUserAgent(userAgent)
  const path = [version, buildMode, target, arch, variant || '']
    .filter((part) => part.length > 0)
    .map((part) => encodeURIComponent(part))
    .join('/')

  return `${UPDATE_API_URL}/${path}`
}

export const updateMode = (buildMode: string, selfUpdateSupported: boolean): UpdateMode => {
  if (buildMode === BuildMode.tauri) return selfUpdateSupported ? 'self_update' : 'package_manager'
  if (buildMode === BuildMode.docker) return 'docker'
  if (buildMode === BuildMode.browser_extension) return 'browser_extension'
  return 'manual'
}

export const versionFromResponse = (status: number, body: string): string | null => {
  if (status === 204) return null
  if (status !== 200) throw new Error(`update check failed with status ${status}`)

  const version = parseJson(body)?.version
  if (typeof version !== 'string' || version.length === 0) throw new Error('update check returned no version')
  return version
}
