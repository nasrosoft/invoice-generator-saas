import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Header,
  Segment,
  Grid,
  Button,
  Icon,
  Label,
  Table,
  Divider,
  Message,
  Modal,
  Dropdown
} from 'semantic-ui-react';
import { Invoice } from '../types';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';
import { PageLoader } from '../components';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchInvoice(id);
    }
  }, [id]);

  const fetchInvoice = async (invoiceId: string) => {
    try {
      setLoading(true);
      const response = await apiService.get<Invoice>(`/invoices/${invoiceId}`);
      setInvoice(response.data);
    } catch (error) {
      toast.error('Failed to fetch invoice');
      console.error('Error fetching invoice:', error);
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!invoice || !newStatus) return;
    
    try {
      const response = await apiService.put<Invoice>(`/invoices/${invoice._id}`, {
        ...invoice,
        status: newStatus
      });
      setInvoice(response.data);
      setStatusModal(false);
      setNewStatus('');
      toast.success('Invoice status updated successfully');
    } catch (error) {
      toast.error('Failed to update invoice status');
      console.error('Error updating invoice status:', error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    
    try {
      const response = await apiService.get(`/invoices/${invoice._id}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
      console.error('Error downloading PDF:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'green';
      case 'pending': return 'yellow';
      case 'overdue': return 'red';
      case 'draft': return 'grey';
      default: return 'blue';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const statusOptions = [
    { key: 'draft', text: 'Draft', value: 'draft' },
    { key: 'pending', text: 'Pending', value: 'pending' },
    { key: 'paid', text: 'Paid', value: 'paid' },
    { key: 'overdue', text: 'Overdue', value: 'overdue' }
  ];

  if (loading) {
    return (
      <Container>
        <PageLoader text='Loading invoice details...' />
      </Container>
    );
  }

  if (!invoice) {
    return (
      <Container>
        <Message error>
          <Message.Header>Invoice Not Found</Message.Header>
          <p>The requested invoice could not be found.</p>
          <Button as={Link} to='/invoices' color='teal'>
            Back to Invoices
          </Button>
        </Message>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <Grid columns={2} stackable style={{ marginBottom: '1rem' }}>
        <Grid.Column>
          <Header as='h1'>
            <Icon name='file alternate outline' />
            Invoice {invoice.invoiceNumber}
            <Header.Subheader>
              Created on {formatDate(invoice.issueDate)}
            </Header.Subheader>
          </Header>
        </Grid.Column>
        <Grid.Column textAlign='right'>
          <Label color={getStatusColor(invoice.status)} size='large'>
            <Icon name='tag' />
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Label>
        </Grid.Column>
      </Grid>

      {/* Action Buttons */}
      <Segment>
        <Button.Group>
          <Button 
            as={Link} 
            to={`/invoices/${invoice._id}/edit`}
            color='blue'
            icon='edit'
            content='Edit Invoice'
          />
          <Button
            color='green'
            icon='download'
            content='Download PDF'
            onClick={handleDownloadPDF}
          />
          <Button
            color='orange'
            icon='tag'
            content='Update Status'
            onClick={() => {
              setNewStatus(invoice.status);
              setStatusModal(true);
            }}
          />
        </Button.Group>
        
        <Button 
          as={Link} 
          to='/invoices'
          floated='right'
          icon='arrow left'
          content='Back to Invoices'
        />
      </Segment>

      <Grid columns={2} stackable>
        {/* Invoice Information */}
        <Grid.Column>
          <Segment>
            <Header as='h3'>
              <Icon name='info circle' />
              Invoice Information
            </Header>
            <Table definition>
              <Table.Body>
                <Table.Row>
                  <Table.Cell width={4}>Invoice Number</Table.Cell>
                  <Table.Cell><strong>{invoice.invoiceNumber}</strong></Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Issue Date</Table.Cell>
                  <Table.Cell>{formatDate(invoice.issueDate)}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Due Date</Table.Cell>
                  <Table.Cell>{formatDate(invoice.dueDate)}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Status</Table.Cell>
                  <Table.Cell>
                    <Label color={getStatusColor(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Label>
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Total Amount</Table.Cell>
                  <Table.Cell><strong>{formatCurrency(invoice.total)}</strong></Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </Segment>
        </Grid.Column>

        {/* Customer Information */}
        <Grid.Column>
          <Segment>
            <Header as='h3'>
              <Icon name='user' />
              Customer Information
            </Header>
            <Table definition>
              <Table.Body>
                <Table.Row>
                  <Table.Cell width={4}>Name</Table.Cell>
                  <Table.Cell><strong>{invoice.customer.name}</strong></Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Email</Table.Cell>
                  <Table.Cell>{invoice.customer.email}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Phone</Table.Cell>
                  <Table.Cell>{invoice.customer.phone || 'N/A'}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Address</Table.Cell>
                  <Table.Cell>
                    {invoice.customer.address ? (
                      <>
                        {invoice.customer.address.street}<br />
                        {invoice.customer.address.city}, {invoice.customer.address.state} {invoice.customer.address.zipCode}<br />
                        {invoice.customer.address.country}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
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
              <Table.HeaderCell>Description</Table.HeaderCell>
              <Table.HeaderCell textAlign='center'>Quantity</Table.HeaderCell>
              <Table.HeaderCell textAlign='right'>Unit Price</Table.HeaderCell>
              <Table.HeaderCell textAlign='right'>Total</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {invoice.items.map((item, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <strong>{item.description}</strong>
                  {item.details && <div style={{ color: '#888', fontSize: '0.9em' }}>{item.details}</div>}
                </Table.Cell>
                <Table.Cell textAlign='center'>{item.quantity}</Table.Cell>
                <Table.Cell textAlign='right'>{formatCurrency(item.unitPrice)}</Table.Cell>
                <Table.Cell textAlign='right'><strong>{formatCurrency(item.total)}</strong></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan='3' textAlign='right'>
                <strong>Subtotal:</strong>
              </Table.HeaderCell>
              <Table.HeaderCell textAlign='right'>
                <strong>{formatCurrency(invoice.subtotal)}</strong>
              </Table.HeaderCell>
            </Table.Row>
            {invoice.taxAmount > 0 && (
              <Table.Row>
                <Table.HeaderCell colSpan='3' textAlign='right'>
                  Tax ({invoice.taxRate}%):
                </Table.HeaderCell>
                <Table.HeaderCell textAlign='right'>
                  {formatCurrency(invoice.taxAmount)}
                </Table.HeaderCell>
              </Table.Row>
            )}
            <Table.Row>
              <Table.HeaderCell colSpan='3' textAlign='right'>
                <strong style={{ fontSize: '1.2em' }}>Total:</strong>
              </Table.HeaderCell>
              <Table.HeaderCell textAlign='right'>
                <strong style={{ fontSize: '1.2em', color: '#00b5ad' }}>
                  {formatCurrency(invoice.total)}
                </strong>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </Segment>

      {/* Notes */}
      {invoice.notes && (
        <Segment>
          <Header as='h3'>
            <Icon name='sticky note' />
            Notes
          </Header>
          <p style={{ whiteSpace: 'pre-wrap' }}>{invoice.notes}</p>
        </Segment>
      )}

      {/* Status Update Modal */}
      <Modal
        open={statusModal}
        size='small'
        onClose={() => setStatusModal(false)}
      >
        <Modal.Header>
          <Icon name='tag' />
          Update Invoice Status
        </Modal.Header>
        <Modal.Content>
          <p>Update the status for invoice <strong>{invoice.invoiceNumber}</strong>:</p>
          <Dropdown
            selection
            fluid
            options={statusOptions}
            value={newStatus}
            onChange={(e, { value }) => setNewStatus(value as string)}
            placeholder='Select new status'
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setStatusModal(false)}>
            Cancel
          </Button>
          <Button
            color='teal'
            icon='checkmark'
            content='Update Status'
            onClick={handleStatusUpdate}
            disabled={!newStatus || newStatus === invoice.status}
          />
        </Modal.Actions>
      </Modal>
    </Container>
  );
};

export default InvoiceDetail;
