const axios = require('axios').default.create({ baseURL: 'http://localhost:9876' });
const debug = require('debug')('eg-ingress-controller:eg-client')

const createServiceEndpoint = (name, serviceName, servicePort) => {
  debug(`Creating service endpoint ${name} on ${serviceName}:${servicePort}`)
  return axios.put(`/service-endpoints/${encodeURIComponent(name)}`, { url: `http://${serviceName}:${servicePort}` });
}
const createApiEndpoint = (name, host, paths) => {
  debug(`Creating api endpoint ${name} for ${host} and ${paths}`)
  return axios.put(`/api-endpoints/${encodeURIComponent(name)}`, { host, paths });
}
const createPipelineWithProxyPolicy = (uid, name, serviceEndpoint, apiEndpoint) => {
  debug(`Creating pipeline ${name} from ${apiEndpoint} proxied to ${apiEndpoint}`)
  return axios.put(`/pipelines/${encodeURIComponent(name)}`,
    { uid, apiEndpoints: [apiEndpoint], policies: [{ proxy: [{ action: { serviceEndpoint } }] }] }
  );
}

module.exports = { createServiceEndpoint, createApiEndpoint, createPipelineWithProxyPolicy };
