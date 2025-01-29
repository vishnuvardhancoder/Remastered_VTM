import React, { useState } from 'react';
import { Form, Input, Button, Alert, Card, Row, Col } from 'antd';
import axios from 'axios';

const TaskForm = ({ onTaskCreated }) => {
  const [form] = Form.useForm();
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('');

  const handleSubmit = (values) => {
    const { title, description } = values;
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');  // Get userId from localStorage
  
    if (!token) {
      setAlertMessage('Error: Please log in.');
      setAlertType('error');
      setTimeout(() => setAlertMessage(null), 2000);
      return;
    }
  
    if (!userId) {
      setAlertMessage('Error: User not found.');
      setAlertType('error');
      setTimeout(() => setAlertMessage(null), 2000);
      // console.log('User ID is not in localStorage');
      return;
    }
  
    // Send task data along with userId
    axios.post('http://localhost:3000/task', 
      { 
        title, 
        description, 
        userId  // Pass userId along with title and description
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,  // Send token as Authorization header
        }
      })
      .then(response => {
        onTaskCreated(response.data);  // Callback to update the task list
        setAlertMessage('Task Created: The task was added successfully!');
        setAlertType('success');
        form.resetFields();
        setTimeout(() => setAlertMessage(null), 2000);
      })
      .catch((error) => {
        console.error('Error creating task:', error);
        setAlertMessage('Error: Could not create the task.');
        setAlertType('error');
        setTimeout(() => setAlertMessage(null), 2000);
      });
  }
  
  

  return (
    <Card title="Add New Task" bordered={false} style={{ marginBottom: '20px' }}>
      {alertMessage && (
        <Alert message={alertMessage} type={alertType} showIcon style={{ marginBottom: '20px' }} />
      )}
      <Form 
        form={form} 
        onFinish={handleSubmit} 
        layout="vertical" 
        style={{ width: '100%' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={8}>
            <Form.Item 
              name="title" 
              label="Title" 
              rules={[{ required: true, message: 'Please enter a title!' }]}
            >
              <Input placeholder="Title" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={10}>
            <Form.Item 
              name="description" 
              label="Description" 
              rules={[{ required: true, message: 'Please enter a description!' }]}
            >
              <Input placeholder="Description" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                style={{ 
                  padding: '0 20px', 
                  fontSize: '14px',  
                  height: '38px'     
                }}
              >
                Add Task
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default TaskForm;
