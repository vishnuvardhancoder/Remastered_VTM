import React, { useEffect, useState, useContext } from 'react';
import { Button, message, Typography, Row, Col, Card, Spin, Avatar, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { TaskContext } from './TaskContext'; // Context for managing tasks

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const { tasks, setTasks } = useContext(TaskContext); // Access tasks and setTasks from context
  const [loading, setLoading] = useState(true); // Manage loading state for tasks
  const [username, setUsername] = useState('');

  // Check for token and user ID in localStorage, redirect if not authenticated
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername || 'Guest'); // Use the stored username or default to 'Guest'
    
    if (!accessToken || !userId) {
      // Redirect to login if token or user ID is missing
      message.warning('Please log in to access the dashboard.');
      navigate('/login');
    } else {
      // Fetch tasks if authenticated
      fetchTasks(accessToken);
    }
  }, [navigate]);

  // Fetch tasks from the backend API
  const fetchTasks = (token) => {
    // Perform the fetch request to get tasks
    fetch('http://localhost:3000/api/tasks', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      })
      .then((data) => {
        setTasks(data.tasks || []);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
        message.error(`Failed to load tasks: ${error.message}`);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        navigate('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  

  // Logout handler
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    setTasks([]);
    message.success('Logged out successfully.');
    navigate('/login');
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <Row justify="center" align="middle" style={{ minHeight: '80vh' }}>
        <Col span={24} sm={16} md={12} lg={8}>
          <Card
            bordered={false}
            style={{
              background: '#fff',
              padding: '40px',
              borderRadius: '10px',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Title level={2} style={{ textAlign: 'center', color: '#333' }}>
              Welcome to the Dashboard!
            </Title>

            {/* Profile Section */}
            <div className="profile-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <div className="profile-avatar" style={{ 
                width: '40px', height: '40px', 
                borderRadius: '50%', 
                backgroundColor: '#007bff', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '18px', 
                marginRight: '10px' 
              }}>
                <span>{username ? username.charAt(0).toUpperCase() : ''}</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '500' }}>{username}</span>
            </div>

            <Text style={{ display: 'block', textAlign: 'center', color: '#888', marginBottom: '20px' }}>
              {loading ? (
                <Spin tip="Loading tasks..." />
              ) : tasks.length > 0 ? (
                `You have ${tasks.length} task(s). Manage them below.`
              ) : (
                'You have no tasks yet. Start adding some!'
              )}
            </Text>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Button
                type="primary"
                size="large"
                danger
                onClick={logout}
                style={{
                  borderRadius: '5px',
                  padding: '10px 20px',
                  fontSize: '16px',
                }}
              >
                Logout
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Top Right Section (Username & Avatar) */}
      <Row style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center' }}>
        <Tooltip title={username}>
          <Avatar style={{ backgroundColor: '#87d068', marginRight: '10px' }}>
            {username.charAt(0)?.toUpperCase()}
          </Avatar>
        </Tooltip>
        <span style={{ fontSize: '16px', color: '#333' }}>{username}</span>
      </Row>
    </div>
  );
};

export default Dashboard;
