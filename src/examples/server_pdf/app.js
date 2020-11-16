const express = require('express');
const cors = require('cors');
const { errors } = require('celebrate');

class App {
  constructor(routes) {
    this.routes = routes;
    this.server = express();
    this.middleware();
    this.router();
  }

  middleware() {
    this.server.use(
      cors()
      // origin: ''
    );
    this.server.use(express.json());
    this.server.use(errors());
  }

  router() {
    this.server.use(this.routes);
  }
}

class Routes {
  constructor(endpoint) {
    this.routes = express.Router();

    this.endpoint = endpoint;

    return this.init();
  }

  init() {
    this.map();
    return this.routes;
  }

  map() {
    this.routes.get('/pdfing', this.endpoint);
  }
}

module.exports = { App, Routes };
