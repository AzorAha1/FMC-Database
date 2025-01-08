import React, { useState, useEffect } from 'react';
import axios from './api/axios';
import Sidebar from './Sidebar.jsx';

const Promotion = () => {
    const [promotionData, setPromotionData] = useState([]);
    const [eligibleStaff, setEligibleStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'eligible'

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [promotionResponse, eligibleResponse] = await Promise.all([
                    axios.get('/api/promotion'),
                    axios.get('/api/eligible-promotions')
                ]);

                if (promotionResponse.data.success && eligibleResponse.data.success) {
                    setPromotionData(promotionResponse.data.data);
                    setEligibleStaff(eligibleResponse.data.data);
                    setError(null);
                } else {
                    setError('Failed to fetch promotion data');
                }
            } catch (error) {
                setError(error.message || 'An error occurred while fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const displayData = activeTab === 'all' ? promotionData : eligibleStaff;

    if (loading) {
        return (
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-xl font-semibold">Loading promotion data...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-red-500 text-xl font-semibold">
                        Error: {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Promotion Eligibility</h1>
                    {eligibleStaff.length > 0 && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-yellow-500">⚠️</span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        {eligibleStaff.length} staff member(s) eligible for promotion
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex">
                            <button
                                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'all'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                                onClick={() => setActiveTab('all')}
                            >
                                All Staff ({promotionData.length})
                            </button>
                            <button
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'eligible'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                                onClick={() => setActiveTab('eligible')}
                            >
                                Eligible for Promotion ({eligibleStaff.length})
                            </button>
                        </nav>
                    </div>
                </div>

                {displayData.length === 0 ? (
                    <div className="text-gray-600 text-lg">
                        No {activeTab === 'eligible' ? 'eligible ' : ''}staff found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Staff Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Eligibility Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayData.map((staff) => {
                                    const isEligible = eligibleStaff.some(
                                        (eligible) => eligible._id === staff._id
                                    );
                                    return (
                                        <tr 
                                            key={staff._id || staff.staff_id} 
                                            className={`hover:bg-gray-50 transition-colors ${
                                                isEligible ? 'bg-green-50' : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {`${staff.firstName || ''} ${staff.midName || ''} ${staff.lastName || ''}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {staff.stafftype}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {staff.promotion_eligibility_date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    isEligible
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {isEligible ? 'Eligible' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => {
                                                        alert(`${staff.firstName} is ${isEligible ? 'eligible' : 'not yet eligible'} for promotion. ${isEligible ? 'Eligibility date: ' + staff.promotion_eligibility_date : ''}`);
                                                    }}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                >
                                                    Check Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Promotion;