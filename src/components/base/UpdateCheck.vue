<template>
  <div v-if="newVersion" class="inline-block">
    <a href="https://github.com/cars10/elasticvue/releases" target="_blank" class="decoration-none"> Update {{ newVersion }} </a>
  </div>
</template>

<script setup lang="ts">
import { UAParser } from 'ua-parser-js'
import { buildConfig } from '../../buildConfig.ts'
import { onMounted, ref } from 'vue'
import { uuidHeader } from '../../helpers/uuidHeader.ts'

const version = __APP_VERSION__

const newVersion = ref(null)

const check = async () => {
  const url = updateCheckUrl()
  try {
    const response = await fetch(url, { headers: uuidHeader() })
    if (response.status === 200) {
      const json = await response.json()
      newVersion.value = json.version
    }
  } catch (_e) {}
}
onMounted(check)

const updateCheckUrl = () => {
  const data = uaData()
  const mappedData = mapUaData(data)

  const pathData = [version, buildConfig.buildMode, mappedData.target, mappedData.arch, buildConfig.variant]
  const path = pathData.filter((d) => d?.length > 0).join('/')
  return `https://update.elasticvue.com/api/update/${path}`
}

const uaData = () => {
  const parser = new UAParser(navigator.userAgent)
  const data = parser.getResult()

  return {
    target: data.os.name as string,
    arch: data.cpu.architecture as string
  }
}

const mapUaData = (uaData: { target: string; arch: string }) => {
  let target = uaData.target.toLowerCase()
  let arch = uaData.arch

  if (target.toLowerCase() === 'macos') {
    target = 'darwin'
  }

  if (arch === 'amd64') {
    arch = 'x86_64'
  } else if (!arch && target === 'darwin') {
    arch = 'aarch64'
  }

  return { target, arch }
}
</script>
