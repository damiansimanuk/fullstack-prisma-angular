/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { agent, Response, SuperAgentTest } from 'supertest'
import { paths } from '../generated/schema'

type FilterSub<Type, Condition> = {
  [Property in keyof Type as Type[Property] extends Condition
    ? Property
    : 'undefined']: Type[Property] extends Condition ? Type[Property] : null
}

type RemoveUndefined<Type> = {
  [Property in keyof Type as Exclude<Property, 'undefined'>]: Type[Property]
}

type RetTypes = {
  200: { content: { 'application/json': unknown } }
  201: { content: { 'application/json': unknown } }
  204: { content: { 'application/json': unknown } }
}

export class Request {
  token: { refreshToken: string; accessToken: string } | null = null
  app?: any
  agent: SuperAgentTest

  constructor(app?: any) {
    this.app = app
    this.agent = agent(app)
  }

  get accessToken() {
    return this.token?.accessToken ?? ''
  }

  get refreshToken() {
    return this.token?.refreshToken ?? ''
  }

  setToken(token: { refreshToken: string; accessToken: string }) {
    this.token = token
  }

  async sendRequest<T>(
    method: string,
    url: string,
    data: any = null
  ): Promise<{ body: T; status: number }> {
    let result: Response

    switch (method) {
      case 'get':
        result = await this.agent.get(url).auth(this.accessToken, { type: 'bearer' }).send()
        return { body: result.body as T, status: result.status }
      case 'post':
        result = await this.agent.post(url).auth(this.accessToken, { type: 'bearer' }).send(data)
        return { body: result.body as T, status: result.status }
      case 'put':
        result = await this.agent.put(url).auth(this.accessToken, { type: 'bearer' }).send(data)
        return { body: result.body as T, status: result.status }
      case 'patch':
        result = await this.agent.patch(url).auth(this.accessToken, { type: 'bearer' }).send(data)
        return { body: result.body as T, status: result.status }
      case 'delete':
        result = await this.agent.delete(url).auth(this.accessToken, { type: 'bearer' }).send()
        return { body: result.body as T, status: result.status }
    }
    throw Error('Undefined method')
  }

  getUrl(url: string, path: { [key: string]: unknown }) {
    if (path) {
      Object.keys(path || {}).forEach((p) => {
        url = url.replace(`{${p}}`, `${path[p]}`)
      })
    }
    return url
  }

  getQuery(query: { [key: string]: unknown }) {
    return Object.keys(query || {})
      .map((p) => `${p}=${query[p]}`)
      .join('&')
  }

  async login(username: string, password: string) {
    const result = await this.post('/api/v1/auth/login', {}, { username, password }, 200)
    this.setToken(result.body)
    return result
  }

  async logout() {
    await this.get('/api/v1/auth/logout', { query: { refreshToken: this.refreshToken } }, 200)
    this.token = null
  }

  get<
    Url extends keyof RemoveUndefined<FilterSub<paths, { get }>>,
    Par extends paths[Url]['get']['parameters'],
    Res extends RetTypes & paths[Url]['get']['responses'],
    St extends keyof Omit<RetTypes, keyof Omit<RetTypes, keyof paths[Url]['get']['responses']>>
  >(url: Url, parameters: Par, _status: St) {
    const param = parameters as {
      query: { [key: string]: unknown }
      path: { [key: string]: unknown }
    }
    let newUrl = param.path ? this.getUrl(url, param.path) : (url as string)
    if (param.query) {
      newUrl = newUrl + '?' + this.getQuery(param.query)
    }
    return this.sendRequest<Res[St]['content']['application/json']>('get', newUrl)
  }

  put<
    Url extends keyof RemoveUndefined<FilterSub<paths, { put }>>,
    Path extends paths[Url]['put']['parameters']['path'],
    Body extends paths[Url]['put']['requestBody']['content']['application/json'],
    Res extends RetTypes & paths[Url]['put']['responses'],
    St extends keyof Omit<RetTypes, keyof Omit<RetTypes, keyof paths[Url]['put']['responses']>>
  >(url: Url, path: Path, body: Body, st: St) {
    const newUrl = path ? this.getUrl(url, path) : (url as string)
    return this.sendRequest<Res[St]['content']['application/json']>('put', newUrl, body)
  }

  patch<
    Url extends keyof RemoveUndefined<FilterSub<paths, { patch }>>,
    Path extends paths[Url]['patch']['parameters']['path'],
    Body extends paths[Url]['patch']['requestBody']['content']['application/json'],
    Res extends RetTypes & paths[Url]['patch']['responses'],
    St extends keyof Omit<RetTypes, keyof Omit<RetTypes, keyof paths[Url]['patch']['responses']>>
  >(url: Url, path: Path, body: Body, st: St) {
    const newUrl = path ? this.getUrl(url, path) : (url as string)
    return this.sendRequest<Res[St]['content']['application/json']>('patch', newUrl, body)
  }

  delete<
    Url extends keyof RemoveUndefined<FilterSub<paths, { delete }>>,
    Path extends paths[Url]['delete']['parameters']['path'],
    Res extends RetTypes & paths[Url]['delete']['responses'],
    St extends keyof Omit<RetTypes, keyof Omit<RetTypes, keyof paths[Url]['delete']['responses']>>
  >(url: Url, path: Path, st: St) {
    const newUrl = path ? this.getUrl(url, path) : (url as string)
    return this.sendRequest<Res[St]['content']['application/json']>('delete', newUrl)
  }

  post<
    Url extends keyof RemoveUndefined<FilterSub<paths, { post }>>,
    Par extends paths[Url]['post']['parameters'],
    Body extends (paths[Url]['post'] & {
      requestBody: { content: { 'application/json': unknown } }
    })['requestBody']['content']['application/json'],
    Res extends RetTypes & paths[Url]['post']['responses'],
    St extends keyof Omit<RetTypes, keyof Omit<RetTypes, keyof paths[Url]['post']['responses']>>
  >(url: Url, path: Par, body: Body, st: St) {
    const newUrl = path ? this.getUrl(url, path) : (url as string)
    return this.sendRequest<Res[St]['content']['application/json']>('post', newUrl, body)
  }
}

async function test() {
  const request = new Request()

  const resGet = await request.get('/api/v1/users', { query: { isActive: true } }, 200)
  console.log(resGet)
  const resGet2 = await request.get('/api/v1/users/{id}', { path: { id: 1 } }, 200)
  await request.get('/api/v1/users/permissions/{id}', { path: { id: 1 } }, 200)

  const resPut = await request.put(
    '/api/v1/users/permissions/{id}',
    { id: 1 },
    { description: 'sf', isActive: true },
    200
  )
  console.log(resPut)

  const resDelete = await request.delete('/api/v1/users/permissions/{id}', { id: 1 }, 200)
  console.log(resDelete)
  const resDelete2 = await request.delete('/api/v1/users/roles/{id}', { id: 1 }, 200)
  console.log(resDelete2)

  const resBody = await request.post('/api/v1/users', {}, { fullName: 'asd', username: '' }, 201)
  console.log(resBody)

  const loginResult = await request.login('admin', 'admin')
  console.log({ loginResult })

  const resGet3 = await request.get('/api/v1/users', { query: { isActive: true } }, 200)
  console.log({ resGet3 })
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
// test()
