import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, message, Tag, Input, Col, DatePicker } from 'antd';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    console.log("Assigned User ID:", selectedUser);

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
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      // Debugging: Check the response structure
      console.log("Task Response:", taskResponse);

      // Extract user email and username (adjust based on response structure)
      const assignedUserEmail = taskResponse.data.assignedUserEmail || taskResponse.data.user?.email;
      const assignedUserName = taskResponse.data.assignedUserName || taskResponse.data.user?.username;
      console.log("Assigned User Name:", assignedUserName); // Debugging

      // Second API Call: Send Email Notification and show success notification
      if (assignedUserEmail) {
        await axios.post(
          'http://localhost:3000/email/send',
          {
            recipients: [assignedUserEmail],
            subject: `New Task Assigned: ${newTaskTitle}`,
            html: `<p>Hello ${assignedUserName},</p>
                   <p>A new task has been assigned to you:</p>
                   <p><strong>Title:</strong> ${newTaskTitle}</p>
                   <p><strong>Description:</strong> ${newTaskDescription}</p>
                   <p><strong>Deadline:</strong> ${new Date(newTaskDeadline).toLocaleString()}</p>
                   <p>Thank you!</p>
                   <p>Regards</p>
                   <p>VTaskManager</p>`,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );

        toast.success(`Task assigned and email sent to ${assignedUserEmail}!`);
      } else {
        toast.warning("User email not available. Email not sent.");
      }

      // Success notification for task assignment
      setAlertMessage('Task Created: The task was added successfully!');
      setAlertType('success');
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
  const handleTaskSearch = (value) => {
    setTaskSearchQuery(value);
    if (value.trim() === '') {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter(task =>
        task.title.toLowerCase().includes(value.toLowerCase()) ||
        task.description.toLowerCase().includes(value.toLowerCase())
      );
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFilteredTasks(filtered);
    }
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
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      
      {/* User Search and Table */}
      <h3>Users</h3>
      <div style={{ marginBottom: '10px' }}>
        <Col xs={24} sm={24} md={12}>
          <Input.Search 
            placeholder="Search Users" 
            value={userSearchQuery}
            onChange={(e) => handleUserSearch(e.target.value)}
            style={{ width: '300px', marginBottom: '10px' }}
          />
        </Col>
      </div>
      <Table 
        dataSource={filteredUsers} 
        columns={userColumns} 
        rowKey="userId" 
      />

      {/* Task Search and Table */}
      <h3>All Tasks</h3>
      <div style={{ marginBottom: '10px' }}>
        <Col xs={24} sm={24} md={12}>
          <Input.Search 
            placeholder="Search Tasks" 
            value={taskSearchQuery}
            onChange={(e) => handleTaskSearch(e.target.value)}
            style={{ width: '300px', marginBottom: '10px' }} 
          />
        </Col>
      </div>
      <Table 
        dataSource={filteredTasks} 
        columns={taskColumns} 
        rowKey="taskId" 
      />

      {/* Modal for Assigning/Creating Task */}
      <Modal
        title="Assign New Task"
        open={isModalVisible}
        onOk={handleAssignTask}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form>
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
      {/* Add the ToastContainer to show the notifications */}
      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;