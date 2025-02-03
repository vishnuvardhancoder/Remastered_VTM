import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, Avatar, message, Tooltip,Menu ,Dropdown} from 'antd';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Callback from './components/Callback';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const Dashboard = ({ tasks, setTasks }) => (
  <Content
    style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '2rem',
    }}
  >
    <div
      style={{
        width: '100%',
        maxWidth: '90%',
        margin: '0 auto',
        padding: '0 15px',
      }}
    >
      <TaskForm onTaskCreated={(newTask) => setTasks((prevTasks) => [...prevTasks, newTask])} />
      <TaskList tasks={tasks} setTasks={setTasks} />
    </div>
  </Content>
);

const AppHeader = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('access_token');
  const username = localStorage.getItem('username') || 'Guest';
  const profileImage = localStorage.getItem('profile_image'); // Get profile image from localStorage

  // Debug log to check the value of profileImage
  console.log('Profile Image in Header:', profileImage);

  const handleLogout = () => {
    localStorage.clear();
    message.success('Logged out successfully!');
    navigate('/login');
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" disabled>
        {username}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2" onClick={handleLogout} icon={<LogoutOutlined style={{ color: 'red' }} />} >
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        background: '#f1f1f1',
        color: 'black',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <Avatar style={{ backgroundColor: '#ffffff', color: '#1e3c72', fontWeight: 'bold' }}>VTM</Avatar>
        <span style={{ fontSize: '20px', fontWeight: '600' }}>Task Manager</span>
      </div>

      {isAuthenticated && (
        <Dropdown overlay={menu} trigger={['hover', 'click']}>
          <Tooltip>
            <Avatar
              size={40}
              src={profileImage || undefined} // Display the profile image or fallback to the default icon
              icon={!profileImage && <UserOutlined />}
              style={{ cursor: 'pointer' }}
            />
          </Tooltip>
        </Dropdown>
      )}
    </Header>
  );
};



const AppFooter = () => (
  <Footer style={{ textAlign: 'center', padding: '10px', fontSize: 'clamp(12px, 3vw, 14px)' }}>
    Task Manager ©VISHNU VARDHAN | 2025
  </Footer>
);

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('access_token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminProtectedRoute = ({ children }) => {
  const isAdminAuthenticated = !!localStorage.getItem('access_token'); // Add check for admin-specific token if needed
  return isAdminAuthenticated ? children : <Navigate to="/admin/login" />;
};

const App = () => {
  const [tasks, setTasks] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine whether to show header and footer
  const shouldShowHeaderFooter = !['/landingpage', '/login', '/register', '/admin/login'].includes(location.pathname);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('access_token');
    const userId = queryParams.get('userId');
    const profileImage = queryParams.get('profile_image');
    
    console.log('Profile Image from URL:', profileImage);  // Debug log to verify the value

    if (token && userId) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('userId', userId);

        if (profileImage) {
            const decodedProfileImage = decodeURIComponent(profileImage);  // Decode the profile image
            localStorage.setItem('profile_image', decodedProfileImage);  // Store the decoded profile image
            console.log('Profile image stored in localStorage:', decodedProfileImage);  // Debug log
        } else {
            console.log('No profile image found');
        }

        message.success('Logged in successfully!');

        // Clean up the URL params without reloading the page
        queryParams.delete('access_token');
        queryParams.delete('userId');
        queryParams.delete('profile_image');
        window.history.replaceState({}, '', `${window.location.pathname}?${queryParams.toString()}`);

        navigate('/dashboard', { replace: true });
    } else {
        console.error('No access_token or userId found in the URL');
    }
    console.log('Stored Profile Image:', localStorage.getItem('profile_image'));

}, [navigate]);


  
  
  
  return (
    <>
      {shouldShowHeaderFooter && <AppHeader />}
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard tasks={tasks} setTasks={setTasks} />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/landingpage" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {shouldShowHeaderFooter && <AppFooter />}
    </>
  );
};

export default App;
