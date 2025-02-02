import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, Avatar, message, Tooltip } from 'antd';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Callback from './components/Callback';


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
  const username = localStorage.getItem('username') || 'Guest'; // Retrieve username from localStorage

  const handleLogout = () => {
    localStorage.clear();
    message.success('Logged out successfully!');
    navigate('/login');
  };

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
        {/* <img src={logo} style={{"width":"100px"}}></img> */}
        <Title level={2} style={{ margin: 0, marginLeft: '5px', fontWeight: '600', fontSize: 'clamp(18px, 4vw, 24px)' }}>
          Task Manager
        </Title>
      </div>

      {isAuthenticated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Avatar and Username Section */}
          <Tooltip title={username}>
            <Avatar style={{ backgroundColor: '#87d068' }}>
              {username.charAt(0)?.toUpperCase()}
            </Avatar>
          </Tooltip>
          <span style={{ fontSize: '16px', fontWeight: '500', marginLeft:'-8px' }}>{username}</span>

          {/* Logout Button */}
          <Button type="primary" danger onClick={handleLogout}>
            Logout
          </Button>
        </div>
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

const App = () => {
  const [tasks, setTasks] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine whether to show header and footer
  const shouldShowHeaderFooter = !['/landingpage', '/login', '/register'].includes(location.pathname);

  useEffect(() => {
    // console.log('Current URL:', window.location.href); // Log the full URL
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('access_token');
    const userId = queryParams.get('userId');
  
    // console.log('OAuth Callback Params:', { token, userId }); // Log the extracted params
  
    if (token) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('userId', userId);
      message.success('Logged in successfully!');
      
      queryParams.delete('access_token');
      queryParams.delete('userId');
      window.history.replaceState({}, '', `${window.location.pathname}?${queryParams.toString()}`);
      navigate('/dashboard', { replace: true });
    }
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
        <Route path="/" element={<Navigate to="/landingpage" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {shouldShowHeaderFooter && <AppFooter />}
    </>
  );
};

export default App;
