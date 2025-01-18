import { React, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from './api/axios.js';

const ExitManagement = async () => {
    const [stafflist, setStaffList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inactivityReason, setInactivityReason] = useState('');
    const [exitDate, setExitDate] = useState('');
    const fetchdatafromexitapi = async () => {
        try {
            const response = await axios.get("/api/exit_management");
            setExitData(response.data.exit || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        fetchdatafromexitapi();
    }, []);
    return (
        <div>
            <h1>Exit Management</h1>
            <table>
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>Employee Name</th>
                        <th>Exit Date</th>
                        <th>Exit Type</th>
                        <th>Exit Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {exitData.map((exit) => (
                        <tr key={exit.employee_id}>
                            <td>{exit.employee_id}</td>
                            <td>{exit.employee_name}</td>
                            <td>{exit.exit_date}</td>
                            <td>{exit.exit_type}</td>
                            <td>{exit.exit_reason}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default ExitManagement;