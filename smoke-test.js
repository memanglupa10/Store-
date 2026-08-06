import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/**
 * smoke-test.js
 * k6 Smoke Test Suite for Express.js High-Performance Production Audit
 * Babyiel Store - Enterprise Inventory & QRIS Database System
 * 
 * Target: Read-Only Main Endpoints (Zero Database Mutation)
 */

// Custom Performance Metrics
const errorRate = new Rate('custom_error_rate');
const pageLatency = new Trend('page_latency_ms');

// Test Configuration Options
export const options = {
  vus: 10,             // 10 Concurrent Virtual Users
  duration: '1m',      // Total Test Duration: 1 Minute
  
  // Performance SLA Thresholds
  thresholds: {
    // Overall HTTP Failure Rate must be under 1%
    http_req_failed: ['rate<0.01'],
    
    // Custom error rate must be under 1%
    custom_error_rate: ['rate<0.01'],
    
    // 95% of all HTTP requests must complete in less than 500ms
    http_req_duration: ['p(95)<500'],
    
    // 95% of page latency must be under 500ms
    page_latency_ms: ['p(95)<500'],
  },
};

// Base Target URL Configuration (Defaults to live production or local server)
const BASE_URL = __ENV.TARGET_URL || 'https://babyielstore.my.id';

export default function () {
  // Shared Headers for Browser Emulation
  const params = {
    headers: {
      'User-Agent': 'k6-SmokeTest-Runner/1.0 (Enterprise SLA Monitoring)',
      'Accept': 'application/json, text/html, */*',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    timeout: '10s',
  };

  // ---------------------------------------------------------
  // GROUP 1: Health Check Endpoint Test
  // ---------------------------------------------------------
  group('01. Health Check Endpoint', function () {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/health`, params);
    const duration = Date.now() - start;
    pageLatency.add(duration);

    const isSuccess = check(res, {
      'Health Check HTTP Status is 200': (r) => r.status === 200,
      'Health Status is ok': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.status === 'ok';
        } catch (e) {
          return false;
        }
      },
      'Response Time < 500ms': (r) => r.timings.duration < 500,
    });

    errorRate.add(!isSuccess);
  });

  // ---------------------------------------------------------
  // GROUP 2: Storefront Home Page Test
  // ---------------------------------------------------------
  group('02. Storefront Home Page', function () {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/`, params);
    const duration = Date.now() - start;
    pageLatency.add(duration);

    const isSuccess = check(res, {
      'Home Page HTTP Status is 200': (r) => r.status === 200,
      'Contains HTML doctype': (r) => r.body && r.body.includes('<!DOCTYPE html>'),
      'Contains Store title': (r) => r.body && r.body.includes('Babyiel Store'),
      'Response Time < 500ms': (r) => r.timings.duration < 500,
    });

    errorRate.add(!isSuccess);
  });

  // ---------------------------------------------------------
  // GROUP 3: Core Static Assets Test (CSS & JS)
  // ---------------------------------------------------------
  group('03. Static CSS & JS Assets', function () {
    const cssRes = http.get(`${BASE_URL}/css/style.css`, params);
    const jsRes = http.get(`${BASE_URL}/js/app.js`, params);

    const isCssOk = check(cssRes, {
      'CSS Asset Status is 200': (r) => r.status === 200,
      'CSS Content-Type is text/css': (r) => (r.headers['Content-Type'] || '').includes('text/css'),
    });

    const isJsOk = check(jsRes, {
      'JS Asset Status is 200': (r) => r.status === 200,
      'JS Content-Type is application/javascript': (r) => (r.headers['Content-Type'] || '').includes('javascript'),
    });

    errorRate.add(!isCssOk || !isJsOk);
  });

  // ---------------------------------------------------------
  // GROUP 4: Public Order Status Read-Only Endpoint Test
  // ---------------------------------------------------------
  group('04. Public Order Status Check', function () {
    const sampleOrderId = 'BYL-20260806-TEST';
    const res = http.get(`${BASE_URL}/api/orders/${sampleOrderId}/status`, params);

    const isSuccess = check(res, {
      'Order Status HTTP Status is 200': (r) => r.status === 200,
      'Response is valid JSON': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success === true;
        } catch (e) {
          return false;
        }
      },
    });

    errorRate.add(!isSuccess);
  });

  // ---------------------------------------------------------
  // Realistic User Think Time (Random Sleep 1s - 3s)
  // ---------------------------------------------------------
  const thinkTime = Math.random() * 2 + 1; // Generates a random float between 1.0 and 3.0 seconds
  sleep(thinkTime);
}

/**
 * Custom Summary Output Formatting
 */
export function handleSummary(data) {
  const p95Latency = data.metrics.http_req_duration.values['p(95)'].toFixed(2);
  const failRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
  const totalReqs = data.metrics.http_reqs.values.count;
  const reqsPerSec = data.metrics.http_reqs.values.rate.toFixed(2);

  console.log(`\n===================================================`);
  console.log(`🔥 k6 SMOKE TEST SUMMARY REPORT — BABYIEL STORE 🔥`);
  console.log(`===================================================`);
  console.log(`📊 Total Requests Sent : ${totalReqs} reqs`);
  console.log(`⚡ Throughput          : ${reqsPerSec} req/sec`);
  console.log(`⏱️ p95 Latency         : ${p95Latency} ms (Threshold: <500ms)`);
  console.log(`❌ HTTP Error Rate     : ${failRate}% (Threshold: <1%)`);
  console.log(`===================================================\n`);

  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  return '';
}
