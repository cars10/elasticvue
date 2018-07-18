const fs = require('fs')

// Check if assets where built
try {
  fs.statSync('./dist/index.html')
} catch (e) {
  console.error('> Error: dist/index.html does not exist.')
  console.error('> Please create the production assets by running:')
  console.error('yarn build')
  process.exit(1)
}

const express = require('express')
const app = express()
const path = require('path')
const port = process.env.PORT || 8080

const dist_path = path.resolve(__dirname, '..', 'dist')

// serve static assets from /dist
app.use(express.static(dist_path))

// respond to every other request with index.html
app.get('*', (request, response) => {
  response.sendFile(path.join(dist_path, 'index.html'))
})

app.listen(port)

console.log('server running on localhost:' + port)
