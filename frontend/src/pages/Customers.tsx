import React, { useState, useEffect } from 'react';
import {
  Container,
  Header,
  Segment,
  Table,
  Button,
  Icon,
  Modal,
  Form,
  Input,
  Grid,
  Message,
  Pagination,
  Dropdown
} from 'semantic-ui-react';
import { Customer } from '../types';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';
import { PageLoader } from '../components';

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; customer: Customer | null }>({ open: false, customer: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<CustomerForm>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    }
  });
  const [formErrors, setFormErrors] = useState<Partial<CustomerForm>>({});
  const [submitting, setSubmitting] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<Customer[]>('/customers');
      setCustomers(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch customers');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'United States'
        }
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'United States'
        }
      });
    }
    setFormErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<CustomerForm> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const customerData = {
        ...formData,
        address: formData.address.street ? formData.address : undefined
      };
      
      if (editingCustomer) {
        const response = await apiService.put<Customer>(`/customers/${editingCustomer._id}`, customerData);
        setCustomers(prev => prev.map(c => c._id === editingCustomer._id ? response.data : c));
        toast.success('Customer updated successfully');
      } else {
        const response = await apiService.post<Customer>('/customers', customerData);
        setCustomers(prev => [response.data, ...prev]);
        toast.success('Customer created successfully');
      }
      
      handleCloseModal();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save customer';
      toast.error(errorMessage);
      console.error('Error saving customer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deleteModal.customer) return;
    
    try {
      await apiService.delete(`/customers/${deleteModal.customer._id}`);
      setCustomers(prev => prev.filter(c => c._id !== deleteModal.customer!._id));
      toast.success('Customer deleted successfully');
      setDeleteModal({ open: false, customer: null });
    } catch (error) {
      toast.error('Failed to delete customer');
      console.error('Error deleting customer:', error);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const countryOptions = [
    { key: 'us', text: 'United States', value: 'United States' },
    { key: 'ca', text: 'Canada', value: 'Canada' },
    { key: 'uk', text: 'United Kingdom', value: 'United Kingdom' },
    { key: 'au', text: 'Australia', value: 'Australia' }
  ];

  return (
    <Container fluid>
      <Header as='h1' style={{ marginBottom: '2rem' }}>
        <Icon name='users' />
        Customers
        <Header.Subheader>
          Manage your customer information
        </Header.Subheader>
      </Header>

      <Segment>
        <Grid stackable>
          <Grid.Row>
            <Grid.Column width={12}>
              <Input
                icon='search'
                iconPosition='left'
                placeholder='Search customers...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%' }}
              />
            </Grid.Column>
            <Grid.Column width={4}>
              <Button
                color='teal'
                icon='plus'
                content='Add Customer'
                onClick={() => handleOpenModal()}
                style={{ width: '100%' }}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>

      {loading ? (
        <PageLoader text='Loading customers...' />
      ) : currentCustomers.length === 0 ? (
        <Segment placeholder>
          <Header icon>
            <Icon name='users' />
            {filteredCustomers.length === 0 && searchTerm ? 
              'No customers match your search' : 
              'No customers found'
            }
          </Header>
          <Button 
            primary 
            onClick={() => handleOpenModal()}
            icon='plus'
            content='Add Your First Customer'
          />
        </Segment>
      ) : (
        <>
          <Table celled striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Phone</Table.HeaderCell>
                <Table.HeaderCell>Location</Table.HeaderCell>
                <Table.HeaderCell textAlign='center'>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {currentCustomers.map((customer) => (
                <Table.Row key={customer._id}>
                  <Table.Cell>
                    <strong>{customer.name}</strong>
                  </Table.Cell>
                  <Table.Cell>
                    <Icon name='mail' />
                    {customer.email}
                  </Table.Cell>
                  <Table.Cell>
                    {customer.phone ? (
                      <><Icon name='phone' />{customer.phone}</>
                    ) : (
                      <span style={{ color: '#999' }}>No phone</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {customer.address ? (
                      <>
                        <Icon name='map marker alternate' />
                        {customer.address.city}, {customer.address.state}
                      </>
                    ) : (
                      <span style={{ color: '#999' }}>No address</span>
                    )}
                  </Table.Cell>
                  <Table.Cell textAlign='center'>
                    <Button.Group size='small'>
                      <Button
                        icon='edit'
                        color='blue'
                        title='Edit Customer'
                        onClick={() => handleOpenModal(customer)}
                      />
                      <Button
                        icon='trash'
                        color='red'
                        title='Delete Customer'
                        onClick={() => setDeleteModal({ open: true, customer })}
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

      {/* Customer Form Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        size='small'
      >
        <Modal.Header>
          <Icon name={editingCustomer ? 'edit' : 'plus'} />
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        </Modal.Header>
        
        <Modal.Content>
          <Form onSubmit={handleSubmit}>
            <Grid columns={2} stackable>
              <Grid.Column>
                <Form.Field required error={!!formErrors.name}>
                  <label>Name</label>
                  <Input
                    placeholder='Customer name'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && <div style={{ color: 'red', fontSize: '0.9em' }}>{formErrors.name}</div>}
                </Form.Field>
                
                <Form.Field required error={!!formErrors.email}>
                  <label>Email</label>
                  <Input
                    type='email'
                    placeholder='customer@example.com'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {formErrors.email && <div style={{ color: 'red', fontSize: '0.9em' }}>{formErrors.email}</div>}
                </Form.Field>
              </Grid.Column>
              
              <Grid.Column>
                <Form.Field>
                  <label>Phone</label>
                  <Input
                    placeholder='Phone number'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Form.Field>
                
                <Form.Field>
                  <label>Country</label>
                  <Dropdown
                    selection
                    options={countryOptions}
                    value={formData.address.country}
                    onChange={(e, { value }) => 
                      setFormData({ 
                        ...formData, 
                        address: { ...formData.address, country: value as string }
                      })
                    }
                  />
                </Form.Field>
              </Grid.Column>
            </Grid>
            
            <Header as='h4'>Address (Optional)</Header>
            
            <Form.Field>
              <label>Street Address</label>
              <Input
                placeholder='Street address'
                value={formData.address.street}
                onChange={(e) => 
                  setFormData({ 
                    ...formData, 
                    address: { ...formData.address, street: e.target.value }
                  })
                }
              />
            </Form.Field>
            
            <Grid columns={3} stackable>
              <Grid.Column>
                <Form.Field>
                  <label>City</label>
                  <Input
                    placeholder='City'
                    value={formData.address.city}
                    onChange={(e) => 
                      setFormData({ 
                        ...formData, 
                        address: { ...formData.address, city: e.target.value }
                      })
                    }
                  />
                </Form.Field>
              </Grid.Column>
              
              <Grid.Column>
                <Form.Field>
                  <label>State/Province</label>
                  <Input
                    placeholder='State'
                    value={formData.address.state}
                    onChange={(e) => 
                      setFormData({ 
                        ...formData, 
                        address: { ...formData.address, state: e.target.value }
                      })
                    }
                  />
                </Form.Field>
              </Grid.Column>
              
              <Grid.Column>
                <Form.Field>
                  <label>ZIP/Postal Code</label>
                  <Input
                    placeholder='ZIP Code'
                    value={formData.address.zipCode}
                    onChange={(e) => 
                      setFormData({ 
                        ...formData, 
                        address: { ...formData.address, zipCode: e.target.value }
                      })
                    }
                  />
                </Form.Field>
              </Grid.Column>
            </Grid>
          </Form>
        </Modal.Content>
        
        <Modal.Actions>
          <Button onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            type='submit'
            color='teal'
            icon={editingCustomer ? 'save' : 'plus'}
            content={editingCustomer ? 'Update Customer' : 'Add Customer'}
            loading={submitting}
            disabled={submitting}
            onClick={handleSubmit}
          />
        </Modal.Actions>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal.open}
        size='small'
        onClose={() => setDeleteModal({ open: false, customer: null })}
      >
        <Modal.Header>
          <Icon name='trash' color='red' />
          Delete Customer
        </Modal.Header>
        <Modal.Content>
          <p>
            Are you sure you want to delete customer{' '}
            <strong>{deleteModal.customer?.name}</strong>?
            This action cannot be undone.
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={() => setDeleteModal({ open: false, customer: null })}
          >
            Cancel
          </Button>
          <Button
            color='red'
            icon='trash'
            content='Delete'
            onClick={handleDeleteCustomer}
          />
        </Modal.Actions>
      </Modal>
    </Container>
  );
};

export default Customers;
