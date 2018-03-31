const { config, Client } = require('kubernetes-client')
const JSONStream = require('JSONStream')
const axios = require('axios').default.create({ baseURL: 'http://localhost:9876' })
const debug = require('debug')('eg-ingress-controller')

const { createServiceEndpoint, createApiEndpoint, createPipelineWithProxyPolicy } = require('./egClient')

const client = new Client({ config: config.getInCluster() })

const addIngressRules = (uid, spec) => {

  const rulePromise = spec.rules ?
    rulePromise = Promise.all(spec.rules.map((rule) =>
      createServiceEndpoint('name', rule.http.backend)
        .then(() => createApiEndpoint('name', rule.host, rule.http.paths))
        .then(() => createPipelineWithProxyPolicy(uid, 'name', 'name', 'name'))
        .catch(debug)
    )) : Promise.resolve()

  const defautBackendPromise = spec.backend ?
    createServiceEndpoint('default', spec.backend)
      .then(() => createApiEndpoint('default', '*'))
      .then(() => createPipelineWithProxyPolicy(uid, 'default', 'default', 'default'))
      .catch(debug)
    : Promise.resolve()


  return rulePromise.then(() => defaultBackendPromise)
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
        addIngressRules(uid, spec)
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
