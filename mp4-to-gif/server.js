const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 8080

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`)

  // Enable SharedArrayBuffer by setting required headers
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')

  let filePath = path.join(__dirname, req.url || '/')

  if (req.url === '/' || req.url === '' || req.url === './') {
    filePath = path.join(__dirname, 'mp4-to-gif.html')
  }

  console.log('filePath:', filePath)

  const extname = String(path.extname(filePath)).toLowerCase()
  const contentType = mimeTypes[extname] || 'application/octet-stream'

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' })
        res.end('<h1>404 Not Found</h1>', 'utf-8')
      } else {
        res.writeHead(500)
        res.end('Server Error: ' + error.code, 'utf-8')
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content, 'utf-8')
    }
  })
})

server.listen(PORT, () => {
  console.log(`========================================`)
  console.log(`  Server running at http://localhost:${PORT}`)
  console.log(`  Open: http://localhost:${PORT}/mp4-to-gif.html`)
  console.log(`========================================`)
})
