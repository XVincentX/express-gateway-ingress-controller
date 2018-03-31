const { config, Client } = require('kubernetes-client')
const JSONStream = require('JSONStream')
const axios = require('axios').default.create({ baseURL: 'http://localhost:9876' })
const debug = require('debug')('eg-ingress-controller')

const client = new Client({ config: config.getInCluster() })

const addIngressRule = (uid, spec) => {
  const createServiceEndpoint = (name, { serviceName, servicePort }) => {
    return axios.put(`/service-endpoints/${encodeURIComponent(serviceName)}`, {
      url: `http://${serviceName}:${servicePort}`
    })
  }

  const createApiEndpoint = (name, host, paths) => axios.put(`/api-endpoints/${encodeURIComponent(name)}`, { host, paths })

  if (spec.rules) {
    spec.rules.forEach((rule) => {
    })
  }

  if (spec.backend) {
    debug(`Creating default serviceEndpoint and ApiEndpoint for`, spec.backend)
    createServiceEndpoint('default', spec.backend)
      .then(() => createApiEndpoint('default', '*'))
      .catch((err) => debug(err.message))
  }
}

const deleteIngressRule = (uid) => {

}


client.loadSpec().then((kubeApi) => {
  debug('Kubernetes API Specs loaded')
  const ingresses = kubeApi.apis.extensions.v1beta.watch.ingresses.getStream().pipe(JSONStream.parse())

  ingresses.on('data', (ingressWatchEvent) => {
    debug('Ingress change detected')

    const { spec } = ingressWatchEvent.object
    const { uid } = ingressWatchEvent.object.metadata

    switch (ingressWatchEvent.type) {
      case 'ADDED':
        addIngressRule(uid, spec)
        break;
      case 'MODIFIED':
        deleteIngressRule(uid)
        addIngressRule(uid, spec)
        break;
      case 'DELETED':
        deleteIngressRule(uid)
    }
  })
})
