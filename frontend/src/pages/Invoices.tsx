import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Header,
  Segment,
  Icon,
  Label,
  Menu,
  Dropdown,
  Input,
  Grid,
  Container,
  Pagination,
  Modal,
  Message
} from 'semantic-ui-react';
import { Invoice } from '../types';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';
import { PageLoader } from '../components';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; invoice: Invoice | null }>({ open: false, invoice: null });
  const navigate = useNavigate();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<Invoice[]>('/invoices');
      setInvoices(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch invoices');
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!deleteModal.invoice) return;
    
    try {
      await apiService.delete(`/invoices/${deleteModal.invoice._id}`);
      setInvoices(prev => prev.filter(inv => inv._id !== deleteModal.invoice!._id));
      toast.success('Invoice deleted successfully');
      setDeleteModal({ open: false, invoice: null });
    } catch (error) {
      toast.error('Failed to delete invoice');
      console.error('Error deleting invoice:', error);
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
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  const statusOptions = [
    { key: 'all', text: 'All Status', value: 'all' },
    { key: 'draft', text: 'Draft', value: 'draft' },
    { key: 'pending', text: 'Pending', value: 'pending' },
    { key: 'paid', text: 'Paid', value: 'paid' },
    { key: 'overdue', text: 'Overdue', value: 'overdue' }
  ];

  return (
    <Container fluid>
      <Header as='h1' style={{ marginBottom: '2rem' }}>
        <Icon name='file alternate outline' />
        Invoices
        <Header.Subheader>
          Manage all your invoices in one place
        </Header.Subheader>
      </Header>

      <Segment>
        <Grid stackable>
          <Grid.Row>
            <Grid.Column width={8}>
              <Input
                icon='search'
                iconPosition='left'
                placeholder='Search invoices...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%' }}
              />
            </Grid.Column>
            <Grid.Column width={4}>
              <Dropdown
                selection
                options={statusOptions}
                value={statusFilter}
                onChange={(e, { value }) => setStatusFilter(value as string)}
                style={{ width: '100%' }}
              />
            </Grid.Column>
            <Grid.Column width={4}>
              <Button
                as={Link}
                to='/invoices/create'
                color='teal'
                icon='plus'
                content='Create Invoice'
                style={{ width: '100%' }}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>

      {loading ? (
        <PageLoader text='Loading invoices...' />
      ) : currentInvoices.length === 0 ? (
        <Segment placeholder>
          <Header icon>
            <Icon name='file outline' />
            {filteredInvoices.length === 0 && searchTerm ? 
              'No invoices match your search' : 
              'No invoices found'
            }
          </Header>
          <Button 
            primary 
            as={Link} 
            to='/invoices/create'
            icon='plus'
            content='Create Your First Invoice'
          />
        </Segment>
      ) : (
        <>
          <Table celled striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Invoice #</Table.HeaderCell>
                <Table.HeaderCell>Customer</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Due Date</Table.HeaderCell>
                <Table.HeaderCell>Amount</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell textAlign='center'>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {currentInvoices.map((invoice) => (
                <Table.Row key={invoice._id}>
                  <Table.Cell>
                    <strong>{invoice.invoiceNumber}</strong>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <strong>{invoice.customer.name}</strong>
                      <br />
                      <small style={{ color: '#888' }}>{invoice.customer.email}</small>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {formatDate(invoice.issueDate)}
                  </Table.Cell>
                  <Table.Cell>
                    {formatDate(invoice.dueDate)}
                  </Table.Cell>
                  <Table.Cell>
                    <strong>{formatCurrency(invoice.total)}</strong>
                  </Table.Cell>
                  <Table.Cell>
                    <Label color={getStatusColor(invoice.status)} size='small'>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Label>
                  </Table.Cell>
                  <Table.Cell textAlign='center'>
                    <Button.Group size='small'>
                      <Button
                        as={Link}
                        to={`/invoices/${invoice._id}`}
                        icon='eye'
                        color='blue'
                        title='View Invoice'
                      />
                      <Button
                        as={Link}
                        to={`/invoices/${invoice._id}/edit`}
                        icon='edit'
                        color='yellow'
                        title='Edit Invoice'
                      />
                      <Button
                        icon='trash'
                        color='red'
                        title='Delete Invoice'
                        onClick={() => setDeleteModal({ open: true, invoice })}
                      />
                    </Button.Group>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {totalPages > 1 && (
            <Segment basic textAlign='center'>
              <Pagination
                activePage={currentPage}
                totalPages={totalPages}
                onPageChange={(e, { activePage }) => setCurrentPage(activePage as number)}
                size='small'
              />
            </Segment>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal.open}
        size='small'
        onClose={() => setDeleteModal({ open: false, invoice: null })}
      >
        <Modal.Header>
          <Icon name='trash' color='red' />
          Delete Invoice
        </Modal.Header>
        <Modal.Content>
          <p>
            Are you sure you want to delete invoice{' '}
            <strong>{deleteModal.invoice?.invoiceNumber}</strong>?
            This action cannot be undone.
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={() => setDeleteModal({ open: false, invoice: null })}
          >
            Cancel
          </Button>
          <Button
            color='red'
            icon='trash'
            content='Delete'
            onClick={handleDeleteInvoice}
          />
        </Modal.Actions>
      </Modal>
    </Container>
  );
};

export default Invoices;
