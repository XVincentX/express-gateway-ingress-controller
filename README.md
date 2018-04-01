# eg-ingress-controller

This is a *WIP* experiment to use [Express Gateway](https://express-gateway.io) as an Ingress Controller for
[Kubernetes](https://kubernetes.io)

In the case it'll reach a production/decent state, I'll finish the Readme.

### Express Gateway limitations

1. Express Gateway has a serious concurrency problem using the WebAPI. Given the configuration is stored on file,
if two calls happen at the same time using the Admin API, they'll really likey result in an invalid config file.

2. Express Gateway does not support a way to add to modify the SNI list at runtime. Once it's started, the array can't
be changed.
