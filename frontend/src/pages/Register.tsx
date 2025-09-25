import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, Grid, Header, Message, Segment, Icon, Divider, Container } from 'semantic-ui-react';
import { useAuth } from '../context/AuthContext';
import { RegisterForm as RegisterFormType } from '../types';
import { validateEmail, validatePassword, validateRequired } from '../utils';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormType>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterFormType>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, state } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormType> = {};

    const nameError = validateRequired(formData.name, 'Name');
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await register(formData);
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
    if (errors[name as keyof RegisterFormType]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <Container style={{ marginTop: '3em' }}>
      <Grid textAlign='center' style={{ height: '80vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as='h2' color='teal' textAlign='center'>
            <Icon name='file alternate outline' />
            Create your account
          </Header>
          <Form size='large' onSubmit={handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                icon='user'
                iconPosition='left'
                placeholder='Full name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                error={errors.name ? { content: errors.name, pointing: 'below' } : false}
              />
              <Form.Input
                fluid
                icon='mail'
                iconPosition='left'
                placeholder='E-mail address'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                error={errors.email ? { content: errors.email, pointing: 'below' } : false}
              />
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                placeholder='Password'
                type='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                error={errors.password ? { content: errors.password, pointing: 'below' } : false}
              />
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                placeholder='Confirm Password'
                type='password'
                name='confirmPassword'
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                error={errors.confirmPassword ? { content: errors.confirmPassword, pointing: 'below' } : false}
              />

              <Button 
                color='teal' 
                fluid 
                size='large' 
                loading={isSubmitting}
                disabled={isSubmitting}
                type='submit'
              >
                Create Account
              </Button>
            </Segment>
          </Form>
          
          {state.error && (
            <Message error visible>
              <Message.Header>Registration Failed</Message.Header>
              <p>{state.error}</p>
            </Message>
          )}
          
          <Message>
            Already have an account? <Link to='/login'>Sign In</Link>
          </Message>
          
          <Message info>
            <Message.Header>Free Trial</Message.Header>
            <p>Start with 5 free invoices, upgrade anytime!</p>
          </Message>
        </Grid.Column>
      </Grid>
    </Container>
  );
};

export default Register;