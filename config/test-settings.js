export default {
  default: {
    description: 'Basic load test with steady 1 req/s',
    scenarios: {
      default: {
        executor: 'constant-arrival-rate',
        rate: 1,
        timeUnit: '1s',
        duration: '30s',
        preAllocatedVUs: 1,
        maxVUs: 5
      }
    },
    thresholds: {
      http_req_duration: [
        'p(50)<1500', // 50% under 1.5s
        'p(95)<3000', // 95% under 3s
        'p(99)<5000' // 99% under 5s
      ],
      http_req_failed: ['rate<0.01']
    },
    sleepDuration: 1
  },
  // 'constant-vus': {
  //   description: 'Fixed single user load test',
  //   scenarios: {
  //     constant_load: {
  //       executor: 'constant-vus',
  //       vus: 1,
  //       duration: '30s'
  //     }
  //   },
  //   thresholds: {
  //     http_req_duration: [
  //       'p(50)<1500', // 50% under 1.5s
  //       'p(95)<3000', // 95% under 3s
  //       'p(99)<5000' // 99% under 5s
  //     ],
  //     http_req_failed: ['rate<0.01']
  //   },
  //   sleepDuration: 2
  // },
  // 'ramping-vus': {
  //   description: 'Gradual load increase/decrease',
  //   scenarios: {
  //     ramping_load: {
  //       executor: 'ramping-vus',
  //       startVUs: 1,
  //       stages: [
  //         { duration: '10s', target: 5 },
  //         { duration: '20s', target: 10 },
  //         { duration: '10s', target: 0 }
  //       ]
  //     }
  //   },
  //   thresholds: {
  //     http_req_duration: [
  //       'p(50)<1500', // 50% under 1.5s
  //       'p(95)<3000', // 95% under 3s
  //       'p(99)<5000' // 99% under 5s
  //     ],
  //     http_req_failed: ['rate<0.01']
  //   },
  //   sleepDuration: 1.5
  // },
  // light: {
  //   description: 'Moderate load for everyday scenarios',
  //   scenarios: {
  //     light_load: {
  //       executor: 'constant-arrival-rate',
  //       rate: 5,
  //       timeUnit: '1s',
  //       duration: '2m',
  //       preAllocatedVUs: 10,
  //       maxVUs: 20
  //     }
  //   },
  //   thresholds: {
  //     http_req_duration: [
  //       'p(50)<1500', // 50% under 1.5s
  //       'p(95)<3000', // 95% under 3s
  //       'p(99)<5000' // 99% under 5s
  //     ],
  //     http_req_failed: ['rate<0.01']
  //   },
  //   sleepDuration: 1
  // },
  // heavy: {
  //   description: 'High stress test with fast interactions',
  //   scenarios: {
  //     heavy_load: {
  //       executor: 'ramping-vus',
  //       startVUs: 10,
  //       stages: [
  //         { duration: '1m', target: 100 },
  //         { duration: '3m', target: 300 },
  //         { duration: '4m', target: 500 },
  //         { duration: '2m', target: 0 }
  //       ]
  //     }
  //   },
  //   thresholds: {
  //     http_req_duration: [
  //       'p(50)<1500', // 50% under 1.5s
  //       'p(95)<3000', // 95% under 3s
  //       'p(99)<5000' // 99% under 5s
  //     ],
  //     http_req_failed: ['rate<0.01']
  //   },
  //   sleepDuration: 0.5
  // },
  // spike: {
  //   description: 'Sudden traffic spike simulation',
  //   scenarios: {
  //     spike_test: {
  //       executor: 'ramping-vus',
  //       startVUs: 10,
  //       stages: [
  //         { duration: '1m', target: 50 },
  //         { duration: '30s', target: 1000 },
  //         { duration: '30s', target: 50 },
  //         { duration: '1m', target: 0 }
  //       ]
  //     }
  //   },
  //   thresholds: {
  //     http_req_duration: [
  //       'p(50)<1500', // 50% under 1.5s
  //       'p(95)<3000', // 95% under 3s
  //       'p(99)<5000' // 99% under 5s
  //     ],
  //     http_req_failed: ['rate<0.01']
  //   },
  //   sleepDuration: 1
  // },
  'isp-baseline': {
    description: 'ISP baseline test with constant VUs',
    scenarios: {
      baseline_load: {
        executor: 'constant-vus',
        vus: 10,
        duration: '2m'
      }
    },
    thresholds: {
      http_req_duration: [
        'p(50)<2000', // 50% under 2s
        'p(95)<5000', // 95% under 5s
        'p(99)<8000' // 99% under 8s
      ],
      http_req_failed: ['rate<0.05']
    },
    sleepDuration: 1
  },
  'isp-rampup-200vus': {
    description: 'ISP load test with ramping up to 200 max VUs',
    scenarios: {
      internal_load: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
          { duration: '30s', target: 100 }, // ramping up to 100
          { duration: '30s', target: 200 }, // ramping up to 200
          { duration: '30s', target: 200 }, // hold at 200
          { duration: '30s', target: 0 }
        ]
      }
    },
    thresholds: {
      http_req_duration: [
        'p(50)<2000', // 50% under 2s
        'p(95)<5000', // 95% under 5s
        'p(99)<8000' // 99% under 8s
      ],
      http_req_failed: ['rate<0.05']
    },
    sleepDuration: 1
  },
  'isp-rampup-500vus': {
    description: 'ISP high load test with ramping up to 500 max VUs',
    scenarios: {
      internal_heavy_load: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
          { duration: '30s', target: 100 }, // ramping up to 100
          { duration: '30s', target: 200 }, // ramping up to 200
          { duration: '30s', target: 200 }, // hold at 200
          { duration: '30s', target: 500 }, // ramping up to 500
          { duration: '30s', target: 500 }, // hold at 500
          { duration: '30s', target: 0 } // ramping down to 0
        ]
      }
    },
    thresholds: {
      http_req_duration: [
        'p(50)<2500', // 50% under 2.5s
        'p(95)<6000', // 95% under 6s
        'p(99)<10000' // 99% under 10s
      ],
      http_req_failed: ['rate<0.1']
    },
    sleepDuration: 1
  }
};
