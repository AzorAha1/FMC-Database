import React, { useEffect, useState } from 'react'
import { Dialog } from '../components/ui/dialog'

const EditStaff = ({staff, isOpen, onClose, onSave}) => {
    const [formData, setFormData] = useState({
        firstName: staff?.firstName || '',
        midName: staff?.midName || '',
        lastName: staff?.lastName || '',
        dob: staff?.dob || '',
        fileNumber: staff?.fileNumber || '',
        department: staff?.department || '',
        phone: staff?.phone || '',
        staffippissNumber: staff?.staffippissNumber || '',
        staffrank: staff?.staffrank || '',
        staffsalgrade: staff?.staffsalgrade || '',
        staffdateofpresentapt: staff?.staffdateofpresentapt || '',
        staffgender: staff?.staffgender || '',
        stafforigin: staff?.stafforigin || '',
        localgovorigin: staff?.localgovorigin || '',
        qualification: staff?.qualification || ''
    });
    
    // Update formData when staff prop changes
    useEffect(() => {
        setFormData({
            firstName: staff?.firstName || '',
            midName: staff?.midName || '',
            lastName: staff?.lastName || '',
            dob: staff?.dob || '',
            fileNumber: staff?.fileNumber || '',
            department: staff?.department || '',
            phone: staff?.phone || '',
            staffippissNumber: staff?.staffippissNumber || '',
            staffrank: staff?.staffrank || '',
            staffsalgrade: staff?.staffsalgrade || '',
            staffdateofpresentapt: staff?.staffdateofpresentapt || '',
            staffgender: staff?.staffgender || '',
            stafforigin: staff?.stafforigin || '',
            localgovorigin: staff?.localgovorigin || '',
            qualification: staff?.qualification || ''
        });
    }, [staff]);
    
    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold">Edit Staff Details</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Personal Information */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                                <input
                                    type="text"
                                    name="midName"
                                    value={formData.midName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">File Number</label>
                                <input
                                    type="text"
                                    name="fileNumber"
                                    value={formData.fileNumber}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">IPPIS Number</label>
                                <input
                                    type="text"
                                    name="staffippissNumber"
                                    value={formData.staffippissNumber}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rank</label>
                                <input
                                    type="text"
                                    name="staffrank"
                                    value={formData.staffrank}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Salary Grade</label>
                                <input
                                    type="text"
                                    name="staffsalgrade"
                                    value={formData.staffsalgrade}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Present Appointment</label>
                                <input
                                    type="date"
                                    name="staffdateofpresentapt"
                                    value={formData.staffdateofpresentapt}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select
                                    name="staffgender"
                                    value={formData.staffgender}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">State of Origin</label>
                                <input
                                    type="text"
                                    name="stafforigin"
                                    value={formData.stafforigin}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">LGA of Origin</label>
                                <input
                                    type="text"
                                    name="localgovorigin"
                                    value={formData.localgovorigin}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Qualification</label>
                                <input
                                    type="text"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Dialog>
    );    
}

export default EditStaff