/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { prisma, Prisma } from '../models'
import { LOG_DB } from '../../config'

class LoggerDatabaseService {
  queue: Prisma.LogHistoryCreateInput[]
  workerTimeout: NodeJS.Timeout | null

  constructor() {
    this.queue = []
    this.workerTimeout = null
  }

  private _dequeue(): void {
    const lines = this.queue.filter(() => true)
    this.workerTimeout = null

    if (lines.length) {
      prisma
        .$transaction(lines.map((l) => prisma.logHistory.create({ data: l })))
        .then((b) => {
          console.log(`LoggerDatabaseService inserted ${b.length} rows`)
          this.queue.splice(0, lines.length)
        })
        .catch((err) => {
          console.log('LoggerDatabaseService Error:', err)
          this.queue.splice(0, lines.length)
        })
    }
  }

  public write(log: Prisma.LogHistoryCreateInput): void {
    if (LOG_DB) {
      log.createdAt ??= new Date()
      this.queue.push(log)
      this.workerTimeout ??= setTimeout(this._dequeue.bind(this), 2000)
    }
  }
}

export const loggerService = new LoggerDatabaseService()
