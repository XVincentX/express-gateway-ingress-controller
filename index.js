const { config, Client } = require('kubernetes-client')
const JSONStream = require('JSONStream')
const debug = require('debug')('eg-ingress-controller')

const client = new Client({ config: config.getInCluster() })

client.loadSpec().then((kubeApi) => {
  debug('Kubernetes API Specs loaded')
  const ingresses = kubeApi.apis.extensions.v1beta.watch.ingresses.getStream().pipe(JSONStream.parse())

  ingresses.on('data', (ingressWatchEvent) => {
    debug('Ingress change detected')

    const { spec } = ingressWatchEvent.object
    const { uid } = ingressWatchEvent.object.metadata

    debug(ingressWatchEvent.type)
    switch (ingressWatchEvent.type) {
      case 'ADDED':
        addIngressRule(uid, spec);
        break;
      case 'MODIFIED':
        modifyIngressRule(uid, spec);
        break;
      case 'DELETED':
        deleteIngressRule(uid);
    }
  })

})
