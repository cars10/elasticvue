/*
 * ELASTICVUE_CLUSTERS='[{"name": "my cluster", "username": "elastic", "password": "elastic", "uri": "http://localhost:9508"}]'
 */
const ENV_NAME = 'ELASTICVUE_CLUSTERS'

const getDefaultClusters = () => {
  return process.env[ENV_NAME]?.trim()
}

const parseDefaultClusters = (rawDefaultClusters) => {
  if (rawDefaultClusters.length > 0) {
    try {
      return JSON.parse(rawDefaultClusters)
    } catch (_e) {
      errorExit(`${ENV_NAME} is not valid json:`, rawDefaultClusters)
    }
  }
}

const validateDefaultClusters = (parsedDefaultClusters) => {
  if (!Array.isArray(parsedDefaultClusters)) {
    errorExit(`${ENV_NAME} is not an array`, parsedDefaultClusters)
  }

  const validKeys = ['name', 'username', 'password', 'uri']
  parsedDefaultClusters.forEach((cluster) => {
    if (!cluster.uri || cluster.uri.trim().length === 0) {
      errorExit('Cluster uri missing', cluster)
    }

    const keys = Object.keys(cluster)
    keys.forEach((key) => {
      if (!validKeys.includes(key)) {
        errorExit(`'${key}' is not a valid option. Use only these: ${validKeys}`)
      }
    })
  })
}

const errorExit = (message, obj) => {
  console.log(`Error: ${ENV_NAME} not valid. ${message}`)
  if (obj) {
    if (typeof obj === 'object') {
      console.log(JSON.stringify(obj))
    } else {
      console.log(obj)
    }
  }
  process.exit(1)
}

const prepareDefaultClusters = () => {
  const rawDefaultClusters = getDefaultClusters()
  if (!rawDefaultClusters || rawDefaultClusters.length === 0) return
  const parsedDefaultClusters = parseDefaultClusters(rawDefaultClusters)
  validateDefaultClusters(parsedDefaultClusters)

  return parsedDefaultClusters
}

module.exports = prepareDefaultClusters
