const axios = require('axios').default.create({ baseURL: 'http://localhost:9876' })

const createServiceEndpoint = (name, serviceName, servicePort) =>
  axios.put(`/service-endpoints/${encodeURIComponent(serviceName)}`, { url: `http://${serviceName}:${servicePort}` })

const createApiEndpoint = (name, host, paths) =>
  axios.put(`/api-endpoints/${encodeURIComponent(name)}`, { host, paths })

const createPipelineWithProxyPolicy = (uid, name, serviceEndpoint, apiEndpoint) =>
  axios.put(`/pipelines/${encodeURIComponent(name)}`,
    { uid, apiEndpoints: [apiEndpoint], policies: [{ proxy: [{ action: { serviceEndpoint } }] }] }
  )

module.exports = { createServiceEndpoint, createApiEndpoint, createPipelineWithProxyPolicy }
