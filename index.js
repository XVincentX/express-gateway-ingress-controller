const { config, Client } = require('kubernetes-client')
const JSONStream = require('JSONStream')
const debug = require('debug')('eg-ingress-controller')

const { createServiceEndpoint, createApiEndpoint, createPipelineWithProxyPolicy } = require('./eg-client')

const client = new Client({ config: config.getInCluster() })

const addIngressRules = (uid, spec) => {

  const rulePromise = spec.rules ?
    Promise.all(spec.rules.map((rule) => {
      return rule.http.paths.forEach((path) =>
        createServiceEndpoint(uid, path.serviceName, path.servicePort)
          .then(() => createApiEndpoint(uid, rule.host, path.path))
          .then(() => createPipelineWithProxyPolicy(uid, uid, uid, uid))
          .catch((err) => debug(err.message))
      )
    })) : Promise.resolve()

  const defautBackendPromise = () => spec.backend ?
    createServiceEndpoint('default', spec.backend.serviceName, spec.backend.servicePort)
      .then(() => createApiEndpoint('default', '*'))
      .then(() => createPipelineWithProxyPolicy(uid, 'default', 'default', 'default'))
      .catch((err) => debug(err.message))
    : Promise.resolve()


  return rulePromise.then(defautBackendPromise)
}

const deleteIngressRule = (uid) => {

}


client.loadSpec().then((kubeApi) => {
  debug('Kubernetes API Specs loaded')
  const ingresses = kubeApi.apis.extensions.v1beta.watch.ingresses.getStream().pipe(JSONStream.parse())

  ingresses.on('data', (ingressWatchEvent) => {

    const { spec } = ingressWatchEvent.object
    const { uid } = ingressWatchEvent.object.metadata

    debug(`Ingress change detected: ${ingressWatchEvent.type} — ${uid}`)

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
