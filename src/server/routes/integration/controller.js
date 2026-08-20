import { config } from '#/config/config.js'

function trimTrailingSlashes(value) {
  let result = value
  while (result.endsWith('/')) {
    result = result.slice(0, -1)
  }
  return result
}

function servicePath(baseUrl, path) {
  return `${trimTrailingSlashes(baseUrl)}${path}`
}

async function fetchServiceStatus(url, timeoutMs) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs)
    })

    let payload = null
    try {
      payload = await response.json()
    } catch {
      payload = { error: 'Backend returned a non-JSON response' }
    }

    return {
      url,
      ok: response.ok,
      statusCode: response.status,
      payload
    }
  } catch (error) {
    return {
      url,
      ok: false,
      statusCode: null,
      payload: {
        error: error.message
      }
    }
  }
}

export const integrationController = {
  async handler(_request, h) {
    const backendUrl = servicePath(
      config.get('services.backendBaseUrl'),
      '/integration/status'
    )
    const backend = await fetchServiceStatus(
      backendUrl,
      config.get('services.backendStatusTimeoutMs')
    )

    return h.view('integration/index', {
      pageTitle: 'Integration status',
      heading: 'Integration status',
      backend,
      backendJson: JSON.stringify(backend.payload, null, 2),
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Integration status'
        }
      ]
    })
  }
}
