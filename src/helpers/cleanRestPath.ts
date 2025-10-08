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
