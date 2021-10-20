import { Router, Request, Response, NextFunction } from 'express'
import { loggerService } from '../services'
import { LOG_DB } from '../../config'

export function registerLoggerMiddleware(app: Router) {
  if (LOG_DB) {
    app.use(function (req: Request, res: Response, next: NextFunction): Response | void {
      if (!req.originalUrl.includes('/auth/') && !req.originalUrl.startsWith('/ui')) {
        res.locals.startTime = Date.now()

        res.on('finish', () => {
          if (res.statusCode < 400) {
            const timeMs = Date.now() - res.locals.startTime
            loggerService.write({
              type: 'INFO',
              name: `${req.method} ${req.originalUrl}`,
              status: res.statusCode ?? 0,
              message: JSON.stringify({
                timeMs: timeMs,
                message: res.statusMessage,
                reqBody: req.body
              })
            })
          }
        })
      }

      next()
    })
  }
}
