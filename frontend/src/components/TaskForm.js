import React, { useState } from 'react';
import { Form, Input, Button, Alert, Card, Row, Col } from 'antd';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import "./TaskForm.css";
import ParticleBackground from './ParticleBackground';

const TaskForm = ({ onTaskCreated, assignedUser = null }) => {
  const [form] = Form.useForm();
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('');

  const handleSubmit = (values) => {
    const { title, description, deadline } = values;
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');  // User's own ID (UUID)
  
    if (!token) {
      toast.error('Error: Please log in.', { autoClose: 2000 });
      return;
    }
  
    if (!userId) {
      toast.error('Error: User not found.', { autoClose: 2000 });
      return;
    }
  
    // Prepare payload
    const payload = {
      title,
      description,
      assignedUserId: assignedUser ? assignedUser : null,
      userId,  // Assigned user (only for admin)
    };
  
    // Only add deadline if it's an assigned task
    if (assignedUser) {
      if (!deadline) {
        toast.error('Error: Assigned tasks must have a deadline.', { autoClose: 2000 });
        return;
      }
      payload.deadline = deadline.toISOString();  // Convert to ISO format
    }
  
    axios.post('http://localhost:3000/task', payload, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        const { task, assignedUserId } = response.data;
  
        // Only add task to local list if it belongs to the current user
        if (!assignedUserId || assignedUserId === userId) {
          onTaskCreated(task);
        }
  
        toast.success('Task Created Successfully!', { autoClose: 2000 });
        form.resetFields();
      })
      .catch((error) => {
        console.error('🚨 Error creating task:', error);
        toast.error('Error: Could not create the task.', { autoClose: 2000 });
      });
  };
  

  return (
    <>
    <ParticleBackground/>
    <Card
  title={<span style={{ color: 'white' }}>Add a Task ✅</span>}
  bordered={true}
  style={{
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    color: 'white',
    padding: '16px',
    background: 'linear-gradient(135deg, #1a2a4a, #293b5f)',
    border: '3px solid #007bff', // Default border color
    animation: 'borderPulse 2s infinite alternate', // Apply animation
  }}
>

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
        label={<span style={{ color: '#f0f0f0' }}>Title</span>} 
        rules={[{ required: true, message: 'Please enter a title!' }]}
      >
        <Input 
          placeholder="Title" 
          className="custom-dark-input"
        />
      </Form.Item>
    </Col>

    <Col xs={24} sm={24} md={10}>
      <Form.Item 
        name="description" 
        label={<span style={{ color: '#f0f0f0' }}>Description</span>} 
        rules={[{ required: true, message: 'Please enter a description!' }]}
      >
        <Input 
          placeholder="Description" 
          className="custom-dark-input"
        />
      </Form.Item>
    </Col>

    <Col xs={24} sm={24} md={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      <Form.Item style={{ marginBottom: 0 }}>
        <Button 
          type="primary" 
          htmlType="submit" 
          style={{ 
            backgroundColor: '#007bff', 
            borderColor: '#007bff', 
            padding: '0 20px', 
            fontSize: '14px',  
            height: '38px',
            borderRadius: '6px', 
          }}
        >
          Add Task
        </Button>
      </Form.Item>
    </Col>
  </Row>
</Form>


      <ToastContainer /> 
    </Card>
    </>
  );
  
}  

export default TaskForm;