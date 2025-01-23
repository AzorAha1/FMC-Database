import React, { useState, useEffect } from 'react';
import axios from './api/axios';
import { Table, Alert } from 'antd';
import Sidebar from './Sidebar.jsx';

const { Column } = Table;

const InActiveStaff = () => {
    const [inactivestaff, setInactiveStaff] = useState([]); // List of inactive staff
    const [loading, setLoading] = useState(false); // Loading state
    const [error, setError] = useState(null); // Error state

    // Fetch inactive staff from the backend
    useEffect(() => {
        fetchInactiveStaff();
    }, []);

    const fetchInactiveStaff = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/inactive_staff');
            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to fetch inactive staff.');
            }
            setInactiveStaff(response.data.inactive); // Update state with fetched data
        } catch (err) {
            setError(err.message); // Handle errors
            console.error(err);
        } finally {
            setLoading(false); // Stop loading spinner
        }
    };

    return (
        <div className='flex h-screen'>
            <Sidebar /> 
            <div className='flex-1 p-6'>
                <h1 className="text-2xl font-bold mb-6">InActive Staffs</h1>

                {error && <Alert message={error} type="error" showIcon className="mb-6" />}

                <Table dataSource={inactivestaff} loading={loading} rowKey="staffNumber">
                    <Column title="Staff Number" dataIndex="staffNumber" key="staffNumber" />
                    <Column title="Name" render={(_, record) => `${record.firstName} ${record.lastName}`} key="name" />
                    <Column title="Department" dataIndex="department" key="department" />
                    <Column title="Exit Reason" dataIndex="exit_reason" key="exit_reason" />
                    <Column title="Exit Date" dataIndex="exit_date" key="exit_date" />
                </Table>
            </div>
        </div>
    );
};

export default InActiveStaff;