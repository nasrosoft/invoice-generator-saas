import React from 'react';
import { Loader, Dimmer, Segment } from 'semantic-ui-react';

interface LoadingSpinnerProps {
  size?: 'mini' | 'tiny' | 'small' | 'medium' | 'large' | 'big' | 'huge' | 'massive';
  text?: string;
  inline?: boolean;
  inverted?: boolean;
  active?: boolean;
  style?: React.CSSProperties;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  text = 'Loading...',
  inline = false,
  inverted = false,
  active = true,
  style = {}
}) => {
  if (inline) {
    // Inline loader for buttons, small spaces
    return (
      <Loader 
        active={active} 
        inline 
        size={size} 
        inverted={inverted}
        style={style}
      />
    );
  }

  // Full loader with dimmer for overlays
  return (
    <Segment style={{ minHeight: '200px', ...style }}>
      <Dimmer active={active} inverted={inverted}>
        <Loader size={size}>{text}</Loader>
      </Dimmer>
    </Segment>
  );
};

export default LoadingSpinner;
