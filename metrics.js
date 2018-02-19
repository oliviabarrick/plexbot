var prometheus = require('prom-client');

module.exports.searches_count = new prometheus.Counter({
    name: 'searches',
    help: 'number of searches performed',
    labelNames: ['type']
});

module.exports.completed_searches_count = new prometheus.Counter({
    name: 'completed_searches',
    help: 'number of searches completeed',
    labelNames: ['type']
});

module.exports.api_latency = new prometheus.Summary({
    name: 'api_latency',
    help: 'latency to search apis',
    labelNames: ['api']
});
