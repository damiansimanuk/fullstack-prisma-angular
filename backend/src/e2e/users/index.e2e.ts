import { describeUserAsAdmin, describeUserAsViewer } from './users.e2e'
import { describePermissions } from './users.permissions.e2e'
import { app } from '../../app'
import { prisma } from '../../app/models'

describe('End To End Users Test', () => {
  before(async () => {
    return prisma.$connect()
  })

  after(() => prisma.$disconnect())

  describe('Test User as admin', () => describeUserAsAdmin(app))
  describe('Test User as viewer', () => describeUserAsViewer(app))
  describe('Permissions', () => describePermissions(app))
})
