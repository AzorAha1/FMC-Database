import React, { useState } from 'react';
import axios from './api/axios.js';
import { AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

const AddUser = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        role: 'user',
        filenumber: '',
        staffphone: '',
        department: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        
        if (!formData.username) {
            newErrors.username = 'Username is required';
        }
        
        if (!formData.filenumber) {
            newErrors.filenumber = 'File number is required';
        }
        
        if (!formData.staffphone) {
            newErrors.staffphone = 'Phone number is required';
        } else if (!/^\d{11}$/.test(formData.staffphone)) {
            newErrors.staffphone = 'Phone number must be 11 digits';
        }
        
        if (!formData.department) {
            newErrors.department = 'Department is required';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setError('Please fill all required fields correctly');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await axios.post('/api/add_user', {
                email: formData.email,
                username: formData.username,
                role: formData.role,
                filenumber: formData.filenumber,
                staffphone: formData.staffphone,
                department: formData.department,
                password: formData.password
            });

            if (response.data.success) {
                setSuccess('User added successfully');
                setFormData({
                    email: '',
                    username: '',
                    role: 'user',
                    filenumber: '',
                    staffphone: '',
                    department: '',
                    password: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            console.error('Add user error:', error);
            setError(error.response?.data?.message || 'An error occurred while adding the user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center min-h-screen bg-gray-50">
            <Sidebar/>
            <div className="flex-1 p-6 max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                        <div className="flex items-center space-x-2">
                            <UserPlus className="h-6 w-6 text-white" />
                            <h1 className="text-xl font-bold text-white">Add New User</h1>
                        </div>
                    </div>

                    <div className="p-6">
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                <span className="text-green-700">{success}</span>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                                <span className="text-red-700">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Input field groups */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="Enter email"
                                    />
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Username *
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="Enter username"
                                    />
                                    {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Role
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        File Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="filenumber"
                                        value={formData.filenumber}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border ${errors.filenumber ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="Enter file number"
                                    />
                                    {errors.filenumber && <p className="text-sm text-red-500">{errors.filenumber}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="staffphone"
                                        value={formData.staffphone}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border ${errors.staffphone ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="Enter phone number"
                                    />
                                    {errors.staffphone && <p className="text-sm text-red-500">{errors.staffphone}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Department *
                                    </label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border ${errors.department ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="Enter department"
                                    />
                                    {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="Enter password"
                                    />
                                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Confirm Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        placeholder="Confirm password"
                                    />
                                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Adding User...' : 'Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddUser;