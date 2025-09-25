import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Header, 
  Grid, 
  Card, 
  Statistic, 
  Segment, 
  Button, 
  List, 
  Label,
  Icon,
  Loader,
  Message
} from 'semantic-ui-react';
import { useAuth } from '../context/AuthContext';
import { InvoiceSummary, Invoice } from '../types';
import apiService from '../services/api';
import { formatCurrency } from '../utils';

const Dashboard: React.FC = () => {
  const { state } = useAuth();
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const invoicesData = await apiService.getInvoices({ limit: 5 });
        setSummary(invoicesData.summary);
        setRecentInvoices(invoicesData.invoices);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  if (loading) {
    return (
      <Segment style={{ minHeight: '400px' }}>
        <Loader active>Loading Dashboard...</Loader>
      </Segment>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'green';
      case 'sent': return 'blue';
      case 'overdue': return 'red';
      case 'draft': return 'grey';
      default: return 'grey';
    }
  };

  return (
    <div>
      {/* Header */}
      <Grid>
        <Grid.Row>
          <Grid.Column width={12}>
            <Header as="h1" icon>
              <Icon name="home" />
              Welcome back, {state.user?.name}!
              <Header.Subheader>
                Here's an overview of your invoice activity
              </Header.Subheader>
            </Header>
          </Grid.Column>
          <Grid.Column width={4} textAlign="right">
            <Button as={Link} to="/invoices/create" primary>
              <Icon name="plus" /> New Invoice
            </Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>

      {/* Stats */}
      {summary && (
        <Card.Group itemsPerRow={4} stackable>
          <Card>
            <Card.Content>
              <Statistic>
                <Statistic.Value>{summary.total}</Statistic.Value>
                <Statistic.Label>Total Invoices</Statistic.Label>
              </Statistic>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content>
              <Statistic>
                <Statistic.Value>{formatCurrency(summary.totalRevenue)}</Statistic.Value>
                <Statistic.Label>Total Revenue</Statistic.Label>
              </Statistic>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content>
              <Statistic>
                <Statistic.Value>{formatCurrency(summary.paidRevenue)}</Statistic.Value>
                <Statistic.Label>Paid Revenue</Statistic.Label>
              </Statistic>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content>
              <Statistic>
                <Statistic.Value>{summary.draft}</Statistic.Value>
                <Statistic.Label>Draft Invoices</Statistic.Label>
              </Statistic>
            </Card.Content>
          </Card>
        </Card.Group>
      )}

      {/* Recent Invoices */}
      <Segment>
        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              <Header as="h3">Recent Invoices</Header>
            </Grid.Column>
            <Grid.Column width={4} textAlign="right">
              <Button as={Link} to="/invoices" basic>
                View All
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        {recentInvoices.length > 0 ? (
          <List divided relaxed>
            {recentInvoices.map((invoice) => (
              <List.Item key={invoice._id} as={Link} to={`/invoices/${invoice._id}`}>
                <List.Content>
                  <Grid>
                    <Grid.Column width={8}>
                      <List.Header>
                        <Icon name="file text outline" />
                        {invoice.invoiceNumber}
                      </List.Header>
                      <List.Description>
                        {typeof invoice.customerId === 'object' 
                          ? invoice.customerId.name 
                          : 'Customer'}
                      </List.Description>
                    </Grid.Column>
                    <Grid.Column width={4} textAlign="right">
                      <div style={{ fontWeight: 'bold' }}>
                        {formatCurrency(invoice.total, invoice.currency)}
                      </div>
                      <div style={{ fontSize: '0.9em', color: '#666' }}>
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </Grid.Column>
                    <Grid.Column width={4} textAlign="right">
                      <Label color={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Label>
                    </Grid.Column>
                  </Grid>
                </List.Content>
              </List.Item>
            ))}
          </List>
        ) : (
          <Segment placeholder>
            <Header icon>
              <Icon name="file text outline" />
              No invoices yet
            </Header>
            <Button as={Link} to="/invoices/create" primary>
              Create Your First Invoice
            </Button>
          </Segment>
        )}
      </Segment>

      {/* Plan limitation notice */}
      {state.user?.plan === 'free' && state.user.invoiceCount >= 3 && (
        <Message warning>
          <Message.Header>Invoice Limit Notice</Message.Header>
          <p>
            You've used {state.user.invoiceCount} of {state.user.maxInvoices} free invoices.
            {state.user.invoiceCount >= state.user.maxInvoices ? (
              <> Upgrade to Pro for unlimited invoices.</>
            ) : (
              <> Consider upgrading to Pro for unlimited invoices.</>
            )}
          </p>
          <Button as={Link} to="/settings" color="orange" size="small">
            Upgrade Now
          </Button>
        </Message>
      )}
    </div>
  );
};

export default Dashboard;