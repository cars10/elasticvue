export const nodeRoleTitle = role => {
  let title = ''
  if (role.includes('c')) title += 'c - cold node\r\n'
  if (role.includes('d')) title += 'd - data node\r\n'
  if (role.includes('f')) title += 'f - frozen node\r\n'
  if (role.includes('h')) title += 'h - hot node\r\n'
  if (role.includes('i')) title += 'i - ingest node\r\n'
  if (role.includes('l')) title += 'l - machine learning node\r\n'
  if (role.includes('m')) title += 'm - master-eligible node\r\n'
  if (role.includes('r')) title += 'r - remote cluster client node\r\n'
  if (role.includes('s')) title += 's - content node\r\n'
  if (role.includes('t')) title += 't - transform node\r\n'
  if (role.includes('v')) title += 'v - voting-only node\r\n'
  if (role.includes('w')) title += 'w - warm node\r\n'
  if (role.includes('-')) title += 'coordinating nodes\r\n'

  return title
}
