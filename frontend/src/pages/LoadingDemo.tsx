import React, { useState } from 'react';
import {
  Container,
  Header,
  Segment,
  Grid,
  Button,
  Divider,
  Message
} from 'semantic-ui-react';
import {
  LoadingSpinner,
  InlineLoader,
  PageLoader,
  LoadingButton,
  CardPlaceholder,
  TablePlaceholder,
  FormPlaceholder,
  SpinnerOverlay
} from '../components';

const LoadingDemo: React.FC = () => {
  const [buttonLoading, setButtonLoading] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState(false);

  const handleButtonClick = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 2000);
  };

  const handleOverlayToggle = () => {
    setOverlayLoading(!overlayLoading);
  };

  return (
    <Container style={{ padding: '2rem 0' }}>
      <Header as='h1' textAlign='center' style={{ marginBottom: '2rem' }}>
        🎨 Semantic UI Loading Components Demo
      </Header>

      <Message info>
        <Message.Header>Loading Components Showcase</Message.Header>
        <p>This page demonstrates all available Semantic UI loading components for the Invoice Generator application.</p>
      </Message>

      <Divider />

      {/* Basic LoadingSpinner */}
      <Segment>
        <Header as='h2'>1. Basic Loading Spinner</Header>
        <Grid columns={2} stackable>
          <Grid.Column>
            <Header as='h4'>Inline Spinner</Header>
            <LoadingSpinner inline size='small' />
          </Grid.Column>
          <Grid.Column>
            <Header as='h4'>Full Overlay Spinner</Header>
            <LoadingSpinner text='Loading data...' style={{ minHeight: '150px' }} />
          </Grid.Column>
        </Grid>
      </Segment>

      <Divider />

      {/* InlineLoader */}
      <Segment>
        <Header as='h2'>2. Inline Loader</Header>
        <Grid columns={3} stackable>
          <Grid.Column>
            <Header as='h4'>Small</Header>
            <InlineLoader size='small' text='Loading...' />
          </Grid.Column>
          <Grid.Column>
            <Header as='h4'>Medium</Header>
            <InlineLoader size='medium' text='Processing...' />
          </Grid.Column>
          <Grid.Column>
            <Header as='h4'>Large</Header>
            <InlineLoader size='large' text='Please wait...' />
          </Grid.Column>
        </Grid>
      </Segment>

      <Divider />

      {/* PageLoader */}
      <Segment>
        <Header as='h2'>3. Page Loader</Header>
        <PageLoader text='Loading invoice data...' />
      </Segment>

      <Divider />

      {/* LoadingButton */}
      <Segment>
        <Header as='h2'>4. Loading Buttons</Header>
        <Grid columns={3} stackable>
          <Grid.Column>
            <LoadingButton
              color='teal'
              loading={buttonLoading}
              onClick={handleButtonClick}
              fluid
            >
              {buttonLoading ? 'Processing...' : 'Click to Load'}
            </LoadingButton>
          </Grid.Column>
          <Grid.Column>
            <LoadingButton color='blue' loading={true} fluid>
              Always Loading
            </LoadingButton>
          </Grid.Column>
          <Grid.Column>
            <LoadingButton color='green' loading={false} fluid>
              Normal Button
            </LoadingButton>
          </Grid.Column>
        </Grid>
      </Segment>

      <Divider />

      {/* SpinnerOverlay */}
      <Segment>
        <Header as='h2'>5. Spinner Overlay</Header>
        <Button 
          onClick={handleOverlayToggle} 
          color={overlayLoading ? 'red' : 'teal'}
          style={{ marginBottom: '1rem' }}
        >
          {overlayLoading ? 'Hide Overlay' : 'Show Overlay'}
        </Button>
        
        <SpinnerOverlay loading={overlayLoading} text='Processing invoice...' size='large'>
          <Segment style={{ minHeight: '200px', padding: '2rem' }}>
            <Header as='h3'>Sample Content</Header>
            <p>This is some sample content that would be covered by the loading overlay.</p>
            <p>The overlay appears on top with a semi-transparent background.</p>
            <Button color='blue'>Sample Button</Button>
          </Segment>
        </SpinnerOverlay>
      </Segment>

      <Divider />

      {/* Placeholders */}
      <Segment>
        <Header as='h2'>6. Content Placeholders</Header>
        
        <Header as='h3'>Card Placeholder</Header>
        <CardPlaceholder count={2} />
        
        <Divider />
        
        <Header as='h3'>Table Placeholder</Header>
        <TablePlaceholder 
          rows={3} 
          columns={4} 
          headers={['Invoice #', 'Customer', 'Amount', 'Status']}
        />
        
        <Divider />
        
        <Header as='h3'>Form Placeholder</Header>
        <FormPlaceholder fields={3} />
      </Segment>

      <Divider />

      {/* Usage Examples */}
      <Segment>
        <Header as='h2'>7. Usage Examples</Header>
        <Message>
          <Message.Header>How to use these components:</Message.Header>
          <Message.List>
            <Message.Item><strong>LoadingSpinner</strong>: Use for general loading states with overlay</Message.Item>
            <Message.Item><strong>InlineLoader</strong>: Use for small inline loading indicators</Message.Item>
            <Message.Item><strong>PageLoader</strong>: Use for full-page loading states</Message.Item>
            <Message.Item><strong>LoadingButton</strong>: Use for buttons with loading states</Message.Item>
            <Message.Item><strong>SpinnerOverlay</strong>: Use to add loading overlay to existing content</Message.Item>
            <Message.Item><strong>Placeholders</strong>: Use while content is loading to maintain layout</Message.Item>
          </Message.List>
        </Message>
      </Segment>

      <Message success>
        <Message.Header>✅ All components use Semantic UI design system</Message.Header>
        <p>These loading components maintain consistency with your application's design and provide excellent user experience.</p>
      </Message>
    </Container>
  );
};

export default LoadingDemo;