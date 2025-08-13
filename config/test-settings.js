export default {
  default: {
    scenarios: {
      default: {
        executor: 'constant-vus',
        vus: 1,
        duration: '30s'
      }
    },
    thresholds: {
      http_req_duration: ['p(95)<2000'],
      http_req_failed: ['rate<0.05']
    }
  },
  light: {
    scenarios: {
      light_load: {
        executor: 'constant-vus',
        vus: 10,
        duration: '2m'
      }
    },
    thresholds: {
      http_req_duration: ['p(95)<1500'],
      http_req_failed: ['rate<0.02']
    }
  },
  heavy: {
    scenarios: {
      heavy_load: {
        executor: 'ramping-vus',
        startVUs: 10,
        stages: [
          { duration: '2m', target: 100 },
          { duration: '5m', target: 300 },
          { duration: '10m', target: 500 },
          { duration: '3m', target: 0 }
        ]
      }
    },
    thresholds: {
      http_req_duration: ['p(95)<3000'],
      http_req_failed: ['rate<0.10']
    }
  },
  spike: {
    scenarios: {
      spike_test: {
        executor: 'ramping-vus',
        startVUs: 10,
        stages: [
          { duration: '1m', target: 50 },
          { duration: '30s', target: 1000 },
          { duration: '30s', target: 50 },
          { duration: '1m', target: 0 }
        ]
      }
    },
    thresholds: {
      http_req_duration: ['p(95)<5000'],
      http_req_failed: ['rate<0.20']
    }
  }
};
