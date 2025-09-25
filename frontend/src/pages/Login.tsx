import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react';
import { useAuth } from '../context/AuthContext';
import { LoginForm as LoginFormType } from '../types';
import { validateEmail, validatePassword } from '../utils';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormType>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormType>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, state } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormType> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context and API service
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormType]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="login-container">
      <Grid textAlign="center" style={{ height: '100vh' }} verticalAlign="middle">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" color="blue" textAlign="center">
            <Image src="/logo192.png" /> InvoiceGen
          </Header>
          <Form size="large" onSubmit={handleSubmit} loading={isSubmitting}>
            <Segment stacked>
              <Form.Input
                fluid
                icon="user"
                iconPosition="left"
                placeholder="E-mail address"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e, { value }) => handleChange({ target: { name: 'email', value } } as any)}
                error={errors.email ? { content: errors.email, pointing: 'below' } : false}
              />
              <Form.Input
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={(e, { value }) => handleChange({ target: { name: 'password', value } } as any)}
                error={errors.password ? { content: errors.password, pointing: 'below' } : false}
              />

              <Button color="blue" fluid size="large" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </Segment>
          </Form>
          
          {state.error && (
            <Message error>
              <Message.Header>Login Failed</Message.Header>
              <p>{state.error}</p>
            </Message>
          )}
          
          <Message>
            New to us? <Link to="/register">Sign Up</Link>
          </Message>
          
          <Message info>
            <Message.Header>Demo Credentials</Message.Header>
            <p>Email: john.doe@example.com<br/>Password: password123</p>
          </Message>
        </Grid.Column>
      </Grid>
    </div>
  );
};

export default Login;