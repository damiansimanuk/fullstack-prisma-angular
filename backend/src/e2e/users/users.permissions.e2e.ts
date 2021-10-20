import { expect } from 'chai'
import { Request } from '../request'

export function describePermissions(app) {
  const request = new Request(app)

  before(async () => {
    // Auth
    const resultLogin = await request.login('admin', 'admin')
    expect(resultLogin.body.refreshToken).not.to.be.empty
    expect(resultLogin.body.accessToken).not.to.be.empty
  })

  it('GET /api/v1/users/permissions', async () => {
    const res = await request.get(
      '/api/v1/users/permissions',
      { query: { page: 2, perPage: 1 } },
      200
    )
    const result = res.body
    expect(res.status).to.equal(200)
    expect(result.page).to.equal(2)
    expect(result.perPage).to.equal(1)

    expect(result.rows).not.to.be.empty
    expect(result.rows[0].createdAt).not.to.be.empty
    expect(result.rows[0].updatedAt).not.to.be.empty
    expect(result.rows[0].permissionId).to.gte(1)
    expect(result.rows[0].code).not.to.be.empty
    expect(result.rows[0].description).not.to.be.empty
  })

  it('Create, Update, Get and Delete /api/v1/users/permissions', async () => {
    // Create
    const resCreate = await request.post(
      '/api/v1/users/permissions',
      {},
      {
        code: 'permission:prueba',
        description: 'permiso de prueba'
      },
      201
    )

    expect(resCreate.status).to.equal(201)
    const result = resCreate.body
    expect(result.permissionId).to.gte(1)
    expect(result.code).to.eq('permission:prueba')
    expect(result.isActive).to.eq(true)
    expect(result.description).to.eq('permiso de prueba')

    const permId = result.permissionId

    // Update
    const resUpdate = await request.put(
      '/api/v1/users/permissions/{id}',
      { id: permId },
      {
        isActive: false,
        description: 'description modificada'
      },
      200
    )

    expect(resUpdate.status).to.equal(200)

    // Get
    const resGet = await request.get(
      '/api/v1/users/permissions/{id}',
      { path: { id: permId } },
      200
    )

    const resultGet = resGet.body

    expect(resGet.status).to.equal(200)
    expect(resultGet.permissionId).to.eq(permId)
    expect(resultGet.code).to.eq('permission:prueba')
    expect(resultGet.isActive).to.eq(false)
    expect(resultGet.description).to.eq('description modificada')

    // Delete
    const resDelete = await request.delete('/api/v1/users/permissions/{id}', { id: permId }, 200)

    expect(resDelete.status).to.eq(200)
  })
}
