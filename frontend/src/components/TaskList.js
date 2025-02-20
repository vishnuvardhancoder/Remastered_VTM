import React, { useEffect, useState } from 'react';
  import { Table, Button, notification, Modal, Form, Input, Checkbox, Popover, Menu, Row, Col, Card, Tag } from 'antd';
  import { EllipsisOutlined, CheckOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
  import axios from 'axios';
  import { useLocation } from 'react-router-dom';
import ParticleBackground from './ParticleBackground';
import "./TaskList.css";

  const TaskList = ({ tasks, setTasks, showAssigned  }) => {
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
        <ParticleBackground />
    
        <Card
  title={<span style={{ color: 'white' }}>Task List 📋</span>}
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


<Row
  gutter={[16, 16]}
  justify="space-between"
  align="middle"
  style={{ marginBottom: '20px' }}
>
  <Col xs={24} sm={24} md={16}>
    <Input.Search
      placeholder="Search tasks..."
      value={searchQuery}
      onChange={(e) => handleSearch(e.target.value)}
      enterButton="Search"
      allowClear
      className="custom-search-bar"
      style={{ width: '100%' }} // Ensures search bar takes full width
    />
  </Col>

  <Col
    xs={24}
    sm={24}
    md={8}
    style={{
      textAlign: 'right',
      display: 'flex',
      flexWrap: 'nowrap', // Ensures buttons stay in one row
      gap: '8px',
      justifyContent: 'flex-end',
    }}
  >
    <Button
      type="primary"
      onClick={markMultipleCompleted}
      disabled={!selectedRowKeys.length}
      style={{
        minWidth: '120px', // Reduce button width slightly
        height: '36px', // Make buttons slightly smaller
        fontWeight: '500',
        borderRadius: '6px',
        color: 'white',
        backgroundColor: selectedRowKeys.length ? '#1890ff' : '#bfbfbf',
        borderColor: selectedRowKeys.length ? '#1890ff' : '#d9d9d9',
        transition: 'background-color 0.3s, border-color 0.3s',
      }}
      className={selectedRowKeys.length ? 'enabled-button1' : ''}
    >
      Mark Completed
    </Button>

    {location.pathname === '/dashboard' && (
      <Button
        danger
        onClick={deleteMultipleTasks}
        disabled={!selectedRowKeys.length}
        icon={<DeleteOutlined />}
        style={{
          minWidth: '120px', // Reduce button width slightly
          height: '36px', // Make buttons slightly smaller
          fontWeight: '500',
          borderRadius: '6px',
          color: 'white',
          backgroundColor: selectedRowKeys.length ? '#ff4d4f' : '#bfbfbf',
          borderColor: selectedRowKeys.length ? '#ff4d4f' : '#d9d9d9',
          transition: 'background-color 0.3s, border-color 0.3s',
        }}
        className={selectedRowKeys.length ? 'enabled-button' : ''}
      >
        Delete
      </Button>
    )}
  </Col>
</Row>


    
          {/* Regular Task Table */}
          <div className="w-full rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 p-4 shadow-xl">
      <Table
        dataSource={filteredTasks.filter((task) => !task.deadline)}
        columns={[
          {
            title: <span className="text-gray-100 font-medium">Title</span>,
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            className: 'text-gray-100'
          },
          {
            title: <span className="text-gray-100 font-medium">Description</span>,
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            className: 'text-gray-100'
          },
          {
            title: <span className="text-gray-100 font-medium">Status</span>,
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
              if (status === 'completed')
                return (
                  <Tag className="completed">
                    Completed
                  </Tag>
                );
              if (status === 'inProgress')
                return (
                  <Tag className="inprogress">
                    In Progress
                  </Tag>
                );
              return (
                <Tag className="notcompleted">
                  Not Completed
                </Tag>
              );
            }
          },
          {
            title: <span className="text-gray-100 font-medium">Actions</span>,
            key: 'actions',
            render: (_, record) => (
              <Popover
  content={
    <div className="custom-dark-popover bg-slate-800 rounded-md shadow-lg">
      <Menu className="bg-transparent border-0">
        <Menu.Item
          key="edit"
          icon={<EditOutlined className="text-blue-400" />}
          onClick={() => handleEdit(record)}
          className="text-gray-100 hover:bg-slate-700"
        >
          Edit
        </Menu.Item>
        <Menu.Item
          key="complete"
          icon={<CheckOutlined className="text-emerald-400" />}
          onClick={() => markCompleted(record.taskId)}
          disabled={record.status === 'completed'}
          className="text-gray-100 hover:bg-slate-700"
        >
          Mark as Complete
        </Menu.Item>
        <Menu.Item
          key="inProgress"
          icon={<PlayCircleOutlined className="text-amber-400" />}
          onClick={() => markInProgress(record.taskId)}
          disabled={record.status === 'inProgress' || record.status === 'completed'}
          className="text-gray-100 hover:bg-slate-700"
        >
          Mark as In Progress
        </Menu.Item>
        {location.pathname === '/dashboard' && (
          <Menu.Item
            key="delete"
            icon={<DeleteOutlined className="text-rose-400" />}
            onClick={() => handleDelete(record.taskId)}
            className="text-gray-100 hover:bg-slate-700"
          >
            Delete
          </Menu.Item>
        )}
      </Menu>
    </div>
  }
  trigger="click"
  placement="bottomRight"
  className="custom-dark-popover" // Apply the new class
>
<Button 
  type="text" 
  icon={<EllipsisOutlined style={{ color: 'white' }} />} 
  className="hover:bg-slate-700"
 />


</Popover>



            )
          }
        ]}
        rowKey="taskId"
        rowSelection={{
          ...rowSelection,
          columnWidth: 48,
          selectedRowKeys: rowSelection?.selectedRowKeys,
          onChange: rowSelection?.onChange,
        }}
        pagination={{ 
          responsive: true, 
          position: ['bottomCenter'],
          size: 'small',
          className: "text-gray-100"
        }}
        scroll={{ x: 'max-content' }}
        size="middle"
        className="custom-dark-table"
        style={{
          border:'1px solid black',
          borderRadius: '8px'
        }}
        onRow={(record) => ({
          className: 'hover:bg-slate-700 transition-colors duration-200'
        })}
      />

      <style jsx global>{`
        .custom-dark-table {
          background: transparent !important;
        }
        .custom-dark-table .ant-table {
          background: transparent !important;
        }
        .custom-dark-table .ant-table-thead > tr > th {
          background: rgba(30, 41, 59, 0.8) !important;
          color: #fff !important;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1) !important;
        }
        .custom-dark-table .ant-table-tbody > tr > td {
          background: transparent !important;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1) !important;
          color: #fff !important;
        }
        .custom-dark-table .ant-table-tbody > tr:hover > td {
          background: rgba(51, 65, 85, 0.5) !important;
        }
        .custom-dark-table .ant-pagination-item-active {
          background: #2563eb !important;
          border-color: #2563eb !important;
        }
        .custom-dark-table .ant-pagination-item a {
          color: #fff !important;
        }
        .custom-dark-table .ant-table-column-sorter {
          color: #fff !important;
        }
        .custom-dark-table .ant-checkbox-wrapper {
          color: #fff !important;
        }
        .custom-dark-table .ant-pagination-prev button,
        .custom-dark-table .ant-pagination-next button {
          color: #fff !important;
        }
      `}</style>
    </div>
    
    <Modal
  title={<span className="text-white-100">Edit Task</span>} // Ensures title is visible
  open={isModalVisible}
  onCancel={() => setIsModalVisible(false)}
  onOk={handleUpdate}
  width="95%"
  style={{ maxWidth: '500px' }}
  className="custom-dark-modal"
>
  <Form form={form} layout="vertical">
    <Form.Item label={<span className="text-gray-100">Title</span>} name="title" rules={[{ required: true, message: 'Please input the title!' }]}>
      <Input className="bg-slate-800 text-gray-100 border-gray-600 focus:border-blue-500" />
    </Form.Item>
    <Form.Item label={<span className="text-gray-100">Description</span>} name="description" rules={[{ required: true, message: 'Please input the description!' }]}>
      <Input className="bg-slate-800 text-gray-100 border-gray-600 focus:border-blue-500" />
    </Form.Item>

    <Row gutter={16}>
      <Col xs={24} sm={12}>
        <Form.Item label={<span className="text-gray-100">Completed</span>} name="completed" valuePropName="checked">
          <Checkbox className="text-gray-100">Completed</Checkbox>
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item label={<span className="text-gray-100">In Progress</span>} name="inProgress" valuePropName="checked">
          <Checkbox className="text-gray-100">In Progress</Checkbox>
        </Form.Item>
      </Col>
    </Row>
  </Form>
</Modal>

          <ParticleBackground />
        </Card>
        <style jsx>{`
  /* Ensure the rows have a consistent dark background */
  .ant-table-tbody > tr.task-row {
    background: linear-gradient(135deg, #1a2a4a, #293b5f) !important;
    color: white;
  }

  /* Use nth-child to alternate row background colors */
  .ant-table-tbody > tr:nth-child(odd) {
    background: linear-gradient(135deg, #1a2a4a, #1f2d47) !important;
  }

  .ant-table-tbody > tr:nth-child(even) {
    background: linear-gradient(135deg, #1a2a4a, #293b5f) !important;
  }

  /* Disable hover effect completely (important override) */
  .ant-table-tbody > tr.task-row:hover,
  .ant-table-tbody > tr.ant-table-row-selected:hover {
    background: linear-gradient(135deg, #1a2a4a, #293b5f) !important;
    cursor: default !important; /* Ensure no pointer cursor on hover */
  }

  /* Prevent background change on selected row */
  .ant-table-tbody > tr.ant-table-row-selected {
    background: linear-gradient(135deg, #1a2a4a, #293b5f) !important;
  }

  /* Status tags styling */
  .status-tag {
    // font-weight: bold;
  }

  .ant-tag-green {
    background-color: #4caf50;
    color: white;
  }

  .ant-tag-blue {
    background-color: #2196f3;
    color: white;
  }

  .ant-tag-red {
    background-color: #f44336;
    color: white;
  }

  /* Make selected checkboxes more visible */
  .ant-checkbox-wrapper-checked .ant-checkbox-inner {
    background-color: #007bff !important;
    border-color: #007bff !important;
  }

  /* Adjust table header color for better visibility */
  .ant-table-thead > tr > th {
    background: linear-gradient(135deg, #1a2a4a, #293b5f);
    color: white !important;
  }
`}</style>

    

      </div>
    );
  }    
  export default TaskList;