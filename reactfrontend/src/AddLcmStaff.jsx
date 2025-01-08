import React, { useState } from 'react';
import axios from './api/axios.js';
import Sidebar from './Sidebar.jsx';
import { AlertCircle, CheckCircle2, UserPlus, ChevronRight } from 'lucide-react';

const AddLcmStaff = () => {
    const [errors, setErrors] = useState({});
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedStep, setSelectedStep] = useState('');
    const staffLevels = {
        JSA: Array.from({ length: 6 }, (_, i) => i + 1), // CONHESS 1-6
        SSA: Array.from({ length: 9 }, (_, i) => i + 7)  // CONHESS 7-15
    };

    const steps = Array.from({ length: 10 }, (_, i) => i + 1); // Steps 1-10
    const [staff, setStaff] = useState({
        stafffirstName: '',
        staffmidName: '',
        stafflastName: '',
        staffdob: '',
        filenumber: '',
        staffDepartment: '',
        staffdoa: '',
        staffphone: '',
        staffType: '',
        conhessLevel: '',
        salary: '',
        qualification: '',
        gender: '',
        rank: '',
        stateOfOrigin: '',
        localGovernment: '',
        profilePicture: null
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handlefileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024 * 5) {
                setError('File size should not exceed 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('File format not supported. Please upload a JPEG or PNG image');
                return;
            }
            setStaff(prevState => ({
                ...prevState,
                profilePicture: file
            }));
        }
    };

    const validateInput = (name, value) => {
        switch(name) {
            case 'stafffirstName':
                return !value.trim() ? 'First Name is required' : '';
            case 'stafflastName':
                return !value.trim() ? 'Last Name is required' : '';
            case 'staffType':
                return !value ? 'Staff Type is required' : '';
            case 'staffdob':
                if (!value) return 'Date of Birth is required';
                const birthDate = new Date(value);
                const currentDate = new Date();
                let age = currentDate.getFullYear() - birthDate.getFullYear();
                const m = currentDate.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && currentDate.getDate() < birthDate.getDate())) {
                    age--;
                }
                return age < 18 ? 'Staff must be at least 18 years old' : '';
            case 'filenumber':
                return !value.trim() ? 'File Number is required' : '';
            case 'staffDepartment':
                return !value.trim() ? 'Department is required' : '';
            case 'staffdoa':
                return !value ? 'Date of Appointment is required' : '';
            case 'staffphone':
                if (!value) return 'Phone Number is required';
                const sanitizedPhone = value.replace(/\D/g, '');
                return !/^\d{11}$/.test(sanitizedPhone) ? 'Phone number must be 11 digits' : '';
            case 'rank':
                return !value.trim() ? 'Staff Rank is required' : '';
            case 'gender':
                return !value ? 'Gender is required' : '';
            case 'stateOfOrigin':
                return !value.trim() ? 'State of Origin is required' : '';
            case 'localGovernment':
                return !value.trim() ? 'Local Government is required' : '';

            case 'qualification':
                return !value.trim() ? 'Qualification is required' : '';
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
            Object.keys(staff).forEach(key => {
                if (key === 'profilePicture' && staff[key]) {
                    formData.append('profilePicture', staff[key]);
                } else if (staff[key]) {
                    formData.append(key, staff[key]);
                }
            });

            const response = await axios.post('/api/add_lcm_staff', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data.success) {
                setSuccess('Staff added successfully');
                setStaff({
                    stafffirstName: '',
                    staffmidName: '',
                    stafflastName: '',
                    staffdob: '',
                    filenumber: '',
                    staffDepartment: '',
                    staffdoa: '',
                    staffphone: '',
                    staffType: '',
                    conhessLevel: '',
                    salary: '',
                    qualification: '',
                    gender: '',
                    rank: '',
                    stateOfOrigin: '',
                    localGovernment: '',
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
                            <label htmlFor="stafffirstName" className="block text-sm font-medium text-gray-700 mb-1">
                                First Name *
                            </label>
                            <input
                                type="text"
                                name="stafffirstName"
                                id="stafffirstName"
                                value={staff.stafffirstName}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.stafffirstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="Enter First Name"
                            />
                            {errors.stafffirstName && (
                                <p className="mt-1 text-sm text-red-600">{errors.stafffirstName}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="staffmidName" className="block text-sm font-medium text-gray-700 mb-1">
                                Middle Name
                            </label>
                            <input
                                type="text"
                                name="staffmidName"
                                id="staffmidName"
                                value={staff.staffmidName}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter Middle Name (Optional)"
                            />
                        </div>

                        <div>
                            <label htmlFor="stafflastName" className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                name="stafflastName"
                                id="stafflastName"
                                value={staff.stafflastName}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.stafflastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="Enter Last Name"
                            />
                            {errors.stafflastName && (
                                <p className="mt-1 text-sm text-red-600">{errors.stafflastName}</p>
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
                            <label htmlFor="staffdob" className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth *
                            </label>
                            <input
                                type="date"
                                name="staffdob"
                                id="staffdob"
                                value={staff.staffdob}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.staffdob ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            />
                            {errors.staffdob && (
                                <p className="mt-1 text-sm text-red-600">{errors.staffdob}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="conhessLevel" className="block text-sm font-medium text-gray-700 mb-1">
                                CONHESS Level *
                            </label>
                            <select
                                name="conhessLevel"
                                id="conhessLevel"
                                value={selectedLevel}
                                onChange={(e) => {
                                    setSelectedLevel(e.target.value);
                                    setStaff(prev => ({
                                        ...prev,
                                        salary: `CONHESS ${e.target.value}/${selectedStep || ''}`,
                                        conhessLevel: `CONHESS ${e.target.value}`,
                                    }));
                                }}
                                className={`w-full p-2 border ${errors.conhessLevel ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                disabled={!staff.staffType}
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
                            <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                                Step *
                            </label>
                            <select
                                name="salary"
                                id="salary"
                                value={selectedStep}
                                onChange={(e) => {
                                    setSelectedStep(e.target.value);
                                    setStaff(prev => ({
                                        ...prev,
                                        salary: `CONHESS ${selectedLevel}/${e.target.value}`,
                                    }));
                                }}
                                className={`w-full p-2 border ${errors.salary ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                disabled={!selectedLevel}
                            ><option value="">Select Step</option>
                            {steps.map((step) => (
                                <option key={step} value={step}>
                                    Step {step}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="staffDepartment" className="block text-sm font-medium text-gray-700 mb-1">
                            Department *
                        </label>
                        <input
                            type="text"
                            name="staffDepartment"
                            id="staffDepartment"
                            value={staff.staffDepartment}
                            onChange={handleChange}
                            className={`w-full p-2 border ${errors.staffDepartment ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="Enter Department"
                        />
                        {errors.staffDepartment && (
                            <p className="mt-1 text-sm text-red-600">{errors.staffDepartment}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="staffdoa" className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Appointment *
                        </label>
                        <input
                            type="date"
                            name="staffdoa"
                            id="staffdoa"
                            value={staff.staffdoa}
                            onChange={handleChange}
                            className={`w-full p-2 border ${errors.staffdoa ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.staffdoa && (
                            <p className="mt-1 text-sm text-red-600">{errors.staffdoa}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="staffphone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                        </label>
                        <input
                            type="text"
                            name="staffphone"
                            id="staffphone"
                            value={staff.staffphone}
                            onChange={handleChange}
                            className={`w-full p-2 border ${errors.staffphone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="Enter Phone Number"
                        />
                        {errors.staffphone && (
                            <p className="mt-1 text-sm text-red-600">{errors.staffphone}</p>
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
                        <label htmlFor="filenumber" className="block text-sm font-medium text-gray-700 mb-1">
                            File Number *
                        </label>
                        <input
                            type="text"
                            name="filenumber"
                            id="filenumber"
                            value={staff.filenumber}
                            onChange={handleChange}
                            className={`w-full p-2 border ${errors.filenumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="Enter File Number"
                        />
                        {errors.filenumber && (
                            <p className="mt-1 text-sm text-red-600">{errors.filenumber}</p>
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

export default AddLcmStaff;