import { integrationController } from './controller.js'

export const integration = {
  plugin: {
    name: 'integration',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/integration',
          ...integrationController
        }
      ])
    }
  }
}
