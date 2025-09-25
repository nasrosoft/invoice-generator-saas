import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Header,
  Form,
  Segment,
  Grid,
  Button,
  Icon,
  Table,
  Dropdown,
  Message,
  Input,
  TextArea
} from 'semantic-ui-react';
import { Invoice, InvoiceItem, Customer } from '../types';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

interface CreateInvoiceForm {
  customerId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes: string;
  taxRate: number;
}

const CreateInvoice: React.FC = () => {
  const [formData, setFormData] = useState<CreateInvoiceForm>({
    customerId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    items: [{ description: '', quantity: 1, rate: 0, unitPrice: 0, amount: 0, total: 0 }],
    notes: '',
    taxRate: 0
  });
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await apiService.get<Customer[]>('/customers');
      setCustomers(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch customers');
      console.error('Error fetching customers:', error);
    } finally {
      setCustomersLoading(false);
    }
  };

  const calculateItemTotal = (quantity: number, rate: number) => {
    return quantity * rate;
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * formData.taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Sync rate and unitPrice
    if (field === 'unitPrice') {
      newItems[index].rate = value as number;
    } else if (field === 'rate') {
      newItems[index].unitPrice = value as number;
    }
    
    // Recalculate total for this item
    if (field === 'quantity' || field === 'unitPrice' || field === 'rate') {
      const total = calculateItemTotal(newItems[index].quantity, newItems[index].rate);
      newItems[index].total = total;
      newItems[index].amount = total;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0, unitPrice: 0, amount: 0, total: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      toast.error('Please select a customer');
      return;
    }
    
    if (formData.items.some(item => !item.description.trim())) {
      toast.error('Please fill in all item descriptions');
      return;
    }

    setLoading(true);
    try {
      const selectedCustomer = customers.find(c => c._id === formData.customerId);
      if (!selectedCustomer) {
        toast.error('Selected customer not found');
        return;
      }

      const invoiceData = {
        customer: selectedCustomer,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        items: formData.items,
        notes: formData.notes,
        taxRate: formData.taxRate,
        subtotal: calculateSubtotal(),
        taxAmount: calculateTaxAmount(),
        total: calculateTotal(),
        status: 'draft'
      };

      const response = await apiService.post<Invoice>('/invoices', invoiceData);
      toast.success('Invoice created successfully!');
      navigate(`/invoices/${response.data._id}`);
    } catch (error) {
      toast.error('Failed to create invoice');
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const customerOptions = customers.map(customer => ({
    key: customer._id,
    text: `${customer.name} (${customer.email})`,
    value: customer._id
  }));

  return (
    <Container>
      <Header as='h1' style={{ marginBottom: '2rem' }}>
        <Icon name='plus' />
        Create New Invoice
        <Header.Subheader>
          Fill in the details below to create a new invoice
        </Header.Subheader>
      </Header>

      <Form onSubmit={handleSubmit} loading={loading}>
        <Grid columns={2} stackable>
          {/* Customer Selection */}
          <Grid.Column>
            <Segment>
              <Header as='h3'>
                <Icon name='user' />
                Customer Information
              </Header>
              <Form.Field required>
                <label>Select Customer</label>
                <Dropdown
                  placeholder='Choose a customer'
                  fluid
                  selection
                  search
                  loading={customersLoading}
                  options={customerOptions}
                  value={formData.customerId}
                  onChange={(e, { value }) => setFormData({ ...formData, customerId: value as string })}
                />
              </Form.Field>
              
              {customers.length === 0 && !customersLoading && (
                <Message info>
                  <Message.Header>No customers found</Message.Header>
                  <p>You need to create a customer first. <Link to='/customers'>Go to customers</Link></p>
                </Message>
              )}
            </Segment>
          </Grid.Column>

          {/* Invoice Dates */}
          <Grid.Column>
            <Segment>
              <Header as='h3'>
                <Icon name='calendar' />
                Invoice Dates
              </Header>
              <Form.Field required>
                <label>Issue Date</label>
                <Input
                  type='date'
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                />
              </Form.Field>
              <Form.Field required>
                <label>Due Date</label>
                <Input
                  type='date'
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </Form.Field>
            </Segment>
          </Grid.Column>
        </Grid>

        {/* Invoice Items */}
        <Segment>
          <Header as='h3'>
            <Icon name='list' />
            Invoice Items
          </Header>
          
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={8}>Description</Table.HeaderCell>
                <Table.HeaderCell width={2} textAlign='center'>Quantity</Table.HeaderCell>
                <Table.HeaderCell width={3} textAlign='right'>Rate</Table.HeaderCell>
                <Table.HeaderCell width={2} textAlign='right'>Amount</Table.HeaderCell>
                <Table.HeaderCell width={1} textAlign='center'>Action</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            
            <Table.Body>
              {formData.items.map((item, index) => (
                <Table.Row key={index}>
                  <Table.Cell>
                    <Input
                      fluid
                      placeholder='Item description'
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      fluid
                      type='number'
                      min='0'
                      step='0.01'
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      fluid
                      type='number'
                      min='0'
                      step='0.01'
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </Table.Cell>
                  <Table.Cell textAlign='right'>
                    <strong>{formatCurrency(item.amount)}</strong>
                  </Table.Cell>
                  <Table.Cell textAlign='center'>
                    <Button
                      icon='trash'
                      color='red'
                      size='small'
                      disabled={formData.items.length <= 1}
                      onClick={() => removeItem(index)}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='5'>
                  <Button
                    type='button'
                    icon='plus'
                    content='Add Item'
                    onClick={addItem}
                    color='blue'
                  />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </Segment>

        <Grid columns={2} stackable>
          {/* Notes and Tax */}
          <Grid.Column>
            <Segment>
              <Header as='h4'>
                <Icon name='sticky note' />
                Additional Information
              </Header>
              <Form.Field>
                <label>Notes (Optional)</label>
                <TextArea
                  placeholder='Any additional notes or terms...'
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </Form.Field>
              <Form.Field>
                <label>Tax Rate (%)</label>
                <Input
                  type='number'
                  min='0'
                  max='100'
                  step='0.01'
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  label={{ basic: true, content: '%' }}
                  labelPosition='right'
                />
              </Form.Field>
            </Segment>
          </Grid.Column>

          {/* Invoice Summary */}
          <Grid.Column>
            <Segment>
              <Header as='h4'>
                <Icon name='calculator' />
                Invoice Summary
              </Header>
              <Table definition>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>Subtotal</Table.Cell>
                    <Table.Cell textAlign='right'>{formatCurrency(calculateSubtotal())}</Table.Cell>
                  </Table.Row>
                  {formData.taxRate > 0 && (
                    <Table.Row>
                      <Table.Cell>Tax ({formData.taxRate}%)</Table.Cell>
                      <Table.Cell textAlign='right'>{formatCurrency(calculateTaxAmount())}</Table.Cell>
                    </Table.Row>
                  )}
                  <Table.Row>
                    <Table.Cell><strong>Total</strong></Table.Cell>
                    <Table.Cell textAlign='right'>
                      <strong style={{ fontSize: '1.2em', color: '#00b5ad' }}>
                        {formatCurrency(calculateTotal())}
                      </strong>
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Segment>
          </Grid.Column>
        </Grid>

        {/* Form Actions */}
        <Segment textAlign='center'>
          <Button.Group>
            <Button
              as={Link}
              to='/invoices'
              icon='cancel'
              content='Cancel'
            />
            <Button.Or />
            <Button
              type='submit'
              color='teal'
              icon='checkmark'
              content='Create Invoice'
              loading={loading}
              disabled={loading || !formData.customerId}
            />
          </Button.Group>
        </Segment>
      </Form>
    </Container>
  );
};

export default CreateInvoice;
