import React, { useState, useEffect } from 'react';
import {
  Container,
  Header,
  Segment,
  Form,
  Button,
  Icon,
  Grid,
  Divider,
  Input,
  TextArea,
  Card,
  Label,
  Message,
  Tab,
  Table,
  Modal,
  Checkbox
} from 'semantic-ui-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

interface UserProfile {
  name: string;
  email: string;
  company: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface InvoiceSettings {
  defaultTaxRate: number;
  defaultPaymentTerms: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  notes: string;
  logoUrl: string;
}

const Settings: React.FC = () => {
  const { state: authState } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: authState.user?.name || '',
    email: authState.user?.email || '',
    company: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    }
  });
  
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    defaultTaxRate: 0,
    defaultPaymentTerms: 30,
    invoicePrefix: 'INV',
    nextInvoiceNumber: 1,
    notes: 'Thank you for your business!',
    logoUrl: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notifications, setNotifications] = useState({
    emailInvoices: true,
    emailPayments: true,
    emailReminders: true,
    pushNotifications: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // This would typically fetch from multiple endpoints
      // For now, we'll use default values
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // await apiService.put('/user/profile', profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // await apiService.put('/settings/invoice', invoiceSettings);
      toast.success('Invoice settings updated successfully');
    } catch (error) {
      toast.error('Failed to update invoice settings');
      console.error('Error updating invoice settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      // await apiService.put('/user/password', {
      //   currentPassword: passwordForm.currentPassword,
      //   newPassword: passwordForm.newPassword
      // });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password');
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      // await apiService.put('/settings/notifications', notifications);
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update notification preferences');
      console.error('Error updating notifications:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // await apiService.delete('/user/account');
      toast.success('Account deleted successfully');
      setDeleteModal(false);
      // Redirect to login or home page
    } catch (error) {
      toast.error('Failed to delete account');
      console.error('Error deleting account:', error);
    }
  };

  const panes = [
    {
      menuItem: { key: 'profile', icon: 'user', content: 'Profile' },
      render: () => (
        <Tab.Pane>
          <Header as='h3'>
            <Icon name='user' />
            Profile Information
          </Header>
          <Form onSubmit={handleProfileUpdate}>
            <Grid columns={2} stackable>
              <Grid.Column>
                <Form.Field required>
                  <label>Full Name</label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </Form.Field>
                
                <Form.Field required>
                  <label>Email Address</label>
                  <Input
                    type='email'
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </Form.Field>
              </Grid.Column>
              
              <Grid.Column>
                <Form.Field>
                  <label>Company</label>
                  <Input
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  />
                </Form.Field>
                
                <Form.Field>
                  <label>Phone</label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </Form.Field>
              </Grid.Column>
            </Grid>
            
            <Divider />
            
            <Header as='h4'>Business Address</Header>
            <Form.Field>
              <label>Street Address</label>
              <Input
                value={profile.address.street}
                onChange={(e) => setProfile({ 
                  ...profile, 
                  address: { ...profile.address, street: e.target.value }
                })}
              />
            </Form.Field>
            
            <Grid columns={3} stackable>
              <Grid.Column>
                <Form.Field>
                  <label>City</label>
                  <Input
                    value={profile.address.city}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      address: { ...profile.address, city: e.target.value }
                    })}
                  />
                </Form.Field>
              </Grid.Column>
              
              <Grid.Column>
                <Form.Field>
                  <label>State</label>
                  <Input
                    value={profile.address.state}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      address: { ...profile.address, state: e.target.value }
                    })}
                  />
                </Form.Field>
              </Grid.Column>
              
              <Grid.Column>
                <Form.Field>
                  <label>ZIP Code</label>
                  <Input
                    value={profile.address.zipCode}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      address: { ...profile.address, zipCode: e.target.value }
                    })}
                  />
                </Form.Field>
              </Grid.Column>
            </Grid>
            
            <Button type='submit' color='teal' loading={loading}>
              <Icon name='save' />Update Profile
            </Button>
          </Form>
        </Tab.Pane>
      )
    },
    {
      menuItem: { key: 'invoice', icon: 'file invoice', content: 'Invoice Settings' },
      render: () => (
        <Tab.Pane>
          <Header as='h3'>
            <Icon name='file alternate outline' />
            Invoice Configuration
          </Header>
          <Form onSubmit={handleInvoiceSettingsUpdate}>
            <Grid columns={2} stackable>
              <Grid.Column>
                <Form.Field>
                  <label>Default Tax Rate (%)</label>
                  <Input
                    type='number'
                    step='0.01'
                    min='0'
                    max='100'
                    value={invoiceSettings.defaultTaxRate}
                    onChange={(e) => setInvoiceSettings({ 
                      ...invoiceSettings, 
                      defaultTaxRate: parseFloat(e.target.value) || 0 
                    })}
                  />
                </Form.Field>
                
                <Form.Field>
                  <label>Default Payment Terms (Days)</label>
                  <Input
                    type='number'
                    min='1'
                    value={invoiceSettings.defaultPaymentTerms}
                    onChange={(e) => setInvoiceSettings({ 
                      ...invoiceSettings, 
                      defaultPaymentTerms: parseInt(e.target.value) || 30 
                    })}
                  />
                </Form.Field>
              </Grid.Column>
              
              <Grid.Column>
                <Form.Field>
                  <label>Invoice Prefix</label>
                  <Input
                    value={invoiceSettings.invoicePrefix}
                    onChange={(e) => setInvoiceSettings({ 
                      ...invoiceSettings, 
                      invoicePrefix: e.target.value 
                    })}
                  />
                </Form.Field>
                
                <Form.Field>
                  <label>Next Invoice Number</label>
                  <Input
                    type='number'
                    min='1'
                    value={invoiceSettings.nextInvoiceNumber}
                    onChange={(e) => setInvoiceSettings({ 
                      ...invoiceSettings, 
                      nextInvoiceNumber: parseInt(e.target.value) || 1 
                    })}
                  />
                </Form.Field>
              </Grid.Column>
            </Grid>
            
            <Form.Field>
              <label>Default Invoice Notes</label>
              <TextArea
                rows={3}
                value={invoiceSettings.notes}
                onChange={(e) => setInvoiceSettings({ 
                  ...invoiceSettings, 
                  notes: e.target.value 
                })}
              />
            </Form.Field>
            
            <Button type='submit' color='teal' loading={loading}>
              <Icon name='save' />Update Invoice Settings
            </Button>
          </Form>
        </Tab.Pane>
      )
    },
    {
      menuItem: { key: 'security', icon: 'lock', content: 'Security' },
      render: () => (
        <Tab.Pane>
          <Header as='h3'>
            <Icon name='lock' />
            Change Password
          </Header>
          <Form onSubmit={handlePasswordChange}>
            <Form.Field required>
              <label>Current Password</label>
              <Input
                type='password'
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ 
                  ...passwordForm, 
                  currentPassword: e.target.value 
                })}
              />
            </Form.Field>
            
            <Form.Field required>
              <label>New Password</label>
              <Input
                type='password'
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ 
                  ...passwordForm, 
                  newPassword: e.target.value 
                })}
              />
            </Form.Field>
            
            <Form.Field required>
              <label>Confirm New Password</label>
              <Input
                type='password'
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ 
                  ...passwordForm, 
                  confirmPassword: e.target.value 
                })}
              />
            </Form.Field>
            
            <Button type='submit' color='blue' loading={loading}>
              <Icon name='key' />Change Password
            </Button>
          </Form>
          
          <Divider />
          
          <Header as='h4' color='red'>
            <Icon name='warning sign' />
            Danger Zone
          </Header>
          
          <Segment color='red'>
            <Header as='h5'>Delete Account</Header>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <Button 
              color='red' 
              icon='trash'
              content='Delete Account'
              onClick={() => setDeleteModal(true)}
            />
          </Segment>
        </Tab.Pane>
      )
    },
    {
      menuItem: { key: 'notifications', icon: 'bell', content: 'Notifications' },
      render: () => (
        <Tab.Pane>
          <Header as='h3'>
            <Icon name='bell' />
            Notification Preferences
          </Header>
          
          <Segment>
            <Header as='h4'>Email Notifications</Header>
            <Form>
              <Form.Field>
                <Checkbox
                  toggle
                  label='Invoice sent notifications'
                  checked={notifications.emailInvoices}
                  onChange={(e, { checked }) => setNotifications({ 
                    ...notifications, 
                    emailInvoices: checked || false 
                  })}
                />
              </Form.Field>
              
              <Form.Field>
                <Checkbox
                  toggle
                  label='Payment received notifications'
                  checked={notifications.emailPayments}
                  onChange={(e, { checked }) => setNotifications({ 
                    ...notifications, 
                    emailPayments: checked || false 
                  })}
                />
              </Form.Field>
              
              <Form.Field>
                <Checkbox
                  toggle
                  label='Payment reminder notifications'
                  checked={notifications.emailReminders}
                  onChange={(e, { checked }) => setNotifications({ 
                    ...notifications, 
                    emailReminders: checked || false 
                  })}
                />
              </Form.Field>
              
              <Form.Field>
                <Checkbox
                  toggle
                  label='Browser push notifications'
                  checked={notifications.pushNotifications}
                  onChange={(e, { checked }) => setNotifications({ 
                    ...notifications, 
                    pushNotifications: checked || false 
                  })}
                />
              </Form.Field>
            </Form>
            
            <Button 
              color='teal' 
              onClick={handleNotificationUpdate}
              style={{ marginTop: '1rem' }}
            >
              <Icon name='save' />Save Preferences
            </Button>
          </Segment>
        </Tab.Pane>
      )
    },
    {
      menuItem: { key: 'subscription', icon: 'credit card', content: 'Subscription' },
      render: () => (
        <Tab.Pane>
          <Header as='h3'>
            <Icon name='credit card' />
            Subscription & Billing
          </Header>
          
          <Card fluid>
            <Card.Content>
              <Card.Header>
                <Icon name='gem' color='teal' />Free Plan
              </Card.Header>
              <Card.Meta>Current Plan</Card.Meta>
              <Card.Description>
                <div style={{ marginBottom: '1rem' }}>
                  <Label size='large' color='green'>
                    <Icon name='check' />5 Invoices Remaining
                  </Label>
                </div>
                
                <Table basic='very' compact>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell><Icon name='check' color='green' />Up to 5 invoices per month</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell><Icon name='check' color='green' />Basic customer management</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell><Icon name='check' color='green' />PDF invoice generation</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell><Icon name='x' color='red' />Advanced reporting</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell><Icon name='x' color='red' />Custom branding</Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </Card.Description>
            </Card.Content>
            
            <Card.Content extra>
              <Button color='teal' size='large' fluid>
                <Icon name='arrow up' />Upgrade to Pro - $19/month
              </Button>
            </Card.Content>
          </Card>
          
          <Message info>
            <Message.Header>Need more invoices?</Message.Header>
            <p>Upgrade to our Pro plan for unlimited invoices, advanced features, and priority support.</p>
          </Message>
        </Tab.Pane>
      )
    }
  ];

  return (
    <Container>
      <Header as='h1' style={{ marginBottom: '2rem' }}>
        <Icon name='settings' />
        Settings
        <Header.Subheader>
          Manage your account and application preferences
        </Header.Subheader>
      </Header>

      <Tab 
        panes={panes} 
        activeIndex={activeTab}
        onTabChange={(e, { activeIndex }) => setActiveTab(activeIndex as number)}
        menu={{ secondary: true, pointing: true }}
      />

      {/* Delete Account Confirmation Modal */}
      <Modal
        open={deleteModal}
        size='small'
        onClose={() => setDeleteModal(false)}
      >
        <Modal.Header>
          <Icon name='warning sign' color='red' />
          Delete Account
        </Modal.Header>
        <Modal.Content>
          <Message warning>
            <Message.Header>This action cannot be undone!</Message.Header>
            <p>Deleting your account will permanently remove all your data, including:</p>
            <ul>
              <li>All invoices and customer records</li>
              <li>Account settings and preferences</li>
              <li>Billing and subscription history</li>
            </ul>
          </Message>
          <p>Are you absolutely sure you want to delete your account?</p>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={() => setDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            color='red'
            icon='trash'
            content='Delete Account'
            onClick={handleDeleteAccount}
          />
        </Modal.Actions>
      </Modal>
    </Container>
  );
};

export default Settings;
