const DAY = 24 * 60 * 60 * 1000

export const random = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const helpers = (rand) => ({
  pick: (list) => list[Math.floor(rand() * list.length)],
  int: (min, max) => min + Math.floor(rand() * (max - min + 1)),
  weighted: (entries) => {
    let roll = rand() * entries.reduce((sum, [, weight]) => sum + weight, 0)
    for (const [value, weight] of entries) if ((roll -= weight) < 0) return value
    return entries[0][0]
  }
})

export const logIndex = (date) => `logs-${date.toISOString().slice(0, 10).replaceAll('-', '.')}`

const SERVICES = ['checkout', 'payments', 'search', 'auth', 'inventory', 'shipping']
const REGIONS = ['eu-central-1', 'eu-west-1', 'us-east-1']
const PATHS = {
  checkout: ['/api/cart', '/api/cart/items', '/api/checkout'],
  payments: ['/api/payments', '/api/payments/authorize', '/api/refunds'],
  search: ['/api/search', '/api/suggest', '/api/products'],
  auth: ['/api/login', '/api/logout', '/api/token/refresh'],
  inventory: ['/api/stock', '/api/stock/reserve', '/api/warehouses'],
  shipping: ['/api/shipments', '/api/rates', '/api/tracking']
}
const MESSAGES = {
  info: ['Request completed', 'Cache hit', 'User signed in', 'Order created', 'Payment authorized', 'Stock reserved', 'Shipment label created'],
  warn: ['Slow query detected', 'Retrying upstream request', 'Cache miss, loading from database', 'Rate limit almost reached'],
  error: ['Upstream timeout', 'Database connection refused', 'Payment declined by provider', 'Unexpected null value in cart item']
}

export const logDoc = (rand, timestamp, { incident = false } = {}) => {
  const { pick, int, weighted } = helpers(rand)
  const service = incident ? 'payments' : pick(SERVICES)
  const level = incident ? 'error' : weighted([['info', 88], ['warn', 9], ['error', 3]])
  const status = level === 'error' ? pick(incident ? [503, 504] : [500, 502, 503, 504]) : level === 'warn' ? pick([200, 404, 429]) : 200
  return {
    '@timestamp': new Date(timestamp).toISOString(),
    level,
    service,
    host: `${service}-${int(1, 4)}`,
    region: pick(REGIONS),
    message: pick(MESSAGES[level]),
    http: { method: weighted([['GET', 6], ['POST', 3], ['DELETE', 1]]), path: pick(PATHS[service]), status },
    duration_ms: level === 'error' ? int(800, 5000) : int(4, level === 'warn' ? 1500 : 250),
    user: { id: `user-${int(1000, 9999)}` },
    trace_id: Math.floor(rand() * 2 ** 52).toString(16)
  }
}

const dailyWeight = (timestamp) => {
  const hour = new Date(timestamp).getUTCHours() + new Date(timestamp).getUTCMinutes() / 60
  return 0.25 + 0.75 * Math.exp(-((hour - 14) ** 2) / 18)
}

export const logDocs = (rand, { days, perDay, now = Date.now() }) => {
  const docs = []
  const today = Math.floor(now / DAY) * DAY
  for (let day = days - 1; day >= 0; day--) {
    const start = today - day * DAY
    const end = Math.min(start + DAY, now)
    const target = docs.length + Math.round((perDay * (end - start)) / DAY)
    while (docs.length < target) {
      const timestamp = start + rand() * (end - start)
      if (rand() < dailyWeight(timestamp)) docs.push(logDoc(rand, timestamp))
    }
  }
  return docs
}

export const incidentDocs = (rand, { count, now = Date.now() }) => {
  const start = Math.floor(now / DAY) * DAY - DAY + 14 * 60 * 60 * 1000
  return Array.from({ length: count }, () => logDoc(rand, start + rand() * 45 * 60 * 1000, { incident: true }))
}

const ADJECTIVES = ['Silent', 'Last', 'Broken', 'Golden', 'Hidden', 'Crimson', 'Distant', 'Frozen', 'Electric', 'Lonely', 'Wild', 'Midnight']
const NOUNS = ['Harbor', 'Signal', 'Kingdom', 'Garden', 'Horizon', 'Machine', 'River', 'Echo', 'Empire', 'Lighthouse', 'Frontier', 'Orchard']
const GENRES = ['Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Action', 'Documentary', 'Horror', 'Romance', 'Animation']
const FIRST_NAMES = ['Ava', 'Noah', 'Mia', 'Liam', 'Ella', 'Lucas', 'Nora', 'Felix', 'Iris', 'Oscar', 'Lena', 'Hugo']
const LAST_NAMES = ['Berg', 'Moreau', 'Novak', 'Okafor', 'Sato', 'Lindqvist', 'Costa', 'Varga', 'Keller', 'Duarte', 'Ibsen', 'Hale']

export const movieDocs = (rand, count) => {
  const { pick, int } = helpers(rand)
  return Array.from({ length: count }, () => {
    const year = int(1970, 2025)
    const title = rand() < 0.5 ? `The ${pick(ADJECTIVES)} ${pick(NOUNS)}` : `${pick(NOUNS)} of the ${pick(ADJECTIVES)} ${pick(NOUNS)}`
    const genre = pick(GENRES)
    return {
      title,
      year,
      genre,
      director: { name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}` },
      rating: Math.round((4 + rand() * 5.5) * 10) / 10,
      votes: int(200, 250000),
      runtime: int(78, 172),
      released: `${year}-${String(int(1, 12)).padStart(2, '0')}-${String(int(1, 28)).padStart(2, '0')}`,
      description: `A ${genre.toLowerCase()} about ${pick(['a', 'the last', 'a forgotten'])} ${pick(NOUNS).toLowerCase()} and ${pick(['a', 'an old', 'a young'])} ${pick(['detective', 'pilot', 'family', 'scientist', 'musician'])}.`
    }
  })
}

const CATEGORIES = ['Electronics', 'Books', 'Garden', 'Kitchen', 'Sports', 'Toys', 'Office']
const PRODUCTS = ['Lamp', 'Kettle', 'Backpack', 'Headphones', 'Notebook', 'Chair', 'Bottle', 'Speaker', 'Racket', 'Puzzle']

export const productDocs = (rand, count) => {
  const { pick, int } = helpers(rand)
  return Array.from({ length: count }, (_, i) => ({
    sku: `SKU-${String(10000 + i)}`,
    name: `${pick(ADJECTIVES)} ${pick(PRODUCTS)}`,
    category: pick(CATEGORIES),
    price: Math.round((5 + rand() * 495) * 100) / 100,
    stock: int(0, 800)
  }))
}

export const orderDocs = (rand, count, now = Date.now()) => {
  const { pick, int, weighted } = helpers(rand)
  return Array.from({ length: count }, (_, i) => ({
    order_id: `ORD-${String(500000 + i)}`,
    customer: { name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`, country: pick(['DE', 'FR', 'NL', 'SE', 'US', 'GB', 'PL']) },
    status: weighted([['delivered', 60], ['shipped', 20], ['processing', 12], ['cancelled', 5], ['refunded', 3]]),
    items: int(1, 6),
    total: Math.round((10 + rand() * 600) * 100) / 100,
    currency: 'EUR',
    payment_method: pick(['card', 'paypal', 'invoice', 'apple_pay']),
    created_at: new Date(now - rand() * 90 * DAY).toISOString()
  }))
}
