import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Register.css';
import ParticleBackground from '../components/ParticleBackground';

const { Title } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();


  const onFinish = (values) => {
    setLoading(true);
  
    axios
      .post('http://localhost:3000/auth/register', values)
      .then((response) => {
        if (response.status === 201) {
          toast.success('Registration successful! Please login.');
          navigate('/login');
        } else {
          toast.error('Registration failed.');
        }
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || 'An error occurred during registration. Please try again.';
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  

  return (
    <div className="register-page">
       <ParticleBackground/>
      <div className="register-container">
        <Title level={2} className="register-title">VTM Register</Title>
        <Form 
          form={form}
          layout="vertical" 
          onFinish={onFinish}
          className="register-form"
        >
          <div className="name-row">
            <Form.Item 
              label="First Name" 
              name="firstname" 
              rules={[{ required: true, message: 'Please enter your first name' },
                { min: 3, message: 'First name must be at least 3 characters long' }
              ]}
              className="name-input"
            >
              <Input placeholder="First Name" autoComplete="new-password" />
            </Form.Item>

            <Form.Item 
              label="Last Name" 
              name="lastname" 
              rules={[{ required: true, message: 'Please enter your last name' }]}
              className="name-input"
            >
              <Input placeholder="Last Name" autoComplete="new-password" />
            </Form.Item>
          </div>

          <Form.Item 
            label="Username" 
            name="username" 
            rules={[{ required: true, message: 'Please enter your username' },
              { min: 3, message: 'Username must be at least 3 characters long' }
            ]}
          >
            <Input placeholder="Username" autoComplete="new-password" />
          </Form.Item>

          <Form.Item 
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' }, 
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Email" autoComplete="new-password" />
          </Form.Item>

          <Form.Item 
            label="Password" 
            name="password" 
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters long' }, 
            ]}
          >
            <Input.Password placeholder="Password" autoComplete="new-password" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              className="register-button"
            >
              Register
            </Button>
          </Form.Item>
        </Form>

        <div className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Register;