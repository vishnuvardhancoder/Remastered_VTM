import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all users and tasks on component mount
  useEffect(() => {
    const fetchData = () => {
      // Fetch user data
      axios
        .get('http://localhost:3000/admin/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        })
        .then((userResponse) => {
          // Fetch task data after user data is retrieved
          return axios.get('http://localhost:3000/admin/tasks', {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          }).then((taskResponse) => {
            // Set users and tasks state after both responses
            setUsers(userResponse.data);
            setTasks(taskResponse.data);
          });
        })
        .catch((error) => {
          console.error('Failed to fetch data:', error);
          message.error('Failed to fetch data.');
          navigate('/login');
        })
        .finally(() => {
          setLoading(false);
        });
    };
  
    fetchData();
  }, [navigate]);
  

  // Admin Dashboard Layout
  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>

      {loading ? (
        <Spin tip="Loading..." />
      ) : (
        <>
          <h3>Users</h3>
          <Table
            dataSource={users}
            columns={[
              { title: 'Username', dataIndex: 'username', key: 'username' },
              { title: 'Email', dataIndex: 'email', key: 'email' },
              { title: 'First Name', dataIndex: 'firstname', key: 'firstname' },
              { title: 'Last Name', dataIndex: 'lastname', key: 'lastname' },
            ]}
          />

          <h3>Tasks</h3>
          <Table
            dataSource={tasks}
            columns={[
              { title: 'Title', dataIndex: 'title', key: 'title' },
              { title: 'Description', dataIndex: 'description', key: 'description' },
              { title: 'Status', dataIndex: 'status', key: 'status' },
            ]}
          />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
