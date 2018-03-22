const { config, Client } = require('kubernetes-client')
const JSONStream = require('JSONStream')
const debug = require('debug')('eg-ingress-controller')

const client = new Client({ config: config.fromKubeconfig() })

client.loadSpec().then((kubeApi) => {
  debug('Kubernetes API Specs loaded')
  const ingresses = kubeApi.apis.extensions.v1beta.watch.ingresses.getStream().pipe(JSONStream.parse())

  ingresses.on('data', (ingressWatchEvent) => {
    debug('Ingress change detected')
    debug(ingressWatchEvent.type)
    switch (ingressWatchEvent.type) {
      case 'ADDED':
        break;
      case 'MODIFIED':
        break;
      case 'DELETED':
    }
  })

})
