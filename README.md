# K6 Load Testing Suite

A comprehensive K6 load testing suite for ISP API endpoints with modular scene-based architecture.

## 📁 Project Structure

```
k6-test-suite/
├── config/
│   ├── environments.js            # Environment configurations
│   └── test-settings.js           # Test execution settings
├── scenes/
│   ├── homepage/                  # Homepage related tests
│   │   ├── auth-me.js             # Test: GET /auth/me
│   │   ├── auth-features.js       # Test: GET /auth/features
│   │   ├── master-categories.js   # Test: GET /master/categories
│   │   └── homepage-flow.js       # Combined homepage flow
│   ├── quotation/                 # Quotation related tests
│   │   ├── list-quotations.js     # Test: GET /quotations/my-list
│   │   ├── create-quotation.js    # Test: POST /quotations
│   │   └── quotation-flow.js      # Complete quotation workflow
│   └── user-management/           # User management tests
│       ├── login.js               # Test: POST /auth/login
│       ├── profile.js             # Test: GET /user/profile
│       └── user-flow.js           # User management workflow
├── utils/
│   ├── config-loader.js           # Configuration management
│   ├── test-runner.js             # Dynamic test execution
│   ├── report-generator.js        # HTML/CSV report generation
│   └── helpers.js                 # Common test utilities
├── reports/                       # Generated reports directory
├── main.js                        # Main test runner entry point
├── package.json                   # Project dependencies
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites

- [K6](https://k6.io/docs/get-started/installation/) installed on your system

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd isp-load-testing

# Create reports directory
npm run setup
```

## 🎯 Usage Examples

### Basic Test Execution

```bash
# Run default homepage test
k6 run main.js

# Run specific scene
k6 run main.js --env SCENE=homepage
k6 run main.js --env SCENE=quotation
k6 run main.js --env SCENE=user-management
```

### Environment Configuration

```bash
# Run against different environments
k6 run main.js --env ENV=staging
k6 run main.js --env ENV=production
k6 run main.js --env ENV=development
```

### Load Test Types

```bash
# Light load testing
k6 run main.js --env TEST_TYPE=light

# Heavy load testing
k6 run main.js --env TEST_TYPE=heavy

# Spike testing
k6 run main.js --env TEST_TYPE=spike
```

### Custom Configuration

```bash
# Custom user count and duration
k6 run main.js --env SCENE=homepage --env USERS=100 --env DURATION=5m

# Run all tests in a scene
k6 run main.js --env SCENE=homepage --env RUN_ALL=true

# Export reports
k6 run main.js --env EXPORT_HTML=true --env EXPORT_CSV=true
```

### NPM Scripts

```bash
# Quick test commands
npm run test                    # Default test
npm run test:homepage           # Homepage tests
npm run test:quotation:list     # Quotation list flow only
npm run test:quotation:detail   # Quotation detail flow only
npm run test:quotation:create   # Quotation create flow only
npm run test:quotation:complete # Quotation complete flow (create→submit→PDF)
npm run test:user               # User management tests

# Load test types
npm run test:light            # Light load
npm run test:heavy            # Heavy load
npm run test:spike            # Spike test

# Environment specific
npm run test:staging          # Staging environment
npm run test:production       # Production environment

# Utility commands
npm run test:all              # Run all tests in scene
npm run test:export           # Generate HTML and CSV reports
npm run test:custom           # Custom configuration example
npm run clean                 # Clean up report files
```

## ⚙️ Configuration

### Environment Configuration (`config/environments.json`)

```json
{
  "staging": {
    "baseUrl": "https://isp-api-uat.horixon-t8.com",
    "timeout": 3000,
    "authToken": "your-staging-token"
  },
  "production": {
    "baseUrl": "https://isp-api.horixon-t8.com",
    "timeout": 2000,
    "authToken": "your-production-token"
  }
}
```

### Test Settings (`config/test-settings.json`)

