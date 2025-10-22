import { cleanIndexName } from './cleanIndexName'

/**
 * Properly handles REST API paths by separating index names from document IDs
 * and applying appropriate encoding to each part.
 *
 * @param path - The REST API path (e.g., "my-index/_doc/document-with-/-char")
 * @returns The properly encoded path
 */
export const cleanRestPath = (path: string): string => {
  if (!path) return path

  // Handle cluster-level API endpoints (starting with /_)
  if (path.startsWith('/_')) {
    // These are cluster-level endpoints that should not be modified
    return path
  }

  // Find the first slash to separate index from the rest
  const firstSlashIndex = path.indexOf('/')

  if (firstSlashIndex === -1) {
    // No slash found, just clean the index name
    return cleanIndexName(path)
  }

  // Split into index and the rest
  const indexName = path.substring(0, firstSlashIndex)
  const restOfPath = path.substring(firstSlashIndex + 1)

  // Clean the index name
  const cleanedIndexName = cleanIndexName(indexName)

  // Check if this is an API endpoint (starts with _ but not _doc, _source, etc.)
  // API endpoints like _search, _delete_by_query, _bulk should not be modified
  // But document types like _doc should still be processed for document ID encoding
  const apiEndpoints = [
    '_search', '_msearch', '_bulk', '_delete_by_query', '_update_by_query',
    '_mget', '_explain', '_validate', '_analyze', '_termvectors', '_field_caps',
    '_search_shards', '_search/template', '_render/template', '_scripts',
    '_ingest', '_transform', '_ml', '_watcher', '_security', '_xpack',
    '_cat', '_cluster', '_nodes', '_tasks', '_snapshot', '_repositories',
    '_ilm', '_slm', '_enrich', '_data_frame', '_rollup', '_async_search',
    '_eql', '_graph', '_license', '_monitoring', '_telemetry', '_usage',
    '_features', '_info', '_health', '_refresh', '_flush', '_forcemerge',
    '_shrink', '_split', '_clone', '_rollover', '_freeze', '_unfreeze',
    '_close', '_open', '_reindex'
  ]
  
  // Check if the path starts with any of these API endpoints
  const isApiEndpoint = apiEndpoints.some(endpoint => restOfPath.startsWith(endpoint))
  
  if (isApiEndpoint) {
    return `${cleanedIndexName}/${restOfPath}`
  }

  // For the rest of the path, we need to handle it more carefully
  // We need to preserve the structure but encode document IDs
  // The issue is that when we split by slash, we lose the slashes in the document ID
  // So we need to be more careful about how we handle this

  let encodedRestOfPath: string

  // If the path contains slashes, we need to handle it specially
  if (restOfPath.includes('/')) {
    // Split by slash to get the parts
    const restParts = restOfPath.split('/')

    if (restParts.length >= 2) {
      // We have at least type and document ID
      // The last part is the document ID, but it might be split by slashes
      // We need to reconstruct the document ID by joining the parts after the type
      const typePart = restParts[0]
      const documentIdParts = restParts.slice(1)

      // Reconstruct the document ID by joining the parts
      const documentId = documentIdParts.join('/')

      // Encode the document ID if it's not already encoded
      let encodedDocumentId: string
      if (documentId.includes('%')) {
        // Already encoded, don't encode again
        encodedDocumentId = documentId
      } else {
        // Encode the document ID
        encodedDocumentId = encodeURIComponent(documentId)
      }

      // Reconstruct the path
      encodedRestOfPath = `${typePart}/${encodedDocumentId}`
    } else {
      // Only one part, encode it
      const part = restParts[0]
      if (part.includes('%')) {
        encodedRestOfPath = restOfPath
      } else {
        encodedRestOfPath = encodeURIComponent(part)
      }
    }
  } else {
    // No slashes, just encode the whole thing
    if (restOfPath.includes('%')) {
      encodedRestOfPath = restOfPath
    } else {
      encodedRestOfPath = encodeURIComponent(restOfPath)
    }
  }

  // Reconstruct the path
  return `${cleanedIndexName}/${encodedRestOfPath}`
}
