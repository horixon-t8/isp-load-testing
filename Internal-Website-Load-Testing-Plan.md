# Internal Website Load Testing Plan

**Document Version**: 1.0  
**Date**: September 2025  
**Test Environment**: Production (Internal Website)  
**Access Method**: Local Machine + VPN Connection

---

## 1. Executive Summary

This document outlines the comprehensive load testing strategy for the internal website production environment. The testing will be conducted via VPN connection to assess system performance, identify bottlenecks, and validate system capacity under various load conditions.

**Key Objectives:**

- Establish performance baselines for critical business flows
- Identify system bottlenecks and performance degradation points
- Validate system capacity under concurrent user loads
- Ensure system reliability meets operational requirements

---

## 2. Test Scope and Methodology

### 2.1 Testing Approach

**Load Testing Methodology**: Gradual ramp-up testing with sustained load periods

### 2.2 Functional Areas Under Test

The load testing will focus on the following critical business scenarios:

#### 2.2.1 User Authentication

- **Login Process**: Keycloak-based authentication system
- **Session Management**: User session validation and maintenance

#### 2.2.2 Homepage Operations

- **Dashboard Loading**: Main dashboard and navigation elements
- **Initial Data Retrieval**: Core system information loading

#### 2.2.3 Quotation Management

- **Quotation Lists**: Personal and team quotation views
- **Quotation Operations**: Creation, modification, and submission workflows

#### 2.2.4 Quotation Workflow

- **Draft Management**: Save and update draft quotations
- **Premium Calculation**: Real-time premium computation
- **Submission Process**: Quotation request submission and validation

#### 2.2.5 Policy Management Workflow

- **Policy Creation**: Converting quotations to policy drafts
- **Policy Configuration**: Detailed policy setup and validation
- **Policy Confirmation**: Final policy submission and document generation

### 2.3 Performance Baselines to Establish

The testing aims to establish performance baselines for:

- **Authentication Services**: Login response times and throughput
- **Homepage Performance**: Dashboard loading and rendering times
- **Quotation List Operations**: Data retrieval and display performance
- **Quotation Creation Workflow**: End-to-end transaction performance
- **Policy Creation Workflow**: Complete policy generation process performance

---

## 3. Detailed Test Scenarios and API Coverage

### 3.1 Scenario 1: User Authentication Flow

**API Endpoints:**

- `POST /auth/login` - User authentication

**Test Coverage:** 1 API call per user session

### 3.2 Scenario 2: Homepage Loading

**API Endpoints:**

- `GET /auth/me` - User validation
- `GET /auth/features` - Feature permissions
- `GET /master/categories` - Category data

**Test Coverage:** 3 API calls per homepage load

### 3.3 Scenario 3: Quotation List Management

Based on the test implementation, this scenario is divided into separate test scenes:

#### 3.3.1 My Work Quotations

**API Endpoints:**

- `POST /quotation/requests/list` - Personal quotations retrieval

**Test Coverage:** 1 API call per personal quotation list operation

#### 3.3.2 My Team Quotations

**API Endpoints:**

- `POST /quotation/requests/list` - Team quotations retrieval

**Test Coverage:** 1 API call per team quotation list operation

### 3.4 Scenario 4: Quotation Creation Workflow

#### 3.4.1 Draft Management Subflow

**API Endpoints:**

- `POST /quotation/save` - Save draft quotation
- `POST /quotation/calculate-premium` - Premium calculation
- `POST /quotation/save` - Update after calculation
- `GET /quotation/detail/${quotation-uuid}` - Validation

**Test Coverage:** 4 API calls per draft operation

#### 3.4.2 Quotation Detail View Subflow

**API Endpoints:**

- `GET /auth/me` - User validation
- `GET /auth/features` - Feature permissions
- `GET /master/categories` - Category data
- `GET /quotation/detail/${quotation-uuid}` - Quotation details
- `GET /quotation/check-block-accum` - Validation checks
- `GET /quotation/quotation-version-quote-files` - File management
- `GET /attachment/get-signed-url` - Attachment access

