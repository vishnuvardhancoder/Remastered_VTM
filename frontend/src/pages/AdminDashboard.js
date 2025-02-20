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
    <ParticleBackground/>
  }, []);

  
  
  // Fetch all users with their tasks
  const fetchUsersWithTasks = async () => {
    try {
      const response = await axios.get('https://remastered-vtm-backend-qnvd.onrender.com/auth/admin/users', {
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
      const response = await axios.get('https://remastered-vtm-backend-qnvd.onrender.com/auth/admin/users', {
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
        'https://remastered-vtm-backend-qnvd.onrender.com/task',
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
              'https://remastered-vtm-backend-qnvd.onrender.com/email/send',
              {
                recipients: [assignedUserEmail],
                subject: `New Task Assigned: ${newTaskTitle}`,
                html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border: 3px solid #007bff; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif; color: #333333;">

  <!-- Header with Blue Background -->
  <div style="background-color: #007bff; padding: 15px; text-align: center; border-radius: 7px 7px 0 0;">
    <h2 style="color: #ffffff; margin: 0;">VTaskManager</h2>
  </div>

  <!-- Content Section with Padding -->
  <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 7px 7px;">
    
    <!-- Greeting -->
    <p style="font-size: 16px;">Hello <strong>${assignedUserName}</strong>,</p>

    <!-- Introduction -->
    <p style="font-size: 16px;">A new task has been assigned to you in <strong>VTaskManager</strong>. Please review the details below:</p>

    <!-- Task Details Box with Padding -->
    <div style="background-color: #f1f1f1; padding: 15px; border-radius: 6px; margin-top: 10px; border: 2px solid #007bff;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; font-weight: bold; width: 30%;">Title:</td>
          <td style="padding: 10px;">${newTaskTitle}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Description:</td>
          <td style="padding: 10px;">${newTaskDescription}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Deadline:</td>
          <td style="padding: 10px; color: #dc3545; font-weight: bold;">${new Date(newTaskDeadline).toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <p style="font-size: 16px; margin-top: 20px;">If you have any questions or need assistance, feel free to reach out.</p>

    <p style="font-size: 16px;">Thank you for using <strong>VTaskManager</strong>!</p>

    <div style="text-align: center; margin-top: 20px;">
      <p style="font-weight: bold;">Best regards,</p>
      <p style="font-weight: bold; color: #007bff;">The VTaskManager Team</p>
    </div>
  </div>

</div>



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
        style={{background:'#00A8A8',color:'white'}}
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
      <Card title={<span style={{ color: 'white' }}>Users  👥</span>}  bordered={false} style={{ marginBottom: '60px', borderRadius: '10px', background:'#004D91' }}>
      
        <Row justify="space-between" align="middle" style={{ marginBottom: '10px' }}>
          <Col xs={24} sm={12} md={8}>
            <Input 
              placeholder="Search Users"
              value={userSearchQuery}
              onChange={(e) => handleUserSearch(e.target.value)}
              prefix={<SearchOutlined />}
              className='custom-search-bar'
              style={{background:'#1a2a4a',color:'#fff'}}
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
            backgroundColor: '#002E64',
            color:'#fff', // White background for modern look
            borderRadius: '8px', // Rounded corners for a sleek design
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
          }}
          bordered
          rowClassName="custom-table-row"
        />
      </Card>
      
      {/* Tasks Section */}

      <Card 
  title={<span style={{ color: 'white' }}>All Tasks 📋</span>} 
  className='tcard' 
  bordered={false} 
  style={{ marginBottom: '20px', borderRadius: '10px', background:'#004D91' }}

>
<ParticleBackground/>

        <Row justify="space-between" align="middle" style={{ marginBottom: '10px' }}>
          <Col xs={24} sm={12} md={8}>
            <Input 
              placeholder="Search Tasks"
              value={taskSearchQuery }
              onChange={(e) => handleTaskSearch(e.target.value)}
              prefix={<SearchOutlined />}
              style={{background:'#1a2a4a',color:'#fff'}}
              className='custom-search-bar'
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
            backgroundColor: '#002E64', // White background for modern look
            color:'#fff', 
            borderRadius: '8px', // Rounded corners for a sleek design
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
          }}
          bordered
          rowClassName="custom-table-row"
        />
      </Card>
      
      {/* Task Assignment Modal */}
      <Modal
  title={<span style={{ color: '#ffffff' }}>Assign New Task</span>}
  open={isModalVisible}
  onOk={handleAssignTask}
  onCancel={() => setIsModalVisible(false)}
  footer={[
    <Button 
      key="cancel" 
      onClick={() => setIsModalVisible(false)} 
      style={{ background: '#1a2a4a', color: '#ffffff', border: 'none' }}
    >
      Cancel
    </Button>,
    <Button 
      key="submit" 
      type="primary" 
      onClick={handleAssignTask} 
      style={{ background: '#004D91', color: '#ffffff', border: 'none' }}
    >
      Assign Task
    </Button>
  ]}
  className="custom-dark-modal"
>
  <Form layout="vertical">
    <Form.Item label={<span style={{ color: '#ffffff' }}>User</span>}>
      <Input 
        value={selectedUser && users.find(user => user.userId === selectedUser)?.username} 
        disabled 
        style={{ background: '#1a2a4a', color: '#ffffff', border: '1px solid #004D91' }}
      />
    </Form.Item>
    <Form.Item label={<span style={{ color: '#ffffff' }}>Task Title</span>}>
      <Input 
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
        placeholder="Enter task title"
        style={{ background: '#1a2a4a', color: '#ffffff', border: '1px solid #004D91' }}
        className="custom-placeholder"
      />
    </Form.Item>
    <Form.Item label={<span style={{ color: '#ffffff' }}>Task Description</span>}>
      <Input.TextArea 
        value={newTaskDescription}
        onChange={(e) => setNewTaskDescription(e.target.value)}
        placeholder="Enter task description"
        style={{ background: '#1a2a4a', color: '#ffffff', border: '1px solid #004D91' }}
        className="custom-placeholder"
      />
    </Form.Item>
    <Form.Item label={<span style={{ color: '#ffffff' }}>Deadline</span>}>
      <DatePicker 
        value={newTaskDeadline}
        onChange={(date) => setNewTaskDeadline(date)}
        placeholder="Select deadline"
        style={{ width: '100%', background: '#1a2a4a', color: '#ffffff', border: '1px solid #004D91' }}
        className="custom-datepicker"
        dropdownClassName="custom-datepicker-dropdown"
      />
    </Form.Item>
  </Form>
</Modal>


      <ToastContainer />
    </div>
  );
};



export default AdminDashboard;