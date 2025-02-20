import React, { useState } from 'react';
import axios from './api/axios.js';
import Sidebar from './Sidebar.jsx';
import { AlertCircle, CheckCircle2, UserPlus, ChevronRight } from 'lucide-react';

const AddStaff = () => {
    const [errors, setErrors] = useState({});
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedStep, setSelectedStep] = useState('');
    const staffLevels = {
        JSA: Array.from({ length: 6 }, (_, i) => i + 2), // CONHESS 1-6
        SSA: Array.from({ length: 9 }, (_, i) => i + 7)  // CONHESS 7-15
    };

    const steps = Array.from({ length: 15 }, (_, i) => i + 1); // Steps 1-15
    const [staff, setStaff] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        staffType: '',
        dateOfBirth: '',
        fileNumber: '',
        department: '',
        dateOfFirstAppointment: '',
        dateOfPresentAppointment: '',
        phoneNumber: '',
        ippissNumber: '',
        rank: '',
        stateOfOrigin: '',
        qualification: '',
        localGovernment: '',
        salaryGrade: '',
        gender: '',
        conhessLevel: '',
        staffstep: '',
        profilePicture: null
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handlefileChange = (event) => {
        const file = event.target.files[0]
        if (file){
            if (file.size > 1024 * 1024 * 5) {
                setError('File size should not exceed 5MB');
                return;
            }
            if (!file.type.startsWith('image')) {
                setError('Only image files are allowed');
                return;
            }
            setStaff(prevState => ({
                ...prevState,
                profilePicture: file
            }))
        }
    }

    // Staff level configurations
    // const staffLevels = {
    //     JSA: Array.from({ length: 6 }, (_, i) => i + 1), // CONHESS 1-6
    //     SSA: Array.from({ length: 9 }, (_, i) => i + 7)  // CONHESS 7-15
    // };
    const validateInput = (name, value) => {
        switch(name) {
            case 'firstName':
                return !value.trim() ? 'First Name is required' : '';
            case 'lastName':
                return !value.trim() ? 'Last Name is required' : '';
            case 'staffType':
                return !value ? 'Staff Type is required' : '';
            case 'dateOfBirth':
                if (!value) return 'Date of Birth is required';
                const birthDate = new Date(value);
                const currentDate = new Date();
                let age = currentDate.getFullYear() - birthDate.getFullYear();
                const m = currentDate.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && currentDate.getDate() < birthDate.getDate())) {
                    age--;
                }
                return age < 18 ? 'Staff must be at least 18 years old' : '';
            case 'fileNumber':
                return !value.trim() ? 'File Number is required' : '';
            case 'department':
                return !value.trim() ? 'Department is required' : '';
            case 'dateOfFirstAppointment':
                return !value ? 'Date of First Appointment is required' : '';
            case 'phoneNumber':
                if (!value) return 'Phone Number is required';
                const sanitizedPhone = value.replace(/\D/g, '');
                return !/^\d{11}$/.test(sanitizedPhone) ? 'Phone number must be 11 digits' : '';
            case 'ippissNumber':
                if (!value) return 'IPPISS Number is required';
                return !/^\d+$/.test(value) ? 'IPPISS number must contain only digits' : '';
            case 'rank':
                return !value.trim() ? 'Staff Rank is required' : '';
            case 'salaryGrade':
                return !value.trim() ? 'Salary Grade is required' : '';
            case 'dateOfPresentAppointment':
                return !value ? 'Date of Present Appointment is required' : '';
            case 'gender':
                return !value ? 'Gender is required' : '';
            case 'stateOfOrigin':
                return !value.trim() ? 'State of Origin is required' : '';
            case 'localGovernment':
                return !value.trim() ? 'Local Government is required' : '';
            case 'qualification':
                return !value.trim() ? 'Qualification is required' : '';
            case 'staffLevel':
                return !value ? 'Staff Level is required' : '';
            case 'staffstep':
                return !value ? 'Staff Step is required' : '';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStaff(prevState => ({
            ...prevState,
            [name]: value
        }));

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

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     if (!validateForm()) {
    //         setError('Please fill all required fields correctly');
    //         return;
    //     }

    //     setLoading(true);
    //     setError(null);
    //     setSuccess(null);

    //     try {
    //         // Transform the data to match your API expectations
    //         const apiData = {
    //             stafffirstName: staff.firstName,
    //             staffmidName: staff.middleName,
    //             stafflastName: staff.lastName,
    //             stafftype: staff.staffType,
    //             staffdob: staff.dateOfBirth,
    //             fileNumber: staff.fileNumber,
    //             department: staff.department,
    //             staffdofa: staff.dateOfFirstAppointment, 
    //             staffdateofpresentapt: staff.dateOfPresentAppointment, 
    //             staffpno: staff.phoneNumber,
    //             staffippissNumber: staff.ippissNumber,
    //             staffrank: staff.rank,
    //             stafforigin: staff.stateOfOrigin,
    //             qualification: staff.qualification,
    //             localgovorigin: staff.localGovernment,
    //             staffsalgrade: staff.salaryGrade,
    //             staffgender: staff.gender,
    //             conhessLevel: staff.conhessLevel,
    //         };

    //         const response = await axios.post('/api/add_staff', apiData);
            
    //         if (response.data.success) {
    //             setSuccess('Staff added successfully');
    //             setStaff({
    //                 firstName: '',
    //                 middleName: '',
    //                 lastName: '',
    //                 staffType: '',
    //                 dateOfBirth: '',
    //                 fileNumber: '',
    //                 department: '',
    //                 dateOfFirstAppointment: '',
    //                 dateOfPresentAppointment: '',
    //                 phoneNumber: '',
    //                 ippissNumber: '',
    //                 rank: '',
    //                 stateOfOrigin: '',
    //                 qualification: '',
    //                 localGovernment: '',
    //                 salaryGrade: '',
    //                 gender: '',
    //             });
    //         } else {
    //             setError(response.data.message || 'An unknown error occurred');
    //         }
    //     } catch (error) {
    //         console.error('Add staff error:', error);
    //         setError(error.response?.data?.message || 'An error occurred. Please try again.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

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
            const formData = new FormData();
            
            // Map the frontend fields to backend expected fields
            const fieldMapping = {
                firstName: 'stafffirstName',
                middleName: 'staffmidName',
                lastName: 'stafflastName',
                staffType: 'stafftype',
                dateOfBirth: 'staffdob',
                fileNumber: 'fileNumber',
                department: 'department',
                dateOfFirstAppointment: 'staffdofa',
                dateOfPresentAppointment: 'staffdateofpresentapt',
                phoneNumber: 'staffpno',
                ippissNumber: 'staffippissNumber',
                rank: 'staffrank',
                stateOfOrigin: 'stafforigin',
                qualification: 'qualification',
                localGovernment: 'localgovorigin',
                salaryGrade: 'staffsalgrade',
                staffstep: 'staffstep',
                gender: 'staffgender',
                conhessLevel: 'conhessLevel'
            };
    
            // Add mapped fields to FormData
            Object.keys(staff).forEach(key => {
                if (key === 'profilePicture' && staff[key]) {
                    formData.append('profilePicture', staff[key]);
                } else if (staff[key] && fieldMapping[key]) {
                    formData.append(fieldMapping[key], staff[key]);
                    console.log(`Adding ${fieldMapping[key]}: ${staff[key]}`);
                }
            });
    
            const response = await axios.post('/api/add_staff', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data.success) {
                setSuccess('Staff added successfully');
                setStaff({
                    firstName: '',
                    middleName: '',
                    lastName: '',
                    staffType: '',
                    dateOfBirth: '',
                    fileNumber: '',
                    department: '',
                    dateOfFirstAppointment: '',
                    dateOfPresentAppointment: '',
                    phoneNumber: '',
                    ippissNumber: '',
                    rank: '',
                    stateOfOrigin: '',
                    qualification: '',
                    localGovernment: '',
                    salaryGrade: '',
                    gender: '',
                    staffstep: '',
                    conhessLevel: '',
                    profilePicture: null
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
        <div className="flex justify-center min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-6 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Staff</h1>
                
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

                <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                First Name *
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                id="firstName"
                                value={staff.firstName}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="Enter First Name"
                            />
                            {errors.firstName && (
                                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                                Middle Name
                            </label>
                            <input
                                type="text"
                                name="middleName"
                                id="middleName"
                                value={staff.middleName}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter Middle Name (Optional)"
                            />
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                id="lastName"
                                value={staff.lastName}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="Enter Last Name"
                            />
                            {errors.lastName && (
                                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                Gender *
                            </label>
                            <select
                                name="gender"
                                id="gender"
                                value={staff.gender}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            {errors.gender && (
                                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="staffType" className="block text-sm font-medium text-gray-700 mb-1">
                                Staff Type *
                            </label>
                            <select
                                name="staffType"
                                id="staffType"
                                value={staff.staffType}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.staffType ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            >
                                <option value="">Select Staff Type</option>
                                <option value="JSA">Junior Staff (JSA)</option>
                                <option value="SSA">Senior Staff (SSA)</option>
                            </select>
                            {errors.staffType && (
                                <p className="mt-1 text-sm text-red-600">{errors.staffType}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth *
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                id="dateOfBirth"
                                value={staff.dateOfBirth}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {errors.dateOfBirth && (
                                <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="salaryLevel" className="block text-sm font-medium text-gray-700 mb-1">
                                CONHESS Level *
                            </label>
                            <select
                                name="salaryLevel"
                                id="salaryLevel"
                                value={selectedLevel}
                                onChange={(e) => {
                                    setSelectedLevel(e.target.value);
                                    setStaff(prev => ({
                                        ...prev,
                                        salaryGrade: `CONHESS ${e.target.value}/${selectedStep || ''}`,
                                        conhessLevel: `CONHESS ${e.target.value}`,
                                    }));
                                }}
                                className={`w-full p-2 border ${errors.salaryGrade ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                disabled={!staff.staffType} // Disable until staff type is selected
                            >
                                <option value="">Select Level</option>
                                {staff.staffType && staffLevels[staff.staffType]?.map((level) => (
                                    <option key={level} value={level}>
                                        CONHESS {level}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="salaryStep" className="block text-sm font-medium text-gray-700 mb-1">
                                Step *
                            </label>
                            <select
                                name="salaryStep"
                                id="salaryStep"
                                value={selectedStep}
                                onChange={(e) => {
                                    setSelectedStep(e.target.value);
                                    setStaff(prev => ({
                                        ...prev,
                                        salaryGrade: `CONHESS ${selectedLevel}/${e.target.value}`,
                                        staffstep: e.target.value
                                    }));
                                }}
                                className={`w-full p-2 border ${errors.salaryGrade ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                disabled={!selectedLevel} // Disable until level is selected
                            >
                                <option value="">Select Step</option>
                                {steps.map((step) => (
                                    <option key={step} value={step}>
                                        Step {step}
                                    </option>
                                ))}
                            </select>
                        </div>
                        

                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                Department *
                            </label>
                            <input
                                type="text"
                                name="department"
                                id="department"
                                value={staff.department}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.department ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="Enter Department"
                            />
                            {errors.department && (
                                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="dateOfFirstAppointment" className="block text-sm font-medium text-gray-700 mb-1">
                                Date of First Appointment *
                            </label>
                            <input
                                type="date"
                                name="dateOfFirstAppointment"
                                id="dateOfFirstAppointment"
                                value={staff.dateOfFirstAppointment}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.dateOfFirstAppointment ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {errors.dateOfFirstAppointment && (
                                <p className="mt-1 text-sm text-red-600">{errors.dateOfFirstAppointment}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="text"
                                name="phoneNumber"
                                id="phoneNumber"
                                value={staff.phoneNumber}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="Enter Phone Number"
                            />
                            {errors.phoneNumber && (
                                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="ippissNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                IPPISS Number *
                            </label>
                            <input
                                type="text"
                                name="ippissNumber"
                                id="ippissNumber"
                                value={staff.ippissNumber}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.ippissNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="Enter IPPISS Number"
                            />
                            {errors.ippissNumber && (
                                <p className="mt-1 text-sm text-red-600">{errors.ippissNumber}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="rank" className="block text-sm font-medium text-gray-700 mb-1">
                                Staff Rank *
                            </label>
                            <input
                                type="text"
                                name="rank"
                                id="rank"
                                value={staff.rank}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.rank ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="Enter Staff Rank"
                            />
                            {errors.rank && (
                                <p className="mt-1 text-sm text-red-600">{errors.rank}</p>
                            )}
                        </div>
                        
                        <div>
                            <label htmlFor="fileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                File Number *
                            </label>
                            <input
                                type="text"
                                name="fileNumber"
                                id="fileNumber"
                                value={staff.fileNumber}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.fileNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="Enter File Number"
                            />
                            {errors.fileNumber && (
                                <p className="mt-1 text-sm text-red-600">{errors.fileNumber}</p>
                            )}
                        </div>
                        

                        <div>
                            <label htmlFor="dateOfPresentAppointment" className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Present Appointment *
                            </label>
                            <input
                                type="date"
                                name="dateOfPresentAppointment"
                                id="dateOfPresentAppointment"
                                value={staff.dateOfPresentAppointment}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.dateOfPresentAppointment ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {errors.dateOfPresentAppointment && (
                                <p className="mt-1 text-sm text-red-600">{errors.dateOfPresentAppointment}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="stateOfOrigin" className="block text-sm font-medium text-gray-700 mb-1">
                                State of Origin *
                            </label>
                            <input
                                type="text"
                                name="stateOfOrigin"
                                id="stateOfOrigin"
                                value={staff.stateOfOrigin}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.stateOfOrigin ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="Enter State of Origin"
                            />
                            {errors.stateOfOrigin && (
                                <p className="mt-1 text-sm text-red-600">{errors.stateOfOrigin}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="localGovernment" className="block text-sm font-medium text-gray-700 mb-1">
                                Local Government of Origin *
                            </label>
                            <input
                                type="text"
                                name="localGovernment"
                                id="localGovernment"
                                value={staff.localGovernment}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.localGovernment ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="Enter Local Government of Origin"
                            />
                            {errors.localGovernment && (
                                <p className="mt-1 text-sm text-red-600">{errors.localGovernment}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">
                                Qualification *
                            </label>
                            <input
                                type="text"
                                name="qualification"
                                id="qualification"
                                value={staff.qualification}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.qualification ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="Enter Qualification"
                            />
                            {errors.qualification && (
                                <p className="mt-1 text-sm text-red-600">{errors.qualification}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">
                                Profile Picture
                            </label>
                            <input
                                type="file"
                                name="profilePicture"
                                id="profilePicture"
                                onChange={handlefileChange}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
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