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
│   │   ├── 01-auth-login.js         # User authentication test
│   │   ├── 02-auth-me.js            # User profile verification
│   │   ├── 03-auth-features.js      # Feature access test
│   │   └── 04-master-categories.js  # Master data loading
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
- **Load Configuration**: Users (1-1000), Duration (30s, 2m, 1h)
- **Monitoring**: Prometheus integration toggle

### 2. Command Line Mode

```bash
# Basic usage
node cli-runner.js --scene <scene> --tests <selection> [options]

# Examples
node cli-runner.js --scene homepage --tests 1 --environment development
node cli-runner.js --scene quotation --tests 1-3 --users 10 --duration 2m
node cli-runner.js --scene homepage --tests all --prometheus
```

#### CLI Options

| Option                | Description               | Example                                |
| --------------------- | ------------------------- | -------------------------------------- |
| `--scene <name>`      | Test scene to run         | `homepage`, `quotation`                |
| `--tests <selection>` | Test selection            | `1`, `1,3`, `1-4`, `all`               |
| `--environment <env>` | Target environment        | `development`, `staging`, `production` |
| `--users <number>`    | Virtual users (1-1000)    | `10`, `50`, `100`                      |
| `--duration <time>`   | Test duration             | `30s`, `2m`, `1h`                      |
| `--prometheus`        | Enable Prometheus metrics | -                                      |
| `--help`              | Show usage help           | -                                      |

## 🧪 Test Scenarios

### Homepage Scene - Authentication & Landing

| Test                   | Endpoint                 | Purpose                                   |
| ---------------------- | ------------------------ | ----------------------------------------- |
| `01-auth-login`        | `POST /auth/login`       | User authentication with token extraction |
| `02-auth-me`           | `GET /auth/me`           | Authenticated user profile verification   |
| `03-auth-features`     | `GET /auth/features`     | User feature access permissions           |
| `04-master-categories` | `GET /master/categories` | Master data loading for UI                |

### Quotation Scene - Insurance Workflows

| Test                      | Endpoint                         | Purpose                                 |
| ------------------------- | -------------------------------- | --------------------------------------- |
| `01-list-quotations`      | `POST /quotation/requests/list`  | Retrieve user quotations with filtering |
| `02-get-quotation-detail` | `GET /quotation/detail/{uuid}`   | Get specific quotation details          |
| `03-create-quotation`     | `POST /quotation/save`           | Create new insurance quotation          |
| `04-submit-quotation`     | `POST /quotation/submit-request` | Submit quotation for processing         |

## 🌍 Environment Configuration

### Available Environments

| Environment     | Base URL                             | Timeout | Purpose                |
| --------------- | ------------------------------------ | ------- | ---------------------- |
| **Development** | `https://isp-api-dev.horixon-t8.com` | 5s      | Development testing    |
| **Staging**     | `https://isp-api-uat.horixon-t8.com` | 3s      | Pre-production testing |
| **Production**  | `https://isp-api.horixon-t8.com`     | 2s      | Production monitoring  |

### Authentication Setup

Set environment-specific credentials:

```bash
# Development
export DEV_TEST_USERNAME=your_dev_username
export DEV_TEST_PASSWORD=your_dev_password

# Staging
export STAGING_TEST_USERNAME=your_staging_username
export STAGING_TEST_PASSWORD=your_staging_password

# Production
export PROD_TEST_USERNAME=your_prod_username
export PROD_TEST_PASSWORD=your_prod_password
```

## 📊 Load Testing Configurations

### Predefined Load Patterns

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

- `reports/development_20250814231023_homepage_01-auth-login.html`
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
