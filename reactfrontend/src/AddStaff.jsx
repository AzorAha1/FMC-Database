import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar.jsx';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const AddStaff = () => {
    const [errors, setErrors] = useState({});
    const [staff, setStaff] = useState({
        firstName: '',
        midName: '',
        lastName: '',
        stafftype: '',
        dob: '',
        fileNumber: '',
        department: '',
        staffdateoffirstapt: '',
        phone: '',
        staffippissNumber: '',
        staffrank: '',
        staffsalgrade: '',
        staffdateofpresentapt: '',
        staffgender: '',
        stafforigin: '',
        localgovorigin: '',
        qualification: '',
        confirmation_status: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const validateInput = (name, value) => {
        switch(name) {
            case 'firstName':
                if (!value) {
                    return 'First Name is required';
                } else if (!value.trim()) {
                    return 'First Name cannot be empty';
                }
                break;
            case 'lastName':
                if (!value) {
                    return 'Last Name is required';
                } else if (!value.trim()) {
                    return 'Last Name cannot be empty';
                }
                break;
            case 'stafftype':
                if (!value) {
                    return 'Staff Type is required';
                } 
                break;
            case 'dob':
                if (!value) {
                    return 'Date of Birth is required';
                }
                const birthDate = new Date(value);
                const currentDate = new Date();
                let age = currentDate.getFullYear() - birthDate.getFullYear();
                const m = currentDate.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && currentDate.getDate() < birthDate.getDate())) {
                    age--;
                }
                if (age < 18) {
                    return 'Staff must be at least 18 years old';
                }
                break;
            case 'fileNumber':
                if (!value) {
                    return 'File Number is required';
                }
                break;
            case 'department':
                if (!value) {
                    return 'Department is required';
                }
                break;
            case 'staffdateoffirstapt':
                if (!value) {
                    return 'Date of First Appointment is required';
                }
                break;
            case 'phone':
                if (!value) {
                    return 'Phone Number is required';
                }
                const sanitizedPhone = value.replace(/\D/g, '');
                if (!/^\d{11}$/.test(sanitizedPhone)) {
                    return 'Phone number must be 11 digits';
                }
                break;
            case 'staffippissNumber':
                if (!value) {
                    return 'IPPISS Number is required';
                }
                if (!/^\d+$/.test(value)) {
                    return 'IPPISS number must contain only digits';
                }
                break;
            case 'staffrank':
                if (!value) {
                    return 'Staff Rank is required';
                }
                break;
            case 'staffsalgrade':
                if (!value) {
                    return 'Salary Grade is required';
                }
                break;
            case 'staffdateofpresentapt':
                if (!value) {
                    return 'Date of Present Appointment is required';
                }
                break;
            case 'staffgender':
                if (!value) {
                    return 'Gender is required';
                }
                break;
            case 'stafforigin':
                if (!value) {
                    return 'State of Origin is required';
                }
                break;
            case 'localgovorigin':
                if (!value) {
                    return 'Local Government of Origin is required';
                }
                break;
            case 'qualification':
                if (!value) {
                    return 'Qualification is required';
                }
                break;
            case 'confirmation_status':
                if (!value) {
                    return 'Confirmation Status is required';
                }
                break;
            default:
                return '';
        }
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStaff(prevState => ({
            ...prevState,
            [name]: value
        }));

        // Validate on change
        const error = validateInput(name, value);
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: error
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(staff).forEach(key => {
            const error = validateInput(key, staff[key]);
            if (error) {
                newErrors[key] = error;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
            const response = await axios.post('/api/add_staff', staff);
            if (response.data.success) {
                setSuccess('Staff added successfully');
                // Reset form
                setStaff({
                    firstName: '',
                    midName: '',
                    lastName: '',
                    stafftype: '',
                    dob: '',
                    fileNumber: '',
                    department: '',
                    staffdateoffirstapt: '',
                    phone: '',
                    staffippissNumber: '',
                    staffrank: '',
                    staffsalgrade: '',
                    staffdateofpresentapt: '',
                    staffgender: '',
                    stafforigin: '',
                    localgovorigin: '',
                    qualification: '',
                    confirmation_status: ''
                });
            } else {
                setError(response.data.message || 'An unknown error occurred');
            }
        } catch (error) {
            console.error('Add staff error:', error);
            setError(error.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex justify-center min-h-screen bg-gray-50'>
            <Sidebar />
            <div className='flex-1 p-6 max-w-7xl mx-auto'>
                <h1 className='text-3xl font-bold text-gray-900 mb-6'>Add Staff</h1>
                
                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-green-700">{success}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-red-700">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className='bg-white shadow-sm rounded-lg p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label htmlFor='firstName' className="block text-sm font-medium text-gray-700 mb-1">
                                First Name *
                            </label>
                            <input
                                type='text'
                                name='firstName'
                                id='firstName'
                                value={staff.firstName}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder='Enter First Name'
                            />
                            {errors.firstName && (
                                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='midName' className="block text-sm font-medium text-gray-700 mb-1">
                                Middle Name
                            </label>
                            <input
                                type='text'
                                name='midName'
                                id='midName'
                                value={staff.midName}
                                onChange={handleChange}
                                className='w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                                placeholder='Enter Middle Name (Optional)'
                            />
                        </div>

                        <div>
                            <label htmlFor='lastName' className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name *
                            </label>
                            <input
                                type='text'
                                name='lastName'
                                id='lastName'
                                value={staff.lastName}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder='Enter Last Name'
                            />
                            {errors.lastName && (
                                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='staffgender' className="block text-sm font-medium text-gray-700 mb-1">
                                Gender *
                            </label>
                            <select
                                name='staffgender'
                                id='staffgender'
                                value={staff.staffgender}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.staffgender ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            >
                                <option value='' disabled>Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            {errors.staffgender && (
                                <p className="mt-1 text-sm text-red-600">{errors.staffgender}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='stafftype' className="block text-sm font-medium text-gray-700 mb-1">
                                Staff Type *
                            </label>
                            <select
                                name='stafftype'
                                id='stafftype'
                                value={staff.stafftype}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.stafftype ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            >
                                <option value='' disabled>Select Staff Type</option>
                                <option value='JSA'>Junior Staff (JSA)</option>
                                <option value='SSA'>Senior Staff (SSA)</option>
                            </select>
                            {errors.stafftype && (
                                <p className="mt-1 text-sm text-red-600">{errors.stafftype}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='dob' className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth *
                            </label>
                            <input
                                type='date'
                                name='dob'
                                id='dob'
                                value={staff.dob}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.dob ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {errors.dob && (
                                <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='fileNumber' className="block text-sm font-medium text-gray-700 mb-1">
                                File Number *
                            </label>
                            <input
                                type='text'
                                name='fileNumber'
                                id='fileNumber'
                                value={staff.fileNumber}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.fileNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder='Enter File Number'
                            />
                            {errors.fileNumber && (
                                <p className="mt-1 text-sm text-red-600">{errors.fileNumber}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='department' className="block text-sm font-medium text-gray-700 mb-1">
                                Department *
                            </label>
                            <input
                                type='text'
                                name='department'
                                id='department'
                                value={staff.department}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.department ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder='Enter Department'
                            />
                            {errors.department && (
                                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='staffdateoffirstapt' className="block text-sm font-medium text-gray-700 mb-1">
                                Date of First Appointment *
                            </label>
                            <input
                                type='date'
                                name='staffdateoffirstapt'
                                id='staffdateoffirstapt'
                                value={staff.staffdateoffirstapt}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.staffdateoffirstapt ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {errors.staffdateoffirstapt && (
                                <p className="mt-1 text-sm text-red-600">{errors.staffdateoffirstapt}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='phone' className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type='text'
                                name='phone'
                                id='phone'
                                value={staff.phone}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder='Enter Phone Number'
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='staffippissNumber' className="block text-sm font-medium text-gray-700 mb-1">
                                IPPISS Number *
                            </label>
                            <input
                                type='text'
                                name='staffippissNumber'
                                id='staffippissNumber'
                                value={staff.staffippissNumber}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.staffippissNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder='Enter IPPISS Number'
                            />
                            {errors.staffippissNumber && (
                                <p className="mt-1 text-sm text-red-600">{errors.staffippissNumber}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='staffrank' className="block text-sm font-medium text-gray-700 mb-1">
                                Staff Rank *
                            </label>
                            <input
                                type='text'
                                name='staffrank'
                                id='staffrank'
                                value={staff.staffrank}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.staffrank ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder='Enter Staff Rank'
                            />
                            {errors.staffrank && (
                                <p className="mt-1 text-sm text-red-600">{errors.staffrank}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='staffsalgrade' className="block text-sm font-medium text-gray-700 mb-1">
                                Salary Grade *
                            </label>
                            <input
                                type='text'
                                name='staffsalgrade'
                                id='staffsalgrade'
                                value={staff.staffsalgrade}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.staffsalgrade ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder='Enter Salary Grade'
                            />
                            {errors.staffsalgrade && (
                                <p className="mt-1 text-sm text-red-600">{errors.staffsalgrade}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='staffdateofpresentapt' className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Present Appointment *
                            </label>
                            <input
                                type='date'
                                name='staffdateofpresentapt'
                                id='staffdateofpresentapt'
                                value={staff.staffdateofpresentapt}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.staffdateofpresentapt ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {errors.staffdateofpresentapt && (
                                <p className="mt-1 text-sm text-red-600">{errors.staffdateofpresentapt}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='stafforigin' className="block text-sm font-medium text-gray-700 mb-1">
                                State of Origin *
                            </label>
                            <input
                                type='text'
                                name='stafforigin'
                                id='stafforigin'
                                value={staff.stafforigin}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.stafforigin ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder='Enter State of Origin'
                            />
                            {errors.stafforigin && (
                                <p className="mt-1 text-sm text-red-600">{errors.stafforigin}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='localgovorigin' className="block text-sm font-medium text-gray-700 mb-1">
                                Local Government of Origin *
                            </label>
                            <input
                                type='text'
                                name='localgovorigin'
                                id='localgovorigin'
                                value={staff.localgovorigin}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.localgovorigin ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder='Enter Local Government of Origin'
                            />
                            {errors.localgovorigin && (
                                <p className="mt-1 text-sm text-red-600">{errors.localgovorigin}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='qualification' className="block text-sm font-medium text-gray-700 mb-1">
                                Qualification *
                            </label>
                            <input
                                type='text'
                                name='qualification'
                                id='qualification'
                                value={staff.qualification}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.qualification ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder='Enter Qualification'
                            />
                            {errors.qualification && (
                                <p className="mt-1 text-sm text-red-600">{errors.qualification}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor='confirmation_status' className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmation Status *
                            </label>
                            <select
                                name='confirmation_status'
                                id='confirmation_status'
                                value={staff.confirmation_status}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.confirmation_status ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            >
                                <option value='' disabled>Select Confirmation Status</option>
                                <option value='confirmed'>Confirmed</option>
                                <option value='not_confirmed'>Not Confirmed</option>
                            </select>
                            {errors.confirmation_status && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmation_status}</p>
                            )}
                        </div>

                        <div className="md:col-span-2 flex justify-end mt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                                ${loading ? 'opacity-75 cursor-not-allowed' : ''} transition-colors duration-200`}
                            >
                                {loading ? 'Adding Staff...' : 'Add Staff'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaff;
                                