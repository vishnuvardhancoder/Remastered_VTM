import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, message, Tag, Input, Col, DatePicker,Card,Row,Typography } from 'antd';
import axios from 'axios';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminDashboard.css';
import ParticleBackground from '../components/ParticleBackground';

const { Title } = Typography;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('');

  useEffect(() => {
    fetchUsersWithTasks();
    fetchTasks();
  }, []);

  
  
  // Fetch all users with their tasks
  const fetchUsersWithTasks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/auth/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setUsers(response.data);
      setFilteredUsers(response.data); // Set initial filtered users to all users
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to fetch users');
    }
  };

  // Fetch all tasks (already assigned tasks)
  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/auth/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
  
      // Extract tasks from the response
      const allTasks = response.data.flatMap(user => 
        user.tasks.map(task => ({
          taskId: task.taskId,
          title: task.title,
          description: task.description,
          status: task.status,
          username: user.username,
        }))
      );
  
      setTasks(allTasks);
      setFilteredTasks(allTasks); // Set initial filtered tasks to all tasks
    } catch (error) {
      console.error('Error fetching tasks:', error);
      message.error('Failed to fetch tasks');
    }
  };

   // Handle task assignment
   

   const handleAssignTask = async () => {
    // Check if all necessary fields are filled
    if (!selectedUser || !newTaskTitle || !newTaskDescription || !newTaskDeadline) {
      toast.warning('Please complete all fields');
      return;
    }
  
    // console.log("Assigned User ID:", selectedUser);
  
    try {
      // First API Call: Assign the Task
      const taskResponse = await axios.post(
        'http://localhost:3000/task',
        {
          title: newTaskTitle,
          description: newTaskDescription,
          deadline: new Date(newTaskDeadline).toISOString(),
          assignedUserId: selectedUser,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
  
      // Debugging: Check the response structure
      // console.log("Task Response:", taskResponse);
  
      // Extract user email and username (adjust based on response structure)
      const assignedUserEmail = taskResponse.data.assignedUserEmail || taskResponse.data.user?.email;
      const assignedUserName = taskResponse.data.assignedUserName || taskResponse.data.user?.username;
      // console.log("Assigned User Name:", assignedUserName); // Debugging
  
      // Show success notification for task assignment
      toast.success(`Task assigned to ${assignedUserName || 'User'}!`);
  
      // Send email asynchronously without waiting for it to complete
      if (assignedUserEmail) {
        // Async email sending
        setTimeout(async () => {
          try {
            await axios.post(
              'http://localhost:3000/email/send',
              {
                recipients: [assignedUserEmail],
                subject: `New Task Assigned: ${newTaskTitle}`,
                html: `<p style="font-family: Arial, sans-serif; color: #333333;">Hello <strong>${assignedUserName}</strong>,</p>

<p style="font-family: Arial, sans-serif; color: #333333;">We are pleased to inform you that a new task has been assigned to you in <strong>VTaskManager</strong>.</p>

<p style="font-family: Arial, sans-serif; color: #333333; font-weight: bold;">Task Details:</p>

<table style="font-family: Arial, sans-serif; color: #333333; border-collapse: collapse; margin-top: 10px;">
  <tr>
    <td style="padding: 8px; font-weight: bold;">Title:</td>
    <td style="padding: 8px;">${newTaskTitle}</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold;">Description:</td>
    <td style="padding: 8px;">${newTaskDescription}</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold;">Deadline:</td>
    <td style="padding: 8px;">${new Date(newTaskDeadline).toLocaleString()}</td>
  </tr>
</table>

<p style="font-family: Arial, sans-serif; color: #333333; margin-top: 20px;">If you have any questions or need further assistance, please feel free to reach out.</p>

<p style="font-family: Arial, sans-serif; color: #333333; margin-top: 20px;">Thank you for using <strong>VTaskManager</strong>!</p>

<p style="font-family: Arial, sans-serif; color: #333333;">Best regards,</p>

<p style="font-family: Arial, sans-serif; color: #333333; font-weight: bold;">The VTaskManager Team</p>
`,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
              }
            );
  
            toast.success(`Email sent to ${assignedUserEmail}!`);
          } catch (emailError) {
            console.error('Error sending email:', emailError);
            toast.error('Error sending email.');
          }
        }, 0); // Immediate async call without blocking task creation
      } else {
        toast.warning("User email not available. Email not sent.");
      }
  
      // Reset form and close modal
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDeadline(null);
      setIsModalVisible(false);
  
      // Fetch updated data
      fetchUsersWithTasks();
      fetchTasks();
  
      // Clear success message after 2 seconds
      setTimeout(() => setAlertMessage(null), 2000);
  
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error: Could not complete the task assignment.');
  
      setAlertMessage('Error: Could not complete the task assignment.');
      setAlertType('error');
  
      // Clear error message after 2 seconds
      setTimeout(() => setAlertMessage(null), 2000);
    }
  };
  


  

  // Search functionality for users
  const handleUserSearch = (value) => {
    setUserSearchQuery(value);
    if (value.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  // Search functionality for tasks
  const handleTaskSearch = (query) => {
    setTaskSearchQuery(query);
  
    if (!query) {
      setFilteredTasks(tasks); // Reset to original list if search query is empty
      return;
    }
  
    const lowerCaseQuery = query.toLowerCase();
  
    const filtered = tasks.filter(task => 
      task.title.toLowerCase().includes(lowerCaseQuery) || 
      task.description.toLowerCase().includes(lowerCaseQuery) ||
      (task.username && task.username.toLowerCase().includes(lowerCaseQuery)) // Now correctly filtering by username
    );
  
    setFilteredTasks(filtered);
  };
  
  


  // User Table Columns
  const userColumns = [
    { title: 'User Name', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Assign Task',
      key: 'assign',
      render: (_, record) => (
        <Button 
        onClick={() => {
          setSelectedUser(record.userId);  // This will set the selected user's ID
          setIsModalVisible(true);  // Open the modal to assign a task
        }}
        >
          Assign Task
        </Button>
      ),
    },
  ];

  // Task Table Columns
  const taskColumns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        let color = 'red'; // Default color for notCompleted or other statuses
        if (status === 'completed') {
          color = 'green';
        } else if (status === 'inProgress') {
          color = 'blue'; // Set blue color for inProgress status
        }
  
        return (
          <Tag color={color}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    { 
      title: 'User', 
      dataIndex: 'username', 
      key: 'user', 
      render: (username) => username ? username : 'Unassigned', 
    },
  ];

  return (
    <div style={{ padding: '30px', backgroundColor: '#2c3e50', minHeight: '100vh',  color: '#ffffff' }}>
      <ParticleBackground/>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '20px',  color: '#ffffff'  }}>Admin Dashboard 💻</Title>
      
      {/* Users Section */}
      <Card title="Users  👥" bordered={false} style={{ marginBottom: '60px', borderRadius: '10px' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: '10px' }}>
          <Col xs={24} sm={12} md={8}>
            <Input 
              placeholder="Search Users"
              value={userSearchQuery}
              onChange={(e) => handleUserSearch(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
        </Row>
        <Table 
          dataSource={filteredUsers} 
          columns={userColumns} 
          rowKey="userId" 
          pagination={{ pageSize: 8 }}
          scroll={{ x: 'max-content' }} // Allow horizontal scrolling
          style={{
            backgroundColor: '#ffffff', // White background for modern look
            borderRadius: '8px', // Rounded corners for a sleek design
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
          }}
          bordered
          rowClassName="custom-table-row"
        />
      </Card>
      
      {/* Tasks Section */}
      <Card title="All Tasks 📋" bordered={false} style={{ marginBottom: '20px', borderRadius: '10px' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: '10px' }}>
          <Col xs={24} sm={12} md={8}>
            <Input 
              placeholder="Search Tasks"
              value={taskSearchQuery }
              onChange={(e) => handleTaskSearch(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
        </Row>
        <Table 
          dataSource={filteredTasks} 
          columns={taskColumns} 
          rowKey="taskId" 
          pagination={{ pageSize: 8 }}
          scroll={{ x: 'max-content' }} // Allow horizontal scrolling
          style={{
            backgroundColor: '#ffffff', // White background for modern look
            borderRadius: '8px', // Rounded corners for a sleek design
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
          }}
          bordered
          rowClassName="custom-table-row"
        />
      </Card>
      
      {/* Task Assignment Modal */}
      <Modal
        title="Assign New Task"
        open={isModalVisible}
        onOk={handleAssignTask}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleAssignTask}>
            Assign Task
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="User">
            <Input value={selectedUser && users.find(user => user.userId === selectedUser)?.username} disabled />
          </Form.Item>
          <Form.Item label="Task Title">
            <Input 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </Form.Item>
          <Form.Item label="Task Description">
            <Input.TextArea 
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Enter task description"
            />
          </Form.Item>
          <Form.Item label="Deadline">
            <DatePicker 
              value={newTaskDeadline}
              onChange={(date) => setNewTaskDeadline(date)}
              placeholder="Select deadline"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
      
      <ToastContainer />
    </div>
  );
};



export default AdminDashboard;