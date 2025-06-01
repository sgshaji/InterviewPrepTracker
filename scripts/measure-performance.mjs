console.log('--- Starting measure-performance.mjs script ---');

import { performance } from 'perf_hooks';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const ITERATIONS = 5;

async function measureTime(fn) {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
}

async function measureEndpoint(endpoint, method = 'GET', data = null) {
  console.log(`[measureEndpoint] ${method} ${endpoint}`);
  const times = [];
  
  for (let i = 0; i < ITERATIONS; i++) {
    try {
      const time = await measureTime(async () => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          method,
          headers: data ? { 'Content-Type': 'application/json' } : {},
          body: data ? JSON.stringify(data) : undefined,
        });
        
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
        }
        
        return response.json();
      });
      times.push(time);
      console.log(`  Iteration ${i + 1}: ${time.toFixed(2)}ms`);
    } catch (err) {
      console.error(`  Iteration ${i + 1} failed:`, err);
      times.push(NaN);
    }
    // Small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const validTimes = times.filter(t => !isNaN(t));
  const avg = validTimes.length ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length : NaN;
  const min = validTimes.length ? Math.min(...validTimes) : NaN;
  const max = validTimes.length ? Math.max(...validTimes) : NaN;
  
  return { avg, min, max, times };
}

async function runPerformanceTests() {
  try {
    console.log('🚀 Starting performance tests...\n');
    
    // Test 1: Fetch applications with pagination
    console.log('📊 Testing GET /api/applications with pagination:');
    const paginationResults = await measureEndpoint('/api/applications?page=0&limit=50');
    console.log(`Average: ${paginationResults.avg?.toFixed(2)}ms`);
    console.log(`Min: ${paginationResults.min?.toFixed(2)}ms`);
    console.log(`Max: ${paginationResults.max?.toFixed(2)}ms\n`);
    
    // Test 2: Create new application
    console.log('📝 Testing POST /api/applications:');
    const createResults = await measureEndpoint('/api/applications', 'POST', {
      companyName: 'Test Company',
      roleTitle: 'Senior Product Manager',
      dateApplied: new Date().toISOString().split('T')[0],
      jobStatus: 'Applied',
      applicationStage: 'In Review',
      modeOfApplication: 'Company Website'
    });
    console.log(`Average: ${createResults.avg?.toFixed(2)}ms`);
    console.log(`Min: ${createResults.min?.toFixed(2)}ms`);
    console.log(`Max: ${createResults.max?.toFixed(2)}ms\n`);
    
    // Test 3: Update application
    console.log('✏️ Testing PUT /api/applications/1:');
    const updateResults = await measureEndpoint('/api/applications/1', 'PUT', {
      jobStatus: 'Interviewing',
      applicationStage: 'HR Round'
    });
    console.log(`Average: ${updateResults.avg?.toFixed(2)}ms`);
    console.log(`Min: ${updateResults.min?.toFixed(2)}ms`);
    console.log(`Max: ${updateResults.max?.toFixed(2)}ms\n`);
    
    // Test 4: Fetch dashboard stats
    console.log('📈 Testing GET /api/dashboard/stats:');
    const statsResults = await measureEndpoint('/api/dashboard/stats');
    console.log(`Average: ${statsResults.avg?.toFixed(2)}ms`);
    console.log(`Min: ${statsResults.min?.toFixed(2)}ms`);
    console.log(`Max: ${statsResults.max?.toFixed(2)}ms\n`);
    
    // Test 5: Fetch applications with different page sizes
    console.log('📚 Testing different page sizes:');
    const pageSizes = [10, 50, 100];
    for (const size of pageSizes) {
      console.log(`\nPage size: ${size}`);
      const results = await measureEndpoint(`/api/applications?page=0&limit=${size}`);
      console.log(`Average: ${results.avg?.toFixed(2)}ms`);
      console.log(`Min: ${results.min?.toFixed(2)}ms`);
      console.log(`Max: ${results.max?.toFixed(2)}ms`);
    }
    console.log('\n✅ Performance tests complete.');
  } catch (error) {
    console.error('Performance test error:', error);
  }
}

// Run if called directly
try {
  if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('--- Detected direct execution, running runPerformanceTests() ---');
    runPerformanceTests()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
      });
  }
} catch (e) {
  console.error('Top-level error:', e);
}

export { runPerformanceTests }; 