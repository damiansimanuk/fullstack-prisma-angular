import { Router, Request, Response, NextFunction } from 'express'
import { ValidateError } from '@tsoa/runtime'
import { MessageError, UnauthorizedError } from '../errors/message.error'
import { JsonWebTokenError } from 'jsonwebtoken'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { loggerService } from '../services'
import { E2E } from '../../config'

export function registerErrorMiddleware(app: Router) {
  app.use(function (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ): Response | void {
    if (!E2E) {
      console.log({ error: err })
    }

    if (err instanceof ValidateError) {
      const error = {
        message: 'Validation Failed',
        details: err?.fields
      }

      loggerService.write({
        type: 'ERROR',
        name: `${req.method} ${req.originalUrl}`,
        status: 422,
        message: JSON.stringify({ message: res.statusMessage, reqBody: req.body, error })
      })

      return res.status(422).json(error)
    }
    if (err instanceof UnauthorizedError) {
      loggerService.write({
        type: 'ERROR',
        name: `${req.method} ${req.originalUrl}`,
        status: err.status,
        message: JSON.stringify({ message: res.statusMessage, reqBody: req.body, error: err })
      })

      res.setHeader('WWW-Authenticate', 'Basic realm="Access to the staging site", charset="UTF-8"')
      return res.status(err.status).json(err)
    }
    if (err instanceof MessageError) {
      loggerService.write({
        type: 'ERROR',
        name: `${req.method} ${req.originalUrl}`,
        status: err.status || 500,
        message: JSON.stringify({ message: res.statusMessage, reqBody: req.body, error: err })
      })

      return res.status(err.status || 500).json(err)
    }
    if (err instanceof JsonWebTokenError) {
      const st = (err as unknown as { status: number })?.status

      loggerService.write({
        type: 'ERROR',
        name: `${req.method} ${req.originalUrl}`,
        status: st || 500,
        message: JSON.stringify({ message: res.statusMessage, reqBody: req.body, error: err })
      })

      return res.status(st || 500).json(err)
    }
    if (err instanceof PrismaClientKnownRequestError) {
      loggerService.write({
        type: 'ERROR',
        name: `${req.method} ${req.originalUrl}`,
        status: 500,
        message: JSON.stringify({
          message: res.statusMessage,
          reqBody: req.body,
          error: (err.meta as { cause: string })?.cause || err.message
        })
      })

      return res.status(500).json({
        message: err.name,
        error: (err.meta as { cause: string })?.cause || err.message
      })
    }
    if (err instanceof Error) {
      let st = (err as unknown as { status: number })?.status
      st = st >= 400 ? st : 500

      loggerService.write({
        type: 'ERROR',
        name: `${req.method} ${req.originalUrl}`,
        status: st,
        message: JSON.stringify({ message: res.statusMessage, reqBody: req.body, error: `${err}` })
      })

      return res.status(st).json({
        message: 'Internal Server Error',
        error: `${err}`
      })
    }
    next()
  })
}
