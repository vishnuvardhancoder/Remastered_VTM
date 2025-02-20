import { Layout, Menu,Dropdown  } from 'antd';
import { useState } from 'react';
import {
  AppstoreOutlined,
  CheckSquareOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import AssignedTasks from './AssignedTasks';
import React, { useEffect} from 'react';
  import { Table, Button, notification, Modal, Form, Input, Checkbox, Popover, Row, Col, Card, Tag } from 'antd';
  import { EllipsisOutlined, CheckOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined,MenuOutlined  } from '@ant-design/icons';
  import axios from 'axios';

const { Header, Sider, Content } = Layout;

const Dashboard = ({ tasks, setTasks, userId }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('tasks'); // Default to My Tasks
  const [filteredTasks, setFilteredTasks] = useState(tasks);
 const [searchQuery, setSearchQuery] = useState('');
 const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

 // Auto-collapse sidebar on window resize

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const fetchTasks = () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      notification.error({
        message: 'Error',
        description: 'No authentication token found.',
        placement: 'topRight',
      });
      return;
    }

    axios
      .get('https://remastered-vtm-backend-qnvd.onrender.com/task', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const fetchedTasks = response.data.filter((task) => !task.deleted);
        fetchedTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setTasks(fetchedTasks);
      })
      .catch(() => {
        notification.error({
          message: 'Error',
          description: 'Failed to fetch tasks.',
          placement: 'topRight',
        });
      });
  };

  const handleSearch = (value) => {
    setSearchQuery(value); // Update search query
  };


  const markCompleted = (taskId) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      notification.error({
        message: 'Unauthorized',
        description: 'No token found. Please log in again.',
        placement: 'topRight',
      });
      return;
    }
  
    axios.put(
      `https://remastered-vtm-backend-qnvd.onrender.com/task/${taskId}`,
      { status: 'completed' },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.taskId === taskId ? { ...task, status: 'completed' } : task
        )
      );
      setFilteredTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.taskId === taskId ? { ...task, status: 'completed' } : task
        )
      );
      notification.success({
        message: 'Task Completed',
        description: 'The task has been marked as completed!',
        placement: 'topRight',
      });
    })
    .catch((error) => {
      console.error('Error marking task as completed:', error);
      notification.error({
        message: 'Error',
        description: 'Could not mark the task as completed.',
        placement: 'topRight',
      });
    });
};

const markInProgress = (taskId) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      notification.error({
        message: 'Unauthorized',
        description: 'No token found. Please log in again.',
        placement: 'topRight',
      });
      return;
    }
  
    axios.put(
      `https://remastered-vtm-backend-qnvd.onrender.com/task/${taskId}`,
      { status: 'inProgress' },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.taskId === taskId ? { ...task, status: 'inProgress' } : task
        )
      );
      setFilteredTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.taskId === taskId ? { ...task, status: 'inProgress' } : task
        )
      );
      notification.success({
        message: 'Task Updated',
        description: 'The task status is now in progress!',
        placement: 'topRight',
      });
    })
    .catch((error) => {
      console.error('Error marking task as in progress:', error);
      notification.error({
        message: 'Error',
        description: 'Could not mark the task as in progress.',
        placement: 'topRight',
      });
    });
};

return (
  <Layout 
    style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a2a4a, #293b5f)' 
    }}
  >
    <>
      {/* Sidebar (Only visible on larger screens) */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{ background: 'linear-gradient(135deg, #1a2a4a, #293b5f)' }}
        >
          <div
            style={{
              height: 64,
              color: '#fff',
              textAlign: 'center',
              fontSize: '18px',
              lineHeight: '64px',
              fontWeight: 'bold',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            {collapsed ? 'VTM' : 'VTM Task Manager'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['tasks']}
            onClick={(e) => setSelectedMenu(e.key)}
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <Menu.Item key="tasks" icon={<AppstoreOutlined />}>My Tasks</Menu.Item>
            <Menu.Item key="assigned" icon={<CheckSquareOutlined />}>Assigned Tasks</Menu.Item>
            <Menu.Item key="create" icon={<PlusOutlined />}>Create Task</Menu.Item>
          </Menu>
        </Sider>
      )}

      {/* Top Navigation for Mobile */}
      {isMobile && (
  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px", marginTop: "10px" }}>
    <Dropdown
      overlay={
        <Menu
          theme="dark" // Makes the menu dark
          onClick={(e) => setSelectedMenu(e.key)}
          style={{ background: "#1a2a4a", color: "white" }} // Dark background & white text
        >
          <Menu.Item key="tasks" icon={<AppstoreOutlined style={{ color: "white" }} />} style={{ background: "#1a2a4a", color: "white" }}>
            My Tasks
          </Menu.Item>
          <Menu.Item key="assigned" icon={<CheckSquareOutlined style={{ color: "white" }} />} style={{ background: "#1a2a4a", color: "white" }}>
            Assigned Tasks
          </Menu.Item>
          <Menu.Item key="create" icon={<PlusOutlined style={{ color: "white" }} />} style={{ background: "#1a2a4a", color: "white" }}>
            Create Task
          </Menu.Item>
        </Menu>
      }
      trigger={["click"]}
    >
      <button style={{ background: "#293b5f", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", fontSize: "16px", cursor: "pointer" }}>
        <MenuOutlined style={{ fontSize: "18px", marginRight: "10px" }} />
        Menu
      </button>
    </Dropdown>
  </div>
)}

    </>

    {/* Main Content */}
    <Layout 
      style={{
        background: 'linear-gradient(135deg, #1a2a4a, #293b5f)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Header
        style={{
          background: 'transparent',
          padding: '20px',
          textAlign: 'center',
          fontSize: window.innerWidth <= 768 ? '18px' : '24px',
          fontWeight: 'bold',
          color: '#fff',
          fontFamily: 'Poppins, sans-serif',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          textShadow: '3px 3px 10px rgba(255, 255, 255, 0.2)',
        }}
      >
        {selectedMenu === 'tasks'
          ? '📝 My Tasks'
          : selectedMenu === 'assigned'
          ? '✅ Assigned Tasks'
          : '➕ Create a Task'}
      </Header>

      <Content
        style={{
          width: '100%',
          color: '#fff',
          fontFamily: 'Poppins, sans-serif',
          padding: window.innerWidth <= 768 ? '20px' : '40px',
        }}
      >
        {selectedMenu === 'tasks' && (
          <TaskList
            tasks={tasks.filter((task) => task.createdBy === userId)}
            setTasks={setTasks}
            showAssigned={false}
          />
        )}
        {selectedMenu === 'assigned' && (
          <AssignedTasks
            tasks={tasks}
            markCompleted={markCompleted}
            markInProgress={markInProgress}
          />
        )}
        {selectedMenu === 'create' && (
          <TaskForm
            onTaskCreated={(newTask) => setTasks((prev) => [...prev, newTask])}
          />
        )}
      </Content>
    </Layout>
  </Layout>
);
};


export default Dashboard;
