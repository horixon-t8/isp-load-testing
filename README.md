# ISP K6 Load Testing Suite

A comprehensive K6 load testing suite for ISP (Insurance Service Provider) API endpoints with modular scene-based architecture, real-time monitoring, and flexible execution modes.

## 🏗️ Project Structure

```
isp-load-testing/
├── config/                          # Configuration management
│   ├── environments.js              # Environment-specific settings (dev/staging/prod)
│   ├── test-settings.js             # Load test scenarios and thresholds
│   └── test-credentials.js          # Authentication credential management
├── scenes/                          # Test scenarios organized by business domain
│   ├── homepage/                    # Authentication and landing page tests
│   │   ├── login.js                 # User authentication test
│   │   ├── homepage.js              # Homepage loading
│   ├── quotation/                   # Insurance quotation workflow tests
│   │   ├── 01-list-quotations.js    # List user quotations
│   │   ├── 02-get-quotation-detail.js # Get specific quotation details
│   │   ├── 03-create-quotation.js   # Create new quotation
│   │   └── 04-submit-quotation.js   # Submit quotation for processing
│   └── policy/                      # Policy management tests (future)
├── utils/                           # Core utilities and helpers
│   ├── config-loader.js             # Configuration management
│   ├── test-runner.js               # Test execution engine
│   ├── test-selector.js             # Test selection and parsing
│   ├── helpers.js                   # Common test utilities
│   ├── report-generator.js          # HTML/CSV report generation
│   ├── open-browser.js              # Browser automation for Grafana
│   └── wait-and-open.js             # Health check and browser opening
├── grafana/                         # Grafana monitoring setup
│   └── provisioning/
│       ├── dashboards/              # Pre-configured K6 dashboards
│       └── datasources/             # Prometheus data source config
├── prometheus/                      # Prometheus configuration
├── reports/                         # Generated test reports (HTML/CSV)
├── main.js                          # K6 test entry point
├── cli-runner.js                    # Interactive command-line interface
└── docker-compose.yml               # Monitoring stack (Prometheus + Grafana)
```

## 🚀 Quick Start

### Prerequisites

