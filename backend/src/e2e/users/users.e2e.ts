import { expect } from 'chai'
import { Request } from '../request'

export function describeUserAsViewer(app) {
  const request = new Request(app)

  before(async () => {
    // Auth
    const resultLogin = await request.login('viewer', '')
    expect(resultLogin.body.refreshToken).not.to.be.empty
    expect(resultLogin.body.accessToken).not.to.be.empty
  })

  it('GET /api/v1/users', async () => {
    const res = await request.get('/api/v1/users', { query: { page: 2, perPage: 1 } }, 200)

    expect(res.status).to.equal(200)
    const result = res.body

    expect(result.page).to.eq(2)
    expect(result.perPage).to.eq(1)
    expect(result.rows.length).to.eq(1)
    expect(result.rows[0].username).not.to.be.empty
    expect(result.rows[0].username).not.to.be.empty
    expect(result.rows[0].updatedAt).not.to.be.empty
    expect(result.rows[0].createdAt).not.to.be.empty
    expect(result.rows[0].isActive).to.eq(true)
  })

  it('POST /api/v1/users', async () => {
    const result = await request.post('/api/v1/users', {}, { fullName: 'as', username: 'as' }, 201)
    expect(result.status).to.equal(403)
  })

  it('DELETE /api/v1/users/0', async () => {
    const res = await request.delete('/api/v1/users/{id}', { id: 0 }, 204)
    expect(res.status).to.equal(403)
  })
}

export function describeUserAsAdmin(app) {
  const request = new Request(app)

  before(async () => {
    // Auth
    const resultLogin = await request.login('admin', 'admin')
    expect(resultLogin.body.refreshToken).not.to.be.empty
    expect(resultLogin.body.accessToken).not.to.be.empty
  })

  it('GET /api/v1/users', async () => {
    const res = await request.get('/api/v1/users', { query: { page: 2, perPage: 1 } }, 200)

    expect(res.status).to.equal(200)
    expect(res.body).not.to.be.empty

    const result = res.body

    expect(result.page).to.eq(2)
    expect(result.perPage).to.eq(1)
    expect(result.rows.length).to.eq(1)
    expect(result.rows[0].username).not.to.be.empty
    expect(result.rows[0].updatedAt).not.to.be.empty
    expect(result.rows[0].createdAt).not.to.be.empty
    expect(result.rows[0].isActive).to.eq(true)
    // Fixme: Test all Row fields
  })

  it('POST /api/v1/users', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await request.post('/api/v1/users', {}, {} as any, 201)

    expect(res.status).to.equal(422)
  })

  it('DELETE /api/v1/users/0', async () => {
    const res = await request.delete('/api/v1/users/{id}', { id: 0 }, 204)

    expect(res.status).to.equal(500)
  })

  it('Create and Delete users', async () => {
    const res = await request.post(
      '/api/v1/users',
      {},
      { fullName: 'Pepe', username: 'pepePrueba2' },
      201
    )

    expect(res.status).to.equal(201)

    const resDelete = await request.delete('/api/v1/users/{id}', { id: res.body.userId }, 204)
    expect(resDelete.status).to.equal(204)
  })
}
