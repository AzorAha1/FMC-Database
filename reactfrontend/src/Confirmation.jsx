import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";
import axios from "./api/axios.js";

const Confirmation = () => {
    const [staffList, setStaffList] = useState([]);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("pending");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalStaff, setTotalStaff] = useState(0);
    const [loading, setLoading] = useState(false);

    const getStaffsfromendpoint = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/confirmation?page=${page}&limit=10`);
            setStaffList(response.data.data);
            setTotalPages(response.data.totalPages);
            setTotalStaff(response.data.totalStaff);
        } catch (err) {
            setError("Failed to fetch staff data. Please try again.");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getStaffsfromendpoint();
    }, [page]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const pendingStaff = staffList.filter((staff) => !staff.isEligible);
    const confirmedStaff = staffList.filter((staff) => staff.isEligible);

    const StaffCard = ({ staff, isPending }) => (
        <div className="relative p-4 mb-4 border rounded bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="grid grid-cols-2 gap-4">
                <p><strong>Staff ID:</strong> {staff.staff_id}</p>
                <p><strong>File Number:</strong> {staff.fileNumber}</p>
                <p><strong>Full Name:</strong> {staff.firstName} {staff.midName} {staff.lastName}</p>
                <p><strong>Grade:</strong> {staff.salaryLevel}</p>
                <p><strong>Staff Type:</strong> {staff.stafftype}</p>
                <p><strong>Date of First Appointment:</strong> {staff.dateoffirstapt}</p>
            </div>
            
            {isPending && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full m-3">
                    {staff.daysUntilConfirmation} days left
                </div>
            )}
        </div>
    );

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                    {error}
                    <button 
                        onClick={getStaffsfromendpoint}
                        className="ml-4 text-sm underline hover:no-underline"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-6 max-w-7xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Confirmation Status</h1>
                    <p className="text-gray-600">Total Staff: {totalStaff}</p>
                </div>
                
                <div className="flex border-b mb-6">
                    <button
                        className={`px-6 py-3 font-medium ${
                            activeTab === "pending"
                                ? "border-b-2 border-blue-500 text-blue-500"
                                : "text-gray-600 hover:text-blue-500"
                        }`}
                        onClick={() => setActiveTab("pending")}
                    >
                        Pending ({pendingStaff.length})
                    </button>
                    <button
                        className={`px-6 py-3 font-medium ${
                            activeTab === "confirmed"
                                ? "border-b-2 border-green-500 text-green-500"
                                : "text-gray-600 hover:text-green-500"
                        }`}
                        onClick={() => setActiveTab("confirmed")}
                    >
                        Confirmed ({confirmedStaff.length})
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-pulse text-gray-500">Loading...</div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeTab === "pending" ? (
                            pendingStaff.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No pending confirmations</p>
                            ) : (
                                pendingStaff.map(staff => (
                                    <StaffCard key={staff.staff_id} staff={staff} isPending={true} />
                                ))
                            )
                        ) : (
                            confirmedStaff.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No confirmed staff members</p>
                            ) : (
                                confirmedStaff.map(staff => (
                                    <StaffCard key={staff.staff_id} staff={staff} isPending={false} />
                                ))
                            )
                        )}
                    </div>
                )}

                <div className="flex justify-center items-center mt-6 gap-4">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1 || loading}
                        className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 bg-white border rounded">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages || loading}
                        className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Confirmation;