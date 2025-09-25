// Simple API testing script
const API_BASE = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'password123'
};

const testCustomer = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  phone: '+1234567890',
  company: 'Smith Corp',
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  }
};

// Helper function to make requests
async function makeRequest(endpoint, method = 'GET', data = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const result = await response.json();
    
    console.log(`\n${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    return { status: response.status, data: result };
  } catch (error) {
    console.error(`Error with ${method} ${endpoint}:`, error.message);
    return { error: error.message };
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting API Tests...\n');

  // 1. Health check
  await makeRequest('/health');

  // 2. Get pricing plans
  await makeRequest('/payments/plans');

  // 3. Register user
  const registerResult = await makeRequest('/auth/register', 'POST', testUser);
  
  if (registerResult.status === 201) {
    const token = registerResult.data.token;
    console.log('\n🎯 User registered successfully! Token received.');

    // 4. Get user profile
    await makeRequest('/auth/me', 'GET', null, token);

    // 5. Create customer
    const customerResult = await makeRequest('/customers', 'POST', testCustomer, token);
    
    if (customerResult.status === 201) {
      const customerId = customerResult.data.customer._id;
      console.log('\n🎯 Customer created successfully!');

      // 6. Get all customers
      await makeRequest('/customers', 'GET', null, token);

      // 7. Get specific customer
      await makeRequest(`/customers/${customerId}`, 'GET', null, token);

      // 8. Update customer
      await makeRequest(`/customers/${customerId}`, 'PUT', {
        name: 'Jane Smith Updated',
        phone: '+1234567899'
      }, token);
    }

    // 9. Test invoice endpoints (placeholders for now)
    await makeRequest('/invoices', 'GET', null, token);
    
  } else {
    console.log('\n❌ User registration failed. Trying login with existing user...');
    
    // Try login instead
    const loginResult = await makeRequest('/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password
    });
    
    if (loginResult.status === 200) {
      const token = loginResult.data.token;
      console.log('\n🎯 User login successful!');
      
      // Test with existing user
      await makeRequest('/auth/me', 'GET', null, token);
      await makeRequest('/customers', 'GET', null, token);
    }
  }

  console.log('\n✅ API Tests completed!');
}

// Only run if this file is executed directly
if (require.main === module) {
  // Check if we're in Node.js environment
  if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ with fetch support.');
    console.log('💡 Alternative: Use curl commands or Postman to test the API endpoints.');
    console.log('\n📋 Sample curl commands:');
    console.log('1. Health check:');
    console.log('   curl -X GET http://localhost:5000/api/health');
    console.log('\n2. Register user:');
    console.log(`   curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '${JSON.stringify(testUser)}'`);
    console.log('\n3. Get pricing plans:');
    console.log('   curl -X GET http://localhost:5000/api/payments/plans');
    process.exit(1);
  }
  
  runTests().catch(console.error);
}