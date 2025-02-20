import { Card, Table, Tag, Popover, Menu, Button } from 'antd';
import { CheckOutlined, PlayCircleOutlined, EllipsisOutlined } from '@ant-design/icons';
import ParticleBackground from '../components/ParticleBackground';
// import ParticleBackground from './ParticleBackground';
import "./AssignedTask.css";

const AssignedTasks = ({ tasks, markCompleted, markInProgress }) => {
  return (
    <Card
    title={<span style={{ color: 'white' }}>Task Assigned by Admin 🖥️</span>}
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
  
      <ParticleBackground />
      <div className="w-full">
      <Table
        dataSource={tasks.filter((task) => task.deadline !== null)}
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
            title: <span className="text-gray-100 font-medium">Deadline</span>,
            dataIndex: 'deadline',
            key: 'deadline',
            render: (deadline) => (
              <span className="text-gray-100">
                {deadline ? new Date(deadline).toLocaleDateString() : 'No Deadline'}
              </span>
            )
          },
          {
            title: <span className="text-gray-100 font-medium">Actions</span>,
            key: 'actions',
            render: (_, record) => (
              <Popover
                content={
                  <div className="bg-slate-800 rounded-md shadow-lg">
                    <Menu className="bg-transparent border-0">
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
                    </Menu>
                  </div>
                }
                trigger="click"
                placement="bottomRight"
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
          background: 'linear-gradient(135deg, #1a2a4a, #293b5f)',
          border:'1px solid black',
          borderRadius: '8px',
          padding: '1px'
        }}
      />

      <style jsx global>{`
        .custom-dark-table {
          background: linear-gradient(135deg, #1a2a4a, #293b5f) !important;
        }
        .custom-dark-table .ant-table {
          background: transparent !important;
        }
        .custom-dark-table .ant-table-wrapper {
          background: linear-gradient(135deg, #1a2a4a, #293b5f) !important;
        }
        .custom-dark-table .ant-table-container {
          background: linear-gradient(135deg, #1a2a4a, #293b5f) !important;
        }
        .custom-dark-table .ant-table-content {
          background: linear-gradient(135deg, #1a2a4a, #293b5f) !important;
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
        .custom-dark-table .ant-table-tbody > tr {
          background: transparent !important;
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
        .custom-dark-table .ant-table-cell {
          background: transparent !important;
        }
        .custom-dark-table .ant-table-row {
          background: transparent !important;
        }
      `}</style>
    </div>
      <ParticleBackground />
    </Card>
  );
};

export default AssignedTasks;
