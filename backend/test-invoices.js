// Invoice API testing script
const API_BASE = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'John Doe',
  email: 'john.invoice@example.com',
  password: 'password123'
};

const testCustomer = {
  name: 'Acme Corporation',
  email: 'billing@acme.com',
  phone: '+1234567890',
  company: 'Acme Corp',
  address: {
    street: '123 Business Ave',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  }
};

const testInvoice = {
  items: [
    {
      description: 'Website Development',
      quantity: 1,
      rate: 2500.00
    },
    {
      description: 'SEO Optimization',
      quantity: 10,
      rate: 150.00
    }
  ],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  taxRate: 8.25,
  discountRate: 5,
  currency: 'USD',
  notes: 'Thank you for your business!',
  terms: 'Payment is due within 30 days of invoice date.'
};

console.log('🧾 Testing Invoice Functionality...\n');

// Helper function to make requests (PowerShell compatible)
function makeRequest(endpoint, method = 'GET', data = null, token = null, isRaw = false) {
  console.log(`${method} ${endpoint}`);
  
  let authHeader = '';
  if (token) {
    authHeader = `-Headers @{ Authorization = "Bearer ${token}" }`;
  }
  
  let bodyParam = '';
  if (data) {
    const jsonData = JSON.stringify(data).replace(/"/g, '\\"');
    bodyParam = `-Body '${jsonData}' -ContentType "application/json"`;
  }
  
  let command;
  if (isRaw) {
    // For PDF download
    command = `Invoke-RestMethod -Uri "${API_BASE}${endpoint}" -Method ${method} ${authHeader} -OutFile "invoice.pdf"`;
  } else {
    command = `Invoke-RestMethod -Uri "${API_BASE}${endpoint}" -Method ${method} ${authHeader} ${bodyParam}`;
  }
  
  console.log(`Command: ${command}\n`);
}

console.log('📋 INVOICE API TEST COMMANDS');
console.log('='.repeat(50));
console.log('Copy and paste these PowerShell commands one by one:\n');

console.log('1. 👤 Register/Login User:');
makeRequest('/auth/register', 'POST', testUser);
console.log('# If user already exists, use login:');
makeRequest('/auth/login', 'POST', { email: testUser.email, password: testUser.password });

console.log('2. 📝 Save the token from response and set it:');
console.log('$token = "YOUR_JWT_TOKEN_HERE"\n');

console.log('3. 👥 Create a customer:');
makeRequest('/customers', 'POST', testCustomer, '$token');

console.log('4. 📝 Save customer ID from response and create invoice:');
console.log('$customerId = "CUSTOMER_ID_FROM_RESPONSE"');
const invoiceWithCustomerId = { ...testInvoice, customerId: '$customerId' };
makeRequest('/invoices', 'POST', invoiceWithCustomerId, '$token');

console.log('5. 📊 Get all invoices:');
makeRequest('/invoices', 'GET', null, '$token');

console.log('6. 📋 Get invoices with filtering:');
makeRequest('/invoices?status=draft&page=1&limit=5', 'GET', null, '$token');

console.log('7. 📄 Get specific invoice:');
console.log('$invoiceId = "INVOICE_ID_FROM_RESPONSE"');
makeRequest('/invoices/$invoiceId', 'GET', null, '$token');

console.log('8. ✏️ Update invoice status to sent:');
makeRequest('/invoices/$invoiceId', 'PUT', { status: 'sent' }, '$token');

console.log('9. 💰 Mark invoice as paid:');
makeRequest('/invoices/$invoiceId', 'PUT', { status: 'paid' }, '$token');

console.log('10. 📄 Generate PDF:');
makeRequest('/invoices/$invoiceId/pdf', 'GET', null, '$token', true);

console.log('11. 📋 Duplicate invoice:');
makeRequest('/invoices/$invoiceId/duplicate', 'POST', null, '$token');

console.log('12. 🗑️ Delete invoice:');
console.log('$invoiceToDelete = "DUPLICATE_INVOICE_ID"');
makeRequest('/invoices/$invoiceToDelete', 'DELETE', null, '$token');

console.log('13. 📊 Check updated invoice statistics:');
makeRequest('/invoices', 'GET', null, '$token');

console.log('\n✅ COMPLETE TEST FLOW');
console.log('='.repeat(50));
console.log(`
# Complete test flow (replace with actual IDs):
$headers = @{ Authorization = "Bearer YOUR_TOKEN_HERE" }

# 1. Create customer
$customer = Invoke-RestMethod -Uri "${API_BASE}/customers" -Method POST -Body '${JSON.stringify(testCustomer)}' -ContentType "application/json" -Headers $headers
$customerId = $customer.customer._id

# 2. Create invoice
$invoiceBody = @{
  customerId = $customerId
  items = @(
    @{ description = "Website Development"; quantity = 1; rate = 2500.00 }
    @{ description = "SEO Optimization"; quantity = 10; rate = 150.00 }
  )
  dueDate = "${testInvoice.dueDate}"
  taxRate = 8.25
  discountRate = 5
  currency = "USD"
  notes = "Thank you for your business!"
  terms = "Payment is due within 30 days of invoice date."
} | ConvertTo-Json -Depth 3

$invoice = Invoke-RestMethod -Uri "${API_BASE}/invoices" -Method POST -Body $invoiceBody -ContentType "application/json" -Headers $headers
$invoiceId = $invoice.invoice._id

# 3. Get invoice details
Invoke-RestMethod -Uri "${API_BASE}/invoices/$invoiceId" -Method GET -Headers $headers

# 4. Generate PDF
Invoke-RestMethod -Uri "${API_BASE}/invoices/$invoiceId/pdf" -Method GET -Headers $headers -OutFile "invoice-$($invoice.invoice.invoiceNumber).pdf"

# 5. Update to paid
Invoke-RestMethod -Uri "${API_BASE}/invoices/$invoiceId" -Method PUT -Body '{"status": "paid"}' -ContentType "application/json" -Headers $headers

Write-Host "✅ Invoice functionality test completed!"
`);

console.log('\n🎯 Expected Results:');
console.log('- ✅ Invoice created with automatic numbering (INV-2025-09-XXXX)');
console.log('- ✅ Automatic calculation of totals (subtotal, tax, discount, total)');
console.log('- ✅ PDF generation with professional styling');
console.log('- ✅ Status tracking and date management');
console.log('- ✅ Pagination and filtering for invoice lists');
console.log('- ✅ User isolation (only see your own invoices)');
console.log('- ✅ Invoice count tracking for subscription limits\n');

console.log('💡 Tips:');
console.log('- Keep the server running in another terminal');
console.log('- Replace YOUR_TOKEN_HERE with actual JWT token');
console.log('- Replace CUSTOMER_ID and INVOICE_ID with actual values from responses');
console.log('- Check the generated PDF file in your current directory');