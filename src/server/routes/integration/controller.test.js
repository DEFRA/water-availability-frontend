import { config } from '#/config/config.js'
import { createServer } from '#/server/server.js'

const initialConfig = structuredClone(config.getProperties())

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  }
}

describe('integration controller', () => {
  let server

  beforeEach(() => {
    config.load(initialConfig)
  })

  afterEach(async () => {
    if (server) {
      await server.stop()
      server = null
    }
    config.load(initialConfig)
    vi.unstubAllGlobals()
  })

  test('renders reachable backend status', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ service: 'water-availability-backend', status: 'ok' })
        )
    )
    server = await createServer()

    const { statusCode, result } = await server.inject({
      method: 'GET',
      url: '/integration'
    })

    expect(statusCode).toBe(200)
    expect(result).toContain('Integration status')
    expect(result).toContain('water-availability-backend')
  })

  test('renders a degraded status when the backend returns a non-JSON response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Unexpected token')
        }
      })
    )
    server = await createServer()

    const { statusCode, result } = await server.inject({
      method: 'GET',
      url: '/integration'
    })

    expect(statusCode).toBe(200)
    expect(result).toContain('Backend returned a non-JSON response')
  })

  test('renders a degraded status when the backend request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Connection refused'))
    )
    server = await createServer()

    const { statusCode, result } = await server.inject({
      method: 'GET',
      url: '/integration'
    })

    expect(statusCode).toBe(200)
    expect(result).toContain('Connection refused')
  })
})