**Test Coverage:** 7 API calls per detail view

#### 3.4.3 Quotation Submission Subflow

**API Endpoints:**

- `POST /quotation/submit-request` - Submit quotation
- `GET /quotation/detail/${quotation-uuid}` - Validation
- `GET /quotation/quotation-version-quote-files?keyword=${quotation-uuid}` - File verification
- `POST /attachment/get-signed-url` - File access validation

**Test Coverage:** 4 API calls per submission

### 3.5 Scenario 5: Policy Creation Workflow

#### 3.5.1 Policy Conversion Subflow

**API Endpoints:**

- `POST /policy/create-draft-policy` - Create policy draft
- `GET /policy/detail/${policy-uuid}` - Policy validation

**Test Coverage:** 2 API calls per conversion

#### 3.5.2 Policy Detail Configuration Subflow

**API Endpoints:**

- `GET /auth/me` - User validation
- `GET /auth/features` - Feature permissions
- `GET /master/categories` - Category data
- `GET /policy/detail/${policy-uuid}` - Policy details
- `GET /policy/upper-floor-types` - Configuration options
- `GET /policy/owner-types` - Owner classifications
- `GET /policy/roof-beam-types` - Structural options
- `GET /policy/roof-types` - Roof classifications
- `GET /policy/check-block-accum` - Validation checks
- `GET /master/title/list` - Title options
- `GET /master/suffix/list` - Suffix options
- `GET /master/province/list` - Geographic data
- `GET /master/bank/list` - Banking information
- `GET /master/location/filter` - Location services
- `GET /master/get-delivery-channels` - Delivery options
- `GET /master/users/get-ae-mr` - User management

**Test Coverage:** 16 API calls per policy configuration

#### 3.5.3 Policy Confirmation Subflow

**API Endpoints:**

- `POST /policy/${policy-uuid}/confirm` - Policy confirmation
- `GET /policy/detail/${policy-uuid}` - Validation
- `GET /policy/files-search` - Document verification
- `POST /attachment/get-signed-url` - File validation

**Test Coverage:** 4 API calls per confirmation

---

## 4. Performance Concerns and Risk Assessment

### 4.1 Identified Performance Risks

#### 4.1.1 High-Risk Operations

- **Save Draft Quotation**: Complex data processing and validation
- **Submit Quotation Request**: Multi-step validation and workflow processing
- **Save Draft Policy**: Comprehensive policy data management
- **Submit Policy Request**: Final validation and document generation

#### 4.1.2 Infrastructure Concerns

- **Database Performance**: Slow query execution and potential deadlocks
- **Connection Management**: Database connection pool limitations
- **Resource Utilization**: Server capacity under concurrent load

### 4.2 Monitoring Focus Areas

- Database query response times
- Connection pool utilization
- Memory and CPU usage patterns
- Network latency and throughput

---

## 5. Load Testing Configuration

### 5.1 Test Patterns

#### 5.1.1 Baseline Load Test

- **Duration**: 2 minutes
- **Virtual Users**: 10 constant users
- **Purpose**: Establish performance baseline

#### 5.1.2 Ramp-Up Load Test

- **Total Duration**: 3 minutes
- **Load Pattern**:
  - 30 seconds: 0 → 100 VUs
  - 30 seconds: 100 → 200 VUs
  - 30 seconds: 200 VUs (sustained)
  - 30 seconds: 200 → 500 VUs
  - 30 seconds: 500 VUs (sustained)
  - 30 seconds: 500 → 0 VUs
- **Purpose**: Assess scalability and identify breaking points

### 5.2 Concurrent User Simulation

- **Maximum Concurrent Users**: 500 virtual users
- **Ramp-Up Strategy**: Gradual increase with sustained load periods
- **Test Distribution**: Equal distribution across all 9 test scenarios

---

## 6. Success Criteria and Exit Conditions

### 6.1 Performance Thresholds

#### 6.1.1 Error Rate Requirements

**Criteria 1**: Error rate must be less than 1%