- [K6](https://k6.io/docs/get-started/installation/) installed locally
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose for monitoring
- Node.js for CLI runner

### Installation

```bash
# Install dependencies
npm install

# Create reports directory
npm run setup

# Start monitoring stack (optional)
npm run grafana:start
```

### Run Your First Test

```bash
# Interactive mode (recommended)
npm test

# Or run specific test
node cli-runner.js --scene homepage --tests 1 --prometheus
```

## 🎮 Usage Modes

### 1. Interactive Mode (Recommended)

```bash
npm test
# or
node cli-runner.js --interactive
```

Guided prompts for:

- **Scene Selection**: Homepage, Quotation
- **Test Selection**: Individual tests, ranges (1-4), or all
- **Environment**: Development, Staging, Production
- **Test Settings**: Execution patterns with predefined VU counts and durations
- **Monitoring**: Prometheus integration toggle

### 2. Command Line Mode

```bash
# Basic usage
node cli-runner.js --scene <scene> --tests <selection> [options]

# Examples
node cli-runner.js --scene homepage --tests 1 --environment development
node cli-runner.js --scene quotation --tests 1-3 --setting light
node cli-runner.js --scene homepage --tests all --setting light --prometheus
node cli-runner.js --scene quotation --tests 1-2 --setting heavy
```

#### CLI Options

| Option                | Description               | Example                                |
| --------------------- | ------------------------- | -------------------------------------- |
| `--scene <name>`      | Test scene to run         | `homepage`, `quotation`                |
| `--tests <selection>` | Test selection            | `1`, `1,3`, `1-4`, `all`               |
| `--environment <env>` | Target environment        | `development`, `staging`, `production` |
| `--setting <name>`    | Test load pattern         | `default`, `light`, `heavy`, `spike`   |
| `--prometheus`        | Enable Prometheus metrics | -                                      |
| `--help`              | Show usage help           | -                                      |

## 🧪 Test Scenarios

### Homepage Scene - Authentication & Landing

| Test       | Purpose                                   |
| ---------- | ----------------------------------------- |
| `login`    | User authentication with token extraction |
| `homepage` | Authenticated user profile verification   |

### Quotation Scene - Insurance Workflows

| Test                      | Purpose                                 |
| ------------------------- | --------------------------------------- |
| `01-list-quotations`      | Retrieve user quotations with filtering |
| `02-get-quotation-detail` | Get specific quotation details          |
| `03-create-quotation`     | Create new insurance quotation          |
| `04-submit-quotation`     | Submit quotation for processing         |

## 🌍 Environment Configuration

### Available Environments

| Environment     | Base URL                             | Timeout | Purpose                |
| --------------- | ------------------------------------ | ------- | ---------------------- |
| **Development** | `https://isp-api-dev.horixon-t8.com` | 5s      | Development testing    |
| **Staging**     | `https://isp-api-uat.horixon-t8.com` | 3s      | Pre-production testing |
| **Pre-Production**  | `https://isp-api-preprod.horixon-t8.com`     | 2s      | Production monitoring  |
| **Production**  | `http://isp-api.dhipaya.co.th`     | 2s      | Production monitoring  |

### Authentication Setup

Set environment-specific credentials:

```bash
# Development
export DEV_TEST_USERNAME=your_dev_username
export DEV_TEST_PASSWORD=your_dev_password

# Staging
export STAGING_TEST_USERNAME=your_staging_username
export STAGING_TEST_PASSWORD=your_staging_password

# Pre-Production Environment Test User
export PREPROD_TEST_USERNAME=your_preprod_username
export PREPROD_TEST_PASSWORD=your_preprod_password

# Production
export PROD_TEST_USERNAME=your_prod_username
export PROD_TEST_PASSWORD=your_prod_password
```

## 📊 Load Testing Configurations

### Test Settings (K6 Execution Scenarios)

The CLI supports predefined test settings that configure K6's execution patterns with realistic user behavior timing. Use `--setting <name>` or select interactively:

| Setting          | Executor              | Pattern                     | Think Time | Use Case                           |
| ---------------- | --------------------- | --------------------------- | ---------- | ---------------------------------- |
| **default**      | constant-arrival-rate | 1 req/s, up to 5 VUs        | 1s         | Basic load test with steady rate   |
| **constant-vus** | constant-vus          | 1 VU throughout             | 2s         | Fixed single user load test        |
| **ramping-vus**  | ramping-vus           | 1→5→10→0 VUs over 40s       | 1.5s       | Gradual load increase/decrease     |
| **light**        | constant-arrival-rate | 5 req/s, up to 20 VUs       | 1s         | Moderate load for everyday use     |
| **heavy**        | ramping-vus           | 10→500 VUs over 20m         | 0.5s       | High stress with fast interactions |
| **spike**        | ramping-vus           | 10→50→1000→50→0 VUs over 3m | 1s         | Sudden traffic spike simulation    |

### Legacy Load Patterns (Deprecated)

| Type        | Virtual Users | Duration | Pattern  | Use Case                    |
| ----------- | ------------- | -------- | -------- | --------------------------- |
| **Default** | 1             | 30s      | Constant | Basic functionality testing |
| **Light**   | 10            | 2m       | Constant | Light load validation       |
| **Heavy**   | 10→500        | 17m      | Ramping  | Stress testing              |
| **Spike**   | 50→1000→50    | Variable | Spike    | Peak load simulation        |

### NPM Script Shortcuts

```bash
# Load testing variants
npm run test:light          # Light load (10 users, 2m)
npm run test:heavy          # Heavy load (10→500 users, 17m)
npm run test:spike          # Spike test (50→1000→50 users)

# Scene-specific tests
npm run test:homepage       # All homepage tests
npm run test:quotation      # All quotation tests
```

## 📈 Prometheus & Grafana Integration

### Quick Start with Monitoring

```bash
# Start monitoring stack + open dashboard
npm run grafana:start

# Run tests with metrics streaming
npm test  # Interactive mode (Prometheus enabled by default)
# or
node cli-runner.js --scene homepage --tests 1 --prometheus
```

**Grafana Dashboard**: http://localhost:18080/grafana  
**Credentials**: admin / admin

### Available Metrics in Dashboard

- **HTTP Request Duration**: Average and 95th percentile response times
- **HTTP Request Failure Rate**: Real-time error rates
- **HTTP Requests Rate**: Requests per second
- **Virtual Users**: Current and maximum VU count
- **Auth Login Response Times**: Authentication-specific metrics

### Grafana Management

```bash
npm run grafana:start       # Start services + open browser
npm run grafana:up          # Start services only
npm run grafana:down        # Stop all services
npm run grafana:logs        # View service logs
npm run grafana:open        # Open dashboard in browser
```

### Manual Prometheus Setup

```bash
# Start monitoring stack
docker-compose up -d

# Run with custom Prometheus endpoint
K6_PROMETHEUS_RW_SERVER_URL=http://localhost:18080/prometheus/api/v1/write \
k6 run main.js --out experimental-prometheus-rw
```

### Prometheus Backup and Restore

#### NPM Scripts for Data Management

```bash
# Export Prometheus data (for analysis/migration)
npm run data:export

# Import Prometheus data
npm run data:import

# Create timestamped backup
npm run data:backup

# Restore from backup
npm run data:restore
```

#### Creating Data Backup

```bash
# Stop the monitoring stack
npm run grafana:down

# Create timestamped backup of Prometheus data
npm run data:backup
# Creates: prometheus/backups/prometheus-YYYYMMDD-HHMMSS.tar.gz

# Restart monitoring stack
npm run grafana:start
```

#### Restoring from Backup

```bash
# Stop the monitoring stack
npm run grafana:down

# Restore from specific backup file
npm run data:restore
# Interactive: Select from available backup files

# Start the monitoring stack
npm run grafana:start
```

#### Data Export and Import

**Export Prometheus Data**

```bash
# Export current metrics to JSON format
npm run data:export
# Creates: prometheus/exports/metrics-YYYYMMDD-HHMMSS.json
```

The export command:

- Extracts all current Prometheus metrics from the database
- Converts time-series data to portable JSON format
- Useful for data analysis, migration, or sharing test results
- Preserves metric names, labels, timestamps, and values

**Import Prometheus Data**

```bash
# Import previously exported metrics
npm run data:import
# Interactive: Select from available export files in prometheus/exports/
```

The import command:

- Restores metrics from JSON export files
- Merges imported data with existing metrics (non-destructive)
- Useful for combining test results from different environments
- Maintains data integrity and timestamp accuracy

#### Use Cases for Export/Import

| Scenario                  | Command             | Purpose                                  |
| ------------------------- | ------------------- | ---------------------------------------- |
| **Data Migration**        | `export` → `import` | Move metrics between environments        |
| **Test Result Archive**   | `export`            | Save specific test campaign data         |
| **Performance Analysis**  | `export`            | Extract data for external analysis tools |
| **Environment Sync**      | `export` → `import` | Share test data across teams             |
| **Historical Comparison** | `import`            | Compare current vs. previous test runs   |

#### Available Data Scripts

| Script         | Purpose                         | Output Location              |
| -------------- | ------------------------------- | ---------------------------- |
| `data:export`  | Export current metrics to JSON  | `prometheus/exports/`        |
| `data:import`  | Import metrics from JSON export | Restores to Prometheus       |
| `data:backup`  | Create timestamped archive      | `prometheus/backups/`        |
| `data:restore` | Restore from backup archive     | Interactive backup selection |

#### Backup Best Practices

- **Regular Schedule**: Run `npm run data:backup` before major test campaigns
- **Retention Policy**: Keep backups for 30 days, archive monthly snapshots
- **Validation**: Test restore process periodically with `npm run data:restore`
- **Storage**: Backup files stored in `prometheus/backups/` directory

## 📄 Reporting and Output

### Available Report Types

| Type             | Location              | Format  | Use Case             |
| ---------------- | --------------------- | ------- | -------------------- |
| **Console**      | Terminal              | Text    | Real-time monitoring |
| **JSON Summary** | `summary.json`        | JSON    | Automated processing |
| **HTML Report**  | `reports/report.html` | HTML    | Visual analysis      |
| **CSV Report**   | `reports/report.csv`  | CSV     | Spreadsheet analysis |
| **Prometheus**   | Live Dashboard        | Metrics | Real-time monitoring |

### Automatic Report Generation

**HTML and CSV reports are generated automatically** after every test execution with descriptive filenames:

- **HTML Report**: `reports/{scene}-{test}-{timestamp}.html` - Visual dashboard with metrics and charts
- **CSV Report**: `reports/{scene}-{test}-{timestamp}.csv` - Raw data for spreadsheet analysis
- **JSON Summary**: `summary.json` - Complete metrics in JSON format

**Example report names:**

- `reports/development_20250814231023_homepage_01-user-login.html`
- `reports/development_20250814165437_quotation_01-list-quotations-.csv`
- `reports/development_20250814103015_homepage_all-tests.html`

```bash
# Reports are created automatically - no additional flags needed
node cli-runner.js --scene homepage --tests 1

# Clean up reports
npm run clean
```

## 🎯 Performance Thresholds

### Default Thresholds

| Metric                          | Threshold | Purpose                      |
| ------------------------------- | --------- | ---------------------------- |
| Response Time (95th percentile) | < 2s      | Performance validation       |
| HTTP Error Rate                 | < 5%      | Reliability validation       |
| Scene-specific Error Rate       | < 2%      | Business workflow validation |

### Load-Specific Thresholds

| Load Type | Response Time | Error Rate | Description         |
| --------- | ------------- | ---------- | ------------------- |
| **Light** | < 1.5s        | < 2%       | Optimal performance |
| **Heavy** | < 3s          | < 10%      | Under stress        |
| **Spike** | < 5s          | < 20%      | Peak load handling  |

## ⚙️ Customizing Test Settings

### Modifying Existing Settings

Test settings are defined in `config/test-settings.js`. Each setting contains:

- **scenarios**: K6 execution configuration (VUs, duration, pattern)
- **thresholds**: Performance acceptance criteria
- **sleepDuration**: Wait time between requests (seconds)

#### Example Setting Structure:

```javascript
export default {
  'my-custom-setting': {
    description: 'Custom moderate load test', // CLI display description
    scenarios: {
      my_scenario: {
        executor: 'constant-vus', // Executor type
        vus: 10, // Virtual users
        duration: '2m' // Test duration
      }
    },
    thresholds: {
      http_req_duration: ['p(95)<2000'], // 95% of requests < 2s
      http_req_failed: ['rate<0.05'] // Error rate < 5%
    },
    sleepDuration: 1.5 // Think time between requests
  }
};
```

#### Current Settings Overview:

```javascript
// Each setting includes description, scenarios, thresholds, and sleepDuration
default: {
  description: 'Basic load test with steady 1 req/s',
  executor: 'constant-arrival-rate', rate: 1, sleepDuration: 1
}

constant-vus: {
  description: 'Fixed single user load test',
  executor: 'constant-vus', vus: 1, sleepDuration: 2
}

light: {
  description: 'Moderate load for everyday scenarios',
  executor: 'constant-arrival-rate', rate: 5, sleepDuration: 1
}

heavy: {
  description: 'High stress test with fast interactions',
  executor: 'ramping-vus', 10→500 VUs, sleepDuration: 0.5
}

spike: {
  description: 'Sudden traffic spike simulation',
  executor: 'ramping-vus', 10→1000→10 VUs, sleepDuration: 1
}
```

### Available K6 Executors

| Executor                | Use Case                      | Key Parameters               |
| ----------------------- | ----------------------------- | ---------------------------- |
| `constant-vus`          | Fixed number of VUs           | `vus`, `duration`            |
| `constant-arrival-rate` | Fixed request rate            | `rate`, `timeUnit`, `maxVUs` |
| `ramping-vus`           | Gradually change VU count     | `startVUs`, `stages[]`       |
| `ramping-arrival-rate`  | Gradually change request rate | `startRate`, `stages[]`      |

### Creating Custom Settings

1. **Add new setting** to `config/test-settings.js`:

```javascript
// Add to existing export
'stress-test': {
  description: 'Custom stress test with peak load',  // Required for CLI display
  scenarios: {
    stress_scenario: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 50 },   // Ramp up
        { duration: '3m', target: 100 },  // Stay at peak
        { duration: '1m', target: 0 }     // Ramp down
      ]
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.15']
  },
  sleepDuration: 2
}
```

2. **Use the new setting**:

```bash
# Command line
node cli-runner.js --scene homepage --tests all --setting stress-test

# Interactive mode (will appear automatically in the list with your description)
npm test
```

**Note:** The `description` field is **required** for new settings. It appears in the CLI interactive menu and helps users understand the setting's purpose.

### Setting Guidelines

- **sleepDuration (Think Time)**:
  - 0.5s: Fast interactions, stress scenarios
  - 1.0s: Normal user browsing behavior
  - 1.5-2s: Deliberate user actions, form filling
- **thresholds**: Set realistic performance expectations
- **VU scaling**: Start small, gradually increase for stress testing
- **Duration**: Balance test thoroughness with execution time

### Current Sleep Duration Strategy

| Setting      | Think Time | Rationale                             |
| ------------ | ---------- | ------------------------------------- |
| default      | 1s         | Normal browsing pace                  |
| constant-vus | 2s         | Deliberate single-user testing        |
| ramping-vus  | 1.5s       | Mixed user behavior patterns          |
| light        | 1s         | Realistic everyday usage              |
| heavy        | 0.5s       | Stress testing with fast interactions |
| spike        | 1s         | Realistic burst traffic behavior      |

### Performance Threshold Examples

```javascript
thresholds: {
  // Response time requirements
  http_req_duration: ['p(95)<2000'],        // 95% under 2s
  http_req_duration: ['p(99)<5000'],        // 99% under 5s
  http_req_duration: ['avg<1000'],          // Average under 1s

  // Error rate requirements
  http_req_failed: ['rate<0.05'],           // < 5% errors
  http_req_failed: ['rate<0.01'],           // < 1% errors (strict)

  // Custom metric thresholds
  login_duration: ['p(95)<3000'],           // Login-specific timing
  quotation_errors: ['rate<0.02']           // Feature-specific errors
}
```

### Ramping Patterns

#### Load Test Pattern:

```javascript
stages: [
  { duration: '2m', target: 10 }, // Gradual ramp up
  { duration: '5m', target: 10 }, // Stay at target
  { duration: '2m', target: 0 } // Ramp down
];
```

#### Stress Test Pattern:

```javascript
stages: [
  { duration: '5m', target: 100 }, // Ramp to normal load
  { duration: '10m', target: 200 }, // Increase to stress level
  { duration: '5m', target: 300 }, // Push to breaking point
  { duration: '10m', target: 200 }, // Back to stress level
  { duration: '5m', target: 0 } // Cool down
];
```

#### Spike Test Pattern:

```javascript
stages: [
  { duration: '1m', target: 50 }, // Normal load
  { duration: '30s', target: 1000 }, // Sudden spike
  { duration: '1m', target: 50 }, // Back to normal
  { duration: '30s', target: 0 } // End
];
```

## 🔧 Development and Maintenance

### Code Quality

```bash
npm run lint                # Code linting
npm run lint:fix            # Auto-fix linting issues
npm run fmt                 # Format code
npm run fmt:check           # Check formatting
npm run quality             # Run all quality checks
```

### Project Scripts

```bash
npm run setup               # Initialize project
npm run clean               # Clean reports
npm run test:help           # Show CLI help
```

## 🔐 Security Best Practices

- ✅ **No hardcoded credentials** - Use environment variables
- ✅ **Environment separation** - Different credentials per environment
- ✅ **Credential validation** - Smart placeholder detection
- ✅ **Token management** - Automatic extraction and reuse
- ✅ **Secure defaults** - Safe configuration out-of-the-box

## 🚨 Troubleshooting

### Common Issues

**Authentication Failures**

```bash
# Check credentials are set
echo $DEV_TEST_USERNAME $DEV_TEST_PASSWORD

# Verify environment
node cli-runner.js --scene homepage --tests 1 --environment development
```

**Prometheus Connection Issues**

```bash
# Ensure monitoring stack is running
docker-compose ps

# Check Prometheus endpoint
curl http://localhost:18080/prometheus/-/ready
```

**Network Timeouts**

```bash
# Check environment timeouts in config/environments.js
# Adjust based on network conditions
```

### Debug Mode

```bash
# Enable verbose K6 logging
k6 run main.js --log-level debug

# Check specific metrics
k6 run main.js --summary-trend-stats=avg,min,max,p(95),p(99)
```

## 📚 Advanced Usage

### Custom Test Development

1. **Add New Scene**: Create directory under `scenes/`
2. **Implement Tests**: Follow existing patterns in `scenes/homepage/`
3. **Update Test Runner**: Modify `utils/test-runner.js` if needed
4. **Add Configuration**: Update environment and test settings

### Environment Extension

1. **Update Environments**: Modify `config/environments.js`
2. **Add Credentials**: Set environment variables
3. **Test Configuration**: Verify connectivity and authentication

### Custom Metrics

```javascript
// Add custom metrics in test files
import { Trend, Rate } from 'k6/metrics';

const customResponseTime = new Trend('custom_response_time');
const customErrorRate = new Rate('custom_errors');
```

## 🤝 Contributing

1. Follow existing code patterns and structure
2. Add tests for new functionality
3. Update documentation for changes
4. Run quality checks: `npm run quality`
5. Ensure monitoring integration works

## 📋 Requirements

- **K6**: >= 0.45.0
- **Node.js**: >= 16.0.0
- **Docker**: Latest version
- **Docker Compose**: V2+ recommended

---

**Dashboard**: http://localhost:18080/grafana (admin/admin)  
**Traefik**: http://localhost:18081 (API dashboard)