```json
{
  "light": {
    "scenarios": {
      "light_load": {
        "executor": "constant-vus",
        "vus": 10,
        "duration": "2m"
      }
    }
  },
  "heavy": {
    "scenarios": {
      "heavy_load": {
        "executor": "ramping-vus",
        "startVUs": 10,
        "stages": [
          { "duration": "2m", "target": 100 },
          { "duration": "5m", "target": 300 },
          { "duration": "10m", "target": 500 }
        ]
      }
    }
  }
}
```

## 📊 Available Environment Variables

| Variable      | Description             | Default     | Example                                    |
| ------------- | ----------------------- | ----------- | ------------------------------------------ |
| `SCENE`       | Test scene to run       | `homepage`  | `homepage`, `quotation`, `user-management` |
| `ENV`         | Target environment      | `staging`   | `staging`, `production`, `development`     |
| `TEST_TYPE`   | Load test configuration | `default`   | `light`, `heavy`, `spike`                  |
| `USERS`       | Number of virtual users | From config | `100`, `500`                               |
| `DURATION`    | Test duration           | From config | `5m`, `30s`, `1h`                          |
| `RUN_ALL`     | Run all tests in scene  | `false`     | `true`                                     |
| `EXPORT_HTML` | Generate HTML report    | `false`     | `true`                                     |
| `EXPORT_CSV`  | Generate CSV report     | `false`     | `true`                                     |

## 📈 Reports

The test suite generates multiple types of reports:

### Console Output

Real-time metrics and test results displayed in the terminal.

### JSON Summary (`summary.json`)

Complete test metrics in JSON format for further processing.

### HTML Report (`reports/report.html`)

Visual dashboard with metrics, charts, and test results.

```bash
k6 run main.js --env EXPORT_HTML=true
```

### CSV Report (`reports/report.csv`)

Tabular data for analysis in spreadsheet applications.

```bash
k6 run main.js --env EXPORT_CSV=true
```

## 🎯 Test Scenes

### Homepage Scene

Tests the main application entry point:

- Authentication verification (`/auth/me`)
- Feature access (`/auth/features`)
- Master data loading (`/master/categories`)

### Quotation Scene

Tests quotation management:

- List user quotations (`/quotations/my-list`)
- Create new quotation (`/quotations`)
- Complete quotation workflow

### User Management Scene

Tests user-related operations:

- User authentication (`/auth/login`)
- Profile retrieval (`/user/profile`)
- Complete user workflow

## 📊 Metrics and Thresholds

### Default Thresholds

- Response time (95th percentile): < 2 seconds
- Error rate: < 5%
- Scene-specific error rates: < 2%

### Custom Metrics

- `*_errors`: Error rates for specific endpoints
- `*_response_time`: Response times for specific endpoints
- `*_requests`: Request counts for specific endpoints

## 🔧 Extending the Suite

### Adding New Scenes

1. Create a new directory under `scenes/`
2. Implement individual test functions
3. Create a scene flow orchestrator
4. Update the `TestRunner` class

### Adding New Environments

1. Update `config/environments.json`
2. Add environment-specific configurations
3. Update authentication tokens as needed

### Customizing Test Settings

1. Modify `config/test-settings.json`
2. Define new load patterns
3. Adjust thresholds as needed

## 🚨 Security Notes

- Never commit real authentication tokens
- Use environment variables for sensitive data
- Rotate test tokens regularly
- Separate test data from production data

## 🐛 Troubleshooting

### Common Issues

1. **Authentication failures**: Check token validity and format
2. **Network timeouts**: Adjust timeout settings in environment config
3. **Rate limiting**: Reduce concurrent users or add delays
4. **Missing dependencies**: Ensure K6 is properly installed

### Debug Mode

```bash
# Enable verbose logging
k6 run main.js --log-level debug

# Check specific metrics
k6 run main.js --env SCENE=homepage --summary-trend-stats=avg,min,max,p(95),p(99)
```
