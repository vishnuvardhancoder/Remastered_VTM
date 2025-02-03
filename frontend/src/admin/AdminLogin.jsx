import React, { useState } from 'react';
import { Form, Input, Button, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import styles for the toasts

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/auth/admin-login', {
        email: values.username,
        password: values.password,
      });

      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('role', 'admin');
      localStorage.setItem('username', values.username);

      toast.success('Admin logged in successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      setLoading(false);

      if (error.response) {
        toast.error(error.response.data.error || 'Invalid email or password');
      } else if (error.request) {
        toast.error('No response from the server. Please try again.');
      } else {
        toast.error('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <Row justify="center" align="middle" style={styles.row}>
        <Col xs={24} sm={18} md={12} lg={8} xl={6}>
          <div style={styles.card}>
            <h2 style={styles.heading}>Admin Login</h2>
            <Form
              onFinish={handleLogin}
              layout="vertical"
              initialValues={{ username: '', password: '' }} // Ensure the form is empty on load
            >
              <Form.Item
                label="Email"
                name="username"
                rules={[{ required: true, message: 'Please enter your email!' }]}
              >
                <Input
                  size="large"
                  placeholder="Enter your email"
                  style={styles.input}
                  autoComplete="new-password" // Prevent autofill
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please enter your password!' }]}
              >
                <Input.Password
                  size="large"
                  placeholder="Enter your password"
                  style={styles.input}
                  autoComplete="new-password" // Prevent autofill
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  style={styles.submitButton}
                >
                  Log In
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
      <ToastContainer />
    </div>
  );
};

// Styles for a better UI
const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #6f42c1, #4e73df)', // Cool gradient background
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    width: '100%',
    padding: '0 20px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    minWidth: '300px',
    maxWidth: '500px',
    border: '2px solid #4e73df', // Vibrant border color
  },
  heading: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#4e73df', // Cool blue heading color
  },
  input: {
    width: '100%',
    borderRadius: '8px',
    height: '45px',
    marginBottom: '15px',
    fontSize: '16px',
  },
  submitButton: {
    backgroundColor: '#4e73df',
    borderColor: '#4e73df',
    fontSize: '16px',
    height: '45px',
    borderRadius: '8px',
    fontWeight: '600',
    marginTop: '10px',
  },
};

export default AdminLogin;
