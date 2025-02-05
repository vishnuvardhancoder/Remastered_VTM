import React, { useEffect, useState } from 'react';
  import { Table, Button, notification, Modal, Form, Input, Checkbox, Popover, Menu, Row, Col, Card, Tag } from 'antd';
  import { EllipsisOutlined, CheckOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
  import axios from 'axios';
  import { useLocation } from 'react-router-dom';

  const TaskList = ({ tasks, setTasks }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [form] = Form.useForm();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTasks, setFilteredTasks] = useState(tasks);

    // Clear tasks on location change (e.g., user registration or login)
    useEffect(() => {
      if (!localStorage.getItem('access_token')) return; // Don't fetch if no token
      setTasks([]); // Clear tasks before fetching new ones
      fetchTasks(); // Fetch tasks for the currently logged-in user
    }, [location]); // Run whenever the route changes

    // Sync filtered tasks with the main tasks and search query
    useEffect(() => {
      if (searchQuery.trim() === '') {
        setFilteredTasks(tasks);
      } else {
        const filtered = tasks.filter((task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        // Sorting after filtering
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFilteredTasks(filtered);
      }
    }, [tasks, searchQuery]);

    // Fetch tasks from the backend
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
        .get('http://localhost:3000/task', {
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
        `http://localhost:3000/task/${taskId}`,
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
        `http://localhost:3000/task/${taskId}`,
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

  const markMultipleCompleted = async () => {
      if (selectedRowKeys.length === 0) {
        notification.warning({
          message: 'No Tasks Selected',
          description: 'Please select tasks to mark as complete.',
          placement: 'topRight',
        });
        return;
      }
    
      const token = localStorage.getItem('access_token');
      if (!token) {
        notification.error({
          message: 'Unauthorized',
          description: 'No token found. Please log in again.',
          placement: 'topRight',
        });
        return;
      }
    
      const updatePromises = selectedRowKeys.map((taskId) => {
        const taskToUpdate = tasks.find((task) => task.taskId === taskId);
        if (!taskToUpdate) {
          return Promise.reject(new Error(`Task with ID ${taskId} not found`));
        }
        return axios.put(
          `http://localhost:3000/task/${taskId}`,
          { ...taskToUpdate, status: 'completed' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      });
    
      Promise.all(updatePromises)
        .then(() => {
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              selectedRowKeys.includes(task.taskId) ? { ...task, status: 'completed' } : task
            )
          );
          setFilteredTasks((prevTasks) =>
            prevTasks.map((task) =>
              selectedRowKeys.includes(task.taskId) ? { ...task, status: 'completed' } : task
            )
          );
          notification.success({
            message: 'Tasks Completed',
            description: 'Selected tasks marked as completed!',
            placement: 'topRight',
          });
        })
        .catch((error) => {
          console.error('Error marking multiple tasks as completed:', error);
          notification.error({
            message: 'Error',
            description: 'Could not mark some tasks as completed.',
            placement: 'topRight',
          });
        });
  };

  const handleDelete = (taskId) => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        notification.error({
          message: 'Authentication Error',
          description: 'Authentication token is missing.',
          placement: 'topRight',
        });
        return;
      }
    
      axios.patch(`http://localhost:3000/task/${taskId}/delete`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setTasks(tasks.filter(task => task.taskId !== taskId));
        notification.info({
          message: 'Task Removed',
          description: 'The task has been removed.',
          placement: 'topRight',
        });
      })
      .catch((error) => {
        console.error('Error deleting task:', error);
        notification.error({
          message: 'Error',
          description: 'Could not delete the task.',
          placement: 'topRight',
        });
      });
  };


  const deleteMultipleTasks = () => {
    const token = localStorage.getItem('access_token');
    axios.all(
      selectedRowKeys.map((taskId) =>
        axios.patch(`http://localhost:3000/task/${taskId}/delete`, {}, { headers: { Authorization: `Bearer ${token}` } })
      )
    )
    .then(() => {
      setTasks(tasks.filter((task) => !selectedRowKeys.includes(task.taskId)));
      setSelectedRowKeys([]);
      notification.info({ message: 'Tasks Removed', description: 'Selected tasks have been removed.', placement: 'topRight' });
    })
    .catch((error) => {
      console.error('Error deleting tasks:', error);
      notification.error({ message: 'Error', description: 'Could not delete some tasks.', placement: 'topRight' });
    });
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    form.setFieldsValue({ 
      title: task.title, 
      description: task.description, 
      completed: task.status === 'completed',
      inProgress: task.status === 'inProgress'
    });
    setIsModalVisible(true);
  };


  const handleUpdate = () => {
    form
      .validateFields()
      .then((values) => {
        const updatedStatus = values.completed
          ? 'completed'
          : values.inProgress
          ? 'inProgress'
          : 'notCompleted';

        // Make sure that only relevant data (not the entire DOM structure) is sent
        const taskToUpdate = {
          ...selectedTask,
          ...values,
          status: updatedStatus,
        };

        // Ensure we're sending only the necessary fields for the update
        const taskData = {
          title: taskToUpdate.title,
          description: taskToUpdate.description,
          status: taskToUpdate.status,
        };

        // Retrieve JWT token from localStorage
        const token = localStorage.getItem('access_token');
        if (!token) {
          notification.error({
            message: 'Unauthorized',
            description: 'No token found. Please log in again.',
            placement: 'topRight',
          });
          return;
        }

        // Perform the update with the token included in the header
        axios
          .put(`http://localhost:3000/task/${selectedTask.taskId}`, taskData, {
            headers: {
              Authorization: `Bearer ${token}`, // Include JWT token in request header
            },
          })
          .then(() => {
            // Update the tasks state after the update is successful
            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task.taskId === selectedTask.taskId ? { ...task, ...taskData } : task
              )
            );

            setFilteredTasks((prevTasks) =>
              prevTasks.map((task) =>
                task.taskId === selectedTask.taskId ? { ...task, ...taskData } : task
              )
            );

            notification.success({
              message: 'Task Updated',
              description: 'The task was updated successfully!',
              placement: 'topRight',
            });

            setIsModalVisible(false); // Close modal after update
          })
          .catch((error) => {
            console.error('Error updating task:', error);
            notification.error({
              message: 'Error',
              description: 'Could not update the task.',
              placement: 'topRight',
            });
          });
      })
      .catch((error) => {
        // Handle validation errors
        console.error('Validation error:', error);
        notification.error({
          message: 'Validation Error',
          description: 'Please fill in all required fields.',
          placement: 'topRight',
        });
      });
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg']
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      responsive: ['sm', 'md', 'lg']
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      responsive: ['xs', 'sm', 'md', 'lg'],
      render: (status) => {
        if (status === 'completed') return <Tag color="green">Completed</Tag>;
        if (status === 'inProgress') return <Tag color="blue">In Progress</Tag>;
        return <Tag color="red">Not Started</Tag>;
      }
    },
      {
        title: 'Actions',
        key: 'actions',
        responsive: ['xs', 'sm', 'md', 'lg'],
        render: (_, record) => (
          <Popover
            content={
              <Menu>
                <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                  Edit
                </Menu.Item>
                <Menu.Item
                  key="complete"
                  icon={<CheckOutlined />}
                  onClick={() => markCompleted(record.taskId)}
                  disabled={record.status === 'completed'}
                >
                  Mark as Complete
                </Menu.Item>
                <Menu.Item
                  key="inProgress"
                  icon={<PlayCircleOutlined />}
                  onClick={() => markInProgress(record.taskId)}
                  disabled={record.status === 'inProgress' || record.status === 'completed'}
                >
                  Mark as In Progress
                </Menu.Item>
                {location.pathname === '/dashboard' && (
                  <Menu.Item
                    key="delete"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record.taskId)}
                  >
                    Delete
                  </Menu.Item>
                )}
              </Menu>
            }
            trigger="click"
            placement="bottomRight"
          >
            <Button type="link" icon={<EllipsisOutlined />} />
          </Popover>
        )
      }
    ];

    const rowSelection = { selectedRowKeys, onChange: setSelectedRowKeys };


    return (
      <div>
      <Card 
      title="Task List" 
      bordered={true} 
      style={{ 
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', 
        borderRadius: '8px',
        padding: '16px'
      }}
    >
      <Row gutter={[16, 16]} justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={24} md={12}>
          <Input.Search 
            placeholder="Search tasks..." 
            value={searchQuery} 
            onChange={(e) => handleSearch(e.target.value)} 
            enterButton 
            allowClear 
            style={{ borderRadius: '6px', height: '40px' }}
          />
        </Col>
    
        <Col
          xs={24}
          sm={24}
          md={12}
          style={{
            textAlign: 'right',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            type="primary"
            onClick={markMultipleCompleted}
            disabled={!selectedRowKeys.length}
            style={{
              minWidth: '180px',
              height: '40px',
              fontWeight: '500',
              borderRadius: '6px'
            }}
          >
            Mark Selected as Complete
          </Button>
    
          {location.pathname === '/dashboard' && (
            <Button
              danger
              onClick={deleteMultipleTasks}
              disabled={!selectedRowKeys.length}
              icon={<DeleteOutlined />}
              style={{
                minWidth: '160px',
                height: '40px',
                fontWeight: '500',
                borderRadius: '6px'
              }}
            >
              Delete Selected
            </Button>
          )}
        </Col>
      </Row>
    
      {/* Regular Task Table */}
      <div style={{ overflowX: 'auto', width: '100%', marginBottom: '30px' }}>
      <Table 
 dataSource={filteredTasks.filter((task) => !task.deadline)}  // Filter tasks with no deadline
  columns={[
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'completed') return <Tag color="green">Completed</Tag>;
        if (status === 'inProgress') return <Tag color="blue">In Progress</Tag>;
        return <Tag color="red">Not Completed</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Popover
          content={
            <Menu>
              <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                Edit
              </Menu.Item>
              <Menu.Item
                key="complete"
                icon={<CheckOutlined />}
                onClick={() => markCompleted(record.taskId)}
                disabled={record.status === 'completed'}
              >
                Mark as Complete
              </Menu.Item>
              <Menu.Item
                key="inProgress"
                icon={<PlayCircleOutlined />}
                onClick={() => markInProgress(record.taskId)}
                disabled={record.status === 'inProgress' || record.status === 'completed'}
              >
                Mark as In Progress
              </Menu.Item>
              {location.pathname === '/dashboard' && (
                <Menu.Item
                  key="delete"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record.taskId)}
                >
                  Delete
                </Menu.Item>
              )}
            </Menu>
          }
          trigger="click"
          placement="bottomRight"
        >
          <Button type="link" icon={<EllipsisOutlined />} />
        </Popover>
      )
    }
  ]}
  rowKey="taskId"
  rowSelection={rowSelection}
  pagination={{
    responsive: true,
    position: ['bottomCenter'],
    size: 'small',
  }}
  scroll={{ x: 'max-content' }}
  size="middle"
  style={{
    border: '1px solid #ddd',
    borderRadius: '8px',
  }}
