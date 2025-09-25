import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import { IInvoice } from '../models/Invoice';
import { IUser } from '../models/User';
import { ICustomer } from '../models/Customer';

// Generate unique invoice number
export const generateInvoiceNumber = async (userId: string): Promise<string> => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Generate format: INV-YYYY-MM-XXXX
  const prefix = `INV-${year}-${month}`;
  
  // Get the latest invoice number for this user and month
  const Invoice = require('../models/Invoice').default;
  const latestInvoice = await Invoice.findOne({
    userId,
    invoiceNumber: { $regex: `^${prefix}` }
  }).sort({ invoiceNumber: -1 });

  let sequence = 1;
  if (latestInvoice) {
    const lastSequence = parseInt(latestInvoice.invoiceNumber.split('-')[3]);
    sequence = lastSequence + 1;
  }

  return `${prefix}-${String(sequence).padStart(4, '0')}`;
};

// Calculate invoice totals
export const calculateInvoiceTotals = (items: any[], taxRate: number = 0, discountRate: number = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const amount = item.quantity * item.rate;
    return sum + amount;
  }, 0);

  const taxAmount = (subtotal * taxRate) / 100;
  const discountAmount = (subtotal * discountRate) / 100;
  const total = subtotal + taxAmount - discountAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

// Generate PDF invoice
export const generateInvoicePDF = async (
  invoice: IInvoice,
  user: IUser,
  customer: ICustomer
): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    const htmlContent = generateInvoiceHTML(invoice, user, customer);
    
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
};

// Generate HTML template for invoice
const generateInvoiceHTML = (invoice: IInvoice, user: IUser, customer: ICustomer): string => {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
        }
        
        .company-info h1 {
            font-size: 28px;
            color: #3b82f6;
            margin-bottom: 5px;
        }
        
        .company-info p {
            color: #666;
            margin-bottom: 2px;
        }
        
        .invoice-info {
            text-align: right;
        }
        
        .invoice-info h2 {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .invoice-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        
        .bill-to, .invoice-details {
            flex: 1;
        }
        
        .bill-to {
            margin-right: 40px;
        }
        
        .bill-to h3, .invoice-details h3 {
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .bill-to p, .invoice-details p {
            margin-bottom: 5px;
            color: #666;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .items-table th,
        .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
        }
        
        .items-table .qty,
        .items-table .rate,
        .items-table .amount {
            text-align: right;
        }
        
        .items-table .amount {
            font-weight: 600;
        }
        
        .totals {
            margin-left: auto;
            width: 300px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .total-row.final {
            border-bottom: 2px solid #3b82f6;
            font-weight: 700;
            font-size: 16px;
            background-color: #f0f9ff;
            padding: 12px 0;
            margin-top: 10px;
        }
        
        .notes {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        
        .notes h3 {
            font-size: 16px;
            margin-bottom: 10px;
            color: #1f2937;
        }
        
        .notes p {
            color: #666;
            line-height: 1.8;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-draft { background-color: #f3f4f6; color: #6b7280; }
        .status-sent { background-color: #dbeafe; color: #1d4ed8; }
        .status-paid { background-color: #d1fae5; color: #065f46; }
        .status-overdue { background-color: #fee2e2; color: #dc2626; }
        .status-cancelled { background-color: #f3f4f6; color: #374151; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <h1>${user.name}</h1>
            <p>${user.email}</p>
            <p>Invoice Generator</p>
        </div>
        <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>${invoice.invoiceNumber}</strong></p>
            <span class="status-badge status-${invoice.status}">${invoice.status}</span>
        </div>
    </div>
    
    <div class="invoice-meta">
        <div class="bill-to">
            <h3>Bill To</h3>
            <p><strong>${customer.name}</strong></p>
            ${customer.company ? `<p>${customer.company}</p>` : ''}
            <p>${customer.email}</p>
            ${customer.phone ? `<p>${customer.phone}</p>` : ''}
            ${customer.address.street ? `
            <p>${customer.address.street}</p>
            <p>${customer.address.city}${customer.address.state ? `, ${customer.address.state}` : ''} ${customer.address.zipCode || ''}</p>
            ${customer.address.country ? `<p>${customer.address.country}</p>` : ''}
            ` : ''}
        </div>
        
        <div class="invoice-details">
            <h3>Invoice Details</h3>
            <p><strong>Issue Date:</strong> ${formatDate(invoice.issueDate)}</p>
            <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
            ${invoice.paidDate ? `<p><strong>Paid Date:</strong> ${formatDate(invoice.paidDate)}</p>` : ''}
            <p><strong>Currency:</strong> ${invoice.currency}</p>
        </div>
    </div>
    
    <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th class="qty">Qty</th>
                <th class="rate">Rate</th>
                <th class="amount">Amount</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.items.map(item => `
            <tr>
                <td>${item.description}</td>
                <td class="qty">${item.quantity}</td>
                <td class="rate">${formatCurrency(item.rate, invoice.currency)}</td>
                <td class="amount">${formatCurrency(item.amount, invoice.currency)}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="totals">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(invoice.subtotal, invoice.currency)}</span>
        </div>
        ${invoice.discountRate > 0 ? `
        <div class="total-row">
            <span>Discount (${invoice.discountRate}%):</span>
            <span>-${formatCurrency(invoice.discountAmount, invoice.currency)}</span>
        </div>
        ` : ''}
        ${invoice.taxRate > 0 ? `
        <div class="total-row">
            <span>Tax (${invoice.taxRate}%):</span>
            <span>${formatCurrency(invoice.taxAmount, invoice.currency)}</span>
        </div>
        ` : ''}
        <div class="total-row final">
            <span>Total:</span>
            <span>${formatCurrency(invoice.total, invoice.currency)}</span>
        </div>
    </div>
    
    ${invoice.notes || invoice.terms ? `
    <div class="notes">
        ${invoice.notes ? `
        <h3>Notes</h3>
        <p>${invoice.notes}</p>
        ` : ''}
        ${invoice.terms ? `
        <h3>Terms & Conditions</h3>
        <p>${invoice.terms}</p>
        ` : ''}
    </div>
    ` : ''}
</body>
</html>
  `.trim();
};