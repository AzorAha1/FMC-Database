import React, { useState, useEffect } from 'react';
import axios from './api/axios';
import { Table, Button, Select, Modal, Form, Alert } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Sidebar from './Sidebar.jsx';
import { Search } from 'lucide-react';

const { Column } = Table;
const { Option } = Select;

const ExitManagement = () => {
    const [activeStaff, setActiveStaff] = useState([]); // List of active staff
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [form] = Form.useForm();

    // Fetch active staff from the backend
    useEffect(() => {
        fetchActiveStaff();
    }, []);

    const fetchActiveStaff = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/active_staff'); // New endpoint for active staff
            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to fetch active staff.');
            }
            setActiveStaff(response.data.active);
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Show modal to mark staff as inactive
    const showModal = (staff) => {
        setSelectedStaff(staff);
        setIsModalVisible(true);
    };

    // Handle modal cancel
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    // Handle form submission
    const handleSubmit = async (values) => {
        try {
            const response = await axios.post('/api/exit_management', {
                staff_id: selectedStaff.staff_id,
                exit_reason: values.exitReason,
                exit_date: dayjs().format('YYYY-MM-DD') // Use current date for exit
            });
            if (response.data.success) {
                fetchActiveStaff(); // Refresh the list
                setIsModalVisible(false);
                form.resetFields();
            } else {
                throw new Error(response.data.error || 'Failed to mark staff as inactive.');
            }
        } catch (err) {
            setError(err.message);
            console.error(err);
        }
    };
    {/* handle list of seeing inactive users */}
    const fetchInActiveStaff = async () => {
        pass
    }

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />
    
            {/* Main Content */}
            <div className="flex-1 p-6 bg-gray-50">
                <h1 className="text-2xl font-bold mb-6">Exit Management</h1>
                <h2 className='font-bold mb-5'>Active Permanent Staffs</h2>
                {error && <Alert message={error} type="error" showIcon className="mb-6" />}
                {/* Search Bar */}
                <div className='flex gap-4 mb-6'>
                    <div className="flex-grow">
                    <input
                        type="text"
                        placeholder="Search staff by name..."
                        // value={searchTerm}
                        // onChange={handleSearch}
                        className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                    </div>
                    <button
                        // onClick={handleExport} // Replace with your button's onClick handler
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <DownloadOutlined className="mr-2" /> {/* Icon */}
                        Export
                    </button>
                </div>
                <Table dataSource={activeStaff} loading={loading} rowKey="staffNumber">
                    <Column title="Staff Number" dataIndex="staffNumber" key="staffNumber" />
                    <Column title="Name" render={(_, record) => `${record.firstName} ${record.lastName}`} key="name" />
                    <Column title="Department" dataIndex="department" key="department" />
                    <Column
                        title="Action"
                        key="action"
                        render={(_, record) => (
                            <Button type="link" onClick={() => showModal(record)}>
                                Mark as Inactive
                            </Button>
                        )}
                    />
                </Table>
    
                {/* Modal for marking staff as inactive */}
                <Modal
                    title="Mark Staff as Inactive"
                    visible={isModalVisible}
                    onCancel={handleCancel}
                    footer={null}
                >
                    <Form form={form} onFinish={handleSubmit}>
                        <Form.Item
                            name="exitReason"
                            label="Exit Reason"
                            rules={[{ required: true, message: 'Please select an exit reason!' }]}
                        >
                            <Select placeholder="Select exit reason">
                                <Option value="death">Death</Option>
                                <Option value="dismissal">Dismissal</Option>
                                <Option value="voluntarily">Voluntarily</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default ExitManagement;