import React from 'react';
import { Loader, Placeholder, Card, Header, Segment, Button, Table } from 'semantic-ui-react';

// Simple inline loader
export const InlineLoader: React.FC<{ 
  size?: 'mini' | 'tiny' | 'small' | 'medium' | 'large';
  text?: string;
}> = ({ size = 'small', text }) => (
  <div style={{ textAlign: 'center', padding: '1rem' }}>
    <Loader active inline={text ? undefined : 'centered'} size={size} />
    {text && <div style={{ marginTop: '0.5rem' }}>{text}</div>}
  </div>
);

// Page loading overlay
export const PageLoader: React.FC<{ 
  text?: string;
  active?: boolean;
}> = ({ text = 'Loading...', active = true }) => (
  <Segment 
    style={{ 
      minHeight: '400px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <Loader active={active} inline='centered' size='large' />
      <Header as='h3' style={{ marginTop: '1rem', color: '#666' }}>
        {text}
      </Header>
    </div>
  </Segment>
);

// Button loading state
export const LoadingButton: React.FC<{
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  color?: any;
  size?: any;
  fluid?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  icon?: string;
}> = ({ loading = false, children, ...props }) => (
  <Button 
    {...props}
    loading={loading}
    disabled={loading || props.disabled}
  >
    {children}
  </Button>
);

// Card placeholder for loading cards
export const CardPlaceholder: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index} fluid>
        <Card.Content>
          <Placeholder>
            <Placeholder.Header image>
              <Placeholder.Line />
              <Placeholder.Line />
            </Placeholder.Header>
            <Placeholder.Paragraph>
              <Placeholder.Line length='medium' />
              <Placeholder.Line length='short' />
            </Placeholder.Paragraph>
          </Placeholder>
        </Card.Content>
      </Card>
    ))}
  </>
);

// Table placeholder
export const TablePlaceholder: React.FC<{ 
  rows?: number; 
  columns?: number;
  headers?: string[];
}> = ({ rows = 5, columns = 4, headers = [] }) => (
  <Table>
    {headers.length > 0 && (
      <Table.Header>
        <Table.Row>
          {headers.map((header, index) => (
            <Table.HeaderCell key={index}>{header}</Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
    )}
    <Table.Body>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Table.Row key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Table.Cell key={colIndex}>
              <Placeholder>
                <Placeholder.Line length='medium' />
              </Placeholder>
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
);

// Form placeholder
export const FormPlaceholder: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <Segment>
    <Placeholder>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} style={{ marginBottom: '1rem' }}>
          <Placeholder.Header>
            <Placeholder.Line length='very short' />
          </Placeholder.Header>
          <Placeholder.Paragraph>
            <Placeholder.Line length='full' />
          </Placeholder.Paragraph>
        </div>
      ))}
    </Placeholder>
  </Segment>
);

// Spinner overlay for existing content
export const SpinnerOverlay: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  text?: string;
  size?: 'mini' | 'tiny' | 'small' | 'medium' | 'large' | 'big' | 'huge' | 'massive';
}> = ({ loading, children, text = 'Loading...', size = 'medium' }) => (
  <div style={{ position: 'relative' }}>
    {children}
    {loading && (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader active inline='centered' size={size} />
          <div style={{ marginTop: '0.5rem', fontSize: '0.9em', color: '#666' }}>
            {text}
          </div>
        </div>
      </div>
    )}
  </div>
);