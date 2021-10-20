import express from 'express'
import { RegisterRoutes } from '../generated/routes'
import { registerErrorMiddleware } from './middleware/error.middleware'
import { registerLoggerMiddleware } from './middleware/logger.middleware'
import version from '../generated/version.json'
import path from 'path'

const app = express()

registerLoggerMiddleware(app)
app.use(express.json())

app.use((req, res, next) => {
  if (!res.hasHeader('Access-Control-Allow-Credentials')) {
    res.header('Access-Control-Allow-Origin', '*')
  }
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Authorization, Accept'
  )
  res.header('Access-Control-Allow-Methods', 'PUT, PATCH, POST, GET, DELETE, OPTIONS')
  next()
})

app.get('/version', (_req, resp) => {
  resp.json(version)
})

RegisterRoutes(app)

// Server UI and redirect fallback index.html
app.use('/ui/', express.static(path.resolve(__dirname, '../../public/ui'), { redirect: false }))
app.use('/ui*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../public/ui/index.html'))
})
app.get('/', (req, res) => res.redirect('ui'))

registerErrorMiddleware(app)

export { app }