/>

      </div>

      
    
  <Modal 
          title="Edit Task" 
          open={isModalVisible} 
          onCancel={() => setIsModalVisible(false)} 
          onOk={handleUpdate}
          width="95%"
          style={{ maxWidth: '500px' }}
        >
          <Form form={form} layout="vertical">
            <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please input the title!' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Please input the description!' }]}>
              <Input />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Completed"
                  name="completed"
                  valuePropName="checked"
                >
                  <Checkbox />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="In Progress"
                  name="inProgress"
                  valuePropName="checked"
                >
                  <Checkbox />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
  </Card>

  {/* Admin Assigned Task Table */}
  <Card title="Tasks Assigned by Admin" bordered={true}style={{ 
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', 
        borderRadius: '8px',
        padding: '16px',
        marginTop:'25px'
      }}>
  <Table 
  dataSource={tasks.filter(task => task.deadline !== null)}  // Filter tasks with a deadline
  columns={[
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'completed') return <Tag color="green">Completed</Tag>;
        if (status === 'inProgress') return <Tag color="blue">In Progress</Tag>;
        return <Tag color="red">Not Completed</Tag>;
      }
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline) => deadline ? new Date(deadline).toLocaleDateString() : 'No Deadline'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Popover
          content={
            <Menu>
              <Menu.Item key="complete" icon={<CheckOutlined />} onClick={() => markCompleted(record.taskId)}>
                Mark as Complete
              </Menu.Item>
              <Menu.Item
                key="inProgress"
                icon={<PlayCircleOutlined />}
                onClick={() => markInProgress(record.taskId)}
                disabled={record.status === 'inProgress' || record.status === 'completed'}
              >
                Mark as In Progress
              </Menu.Item>
            </Menu>
          }
          trigger="click"
          placement="bottomRight"
        >
          <Button type="link" icon={<EllipsisOutlined />} />
        </Popover>
      )
    }
  ]}
  rowKey="taskId"
  pagination={{
    responsive: true,
    position: ['bottomCenter'],
    size: 'small',
  }}
  scroll={{ x: 'max-content' }}
  size="middle"
  style={{
    border: '1px solid #ddd',
    borderRadius: '8px',
  }}
/>
  </Card>


  </div>

    );
  };

  export default TaskList;