- All API endpoints must maintain >99% success rate
- No critical system failures during test execution

#### 6.1.2 Response Time Requirements

**Criteria 2**: Response time performance targets

- P50 (50th percentile): < 2,000ms
- P95 (95th percentile): < 4,000ms
- P99 (99th percentile): < 6,000ms

#### 6.1.3 Throughput Requirements

**Criteria 3**: System capacity validation

- Minimum sustained throughput: 100 requests/second
- Peak load handling: 500 concurrent users
- Resource utilization: < 80% CPU and memory

### 6.2 Test Completion Criteria

- All 9 test scenarios executed successfully
- Performance thresholds met across all load patterns
- No critical system failures or data corruption
- Comprehensive performance baseline established

---

## 7. Testing Tools and Infrastructure

### 7.1 Load Testing Framework

**Primary Tool**: K6 Load Testing Framework

- **Scripting Language**: JavaScript
- **Test Execution**: Command-line interface
- **Reporting**: JSON and HTML reports

### 7.2 Monitoring and Observability

#### 7.2.1 Load Testing Data Pipeline

**K6 → Prometheus → Grafana Stack**

- **K6**: Streams load test metrics to Prometheus via remote write
- **Prometheus**: Time-series database for storing test metrics
- **Grafana**: Real-time visualization and dashboards
- **Dashboard Configuration**: Pre-configured K6 Prometheus dashboard

**Key Grafana Visualizations:**

- Performance overview (VUs, request rates, response times)
- HTTP request statistics and failure rates
- Request latency breakdown (blocked, sending, waiting, receiving)
- Success/failure rate trends
- Individual endpoint performance analysis

#### 7.2.2 Server-Side Resource Monitoring

**Google Cloud Platform Monitoring**

- **Resource Performance**: CPU, memory, disk utilization
- **Auto-scaling Events**: Instance scaling triggers and responses
- **Database Performance**: Query execution times, connection pools
- **Network Metrics**: Bandwidth usage, connection counts
- **Application Logs**: Error rates, response patterns
- **Infrastructure Alerts**: Resource threshold notifications

### 7.3 Test Environment Specifications

**Environment**: Production (Internal Website)
**Access Method**: VPN-secured connection from local machine
**Network Configuration**: Corporate VPN tunnel
**Security Considerations**: WAF disabled during test execution

---

## 8. Test Execution Plan

### 8.1 Pre-Test Requirements

- VPN connection established and validated
- Cloudflare WAF temporarily disabled
- Monitoring systems activated
- Backup and rollback procedures confirmed

### 8.2 Test Schedule

**Planned Execution Date**: September 22, 2025
**Execution Window**: 2-hour testing window
**Test Sequence**: Sequential execution of all 9 scenarios

### 8.3 Test Execution Flow

1. **Baseline Testing** (45 minutes): Execute baseline tests for all scenarios
2. **Ramp-Up Testing** (45 minutes): Execute scalability tests
3. **Results Analysis** (30 minutes): Initial performance assessment

---

## 9. Risk Management and Contingency Planning

### 9.1 Risk Mitigation Strategies

- **Production Impact**: Testing during low-usage periods
- **System Stability**: Gradual load increase with monitoring
- **Data Integrity**: Read-only operations where possible
- **Recovery Procedures**: Immediate test termination capabilities

### 9.2 Rollback Procedures

- Immediate test cessation upon critical threshold breach
- System health monitoring throughout test execution
- Database connection monitoring and management
- Performance metric real-time tracking

---

## 10. Deliverables and Reporting

### 10.1 Test Artifacts

- Comprehensive performance test results
- System capacity assessment report
- Performance baseline documentation
- Recommendations for optimization

### 10.2 Success Metrics Documentation

- Response time percentile analysis
- Error rate and failure analysis
- Throughput and capacity metrics
- Resource utilization patterns

---

**Document Prepared By**: Load Testing Team  
**Review Status**: Awaiting Stakeholder Review  
**Approval Required**: Technical Lead, Operations Team  
**Distribution**: Engineering Team, Operations Team, Management
