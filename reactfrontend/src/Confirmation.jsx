import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";
import axios from "./api/axios.js";
import { User } from "lucide-react";

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
            console.log("Backend response:", response.data); // Log the response
            const staffWithFullUrls = response.data.data.map(staff => ({
                ...staff,
                profilePicture: staff.profilePicture 
                    ? `${axios.defaults.baseURL}${staff.profilePicture}`
                    : null
            }));
            setStaffList(staffWithFullUrls);
            setTotalPages(response.data.totalPages);
            setTotalStaff(response.data.totalStaffs);
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

    // Filter staff based on their confirmation status
    const pendingStaff = staffList.filter((staff) => staff.confirmation_status === 'pending');
    const awaitingConfirmationStaff = staffList.filter((staff) => staff.confirmation_status === 'awaiting_confirmation');
    const confirmedStaff = staffList.filter((staff) => staff.confirmation_status === 'confirmed');

    const StaffCard = ({ staff, isPending, isAwaitingConfirmation, getStaffsfromendpoint }) => {
        console.log("Staff data:", staff); // Log the staff data
        const [imageError, setImageError] = useState(false);

        const handleImageError = (e) => {
            setImageError(true);
            e.target.onerror = null;
        };

        const ProfileImage = () => {
            if (!staff.profilePicture || imageError) {
                return (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <User className="w-12 h-12 text-gray-400" />
                    </div>
                );
            }

            return (
                <img
                    src={staff.profilePicture}
                    alt={`${staff.firstName} ${staff.lastName}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                />
            );
        };

        // Handle Confirm Staff
        const handleConfirmStaff = async (staffId) => {
            try {
                const response = await axios.post(`/api/confirm_staff/${staffId}`);
                if (response.status !== 200) {
                    throw new Error(response.data.error || 'Failed to confirm staff');
                }
                console.log('Confirmation successful:', response.data.message);
                getStaffsfromendpoint(); // Refresh the staff list
            } catch (error) {
                console.error('Confirmation error:', error.message);
            }
        };

        
        return (
            <div className="relative p-6 mb-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-6">
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border">
                            <ProfileImage />
                        </div>
                    </div>
                    <div className="flex-grow grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {staff.firstName} {staff.midName} {staff.lastName}
                            </h3>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Staff ID:</span> {staff.staff_id}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">File Number:</span> {staff.fileNumber}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Department:</span> {staff.department}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Staff Type:</span> {staff.stafftype}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Grade Level:</span> {staff.conhessLevel}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Salary Grade:</span> {staff.staffsalgrade}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Rank:</span> {staff.staffrank}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">First Appointment:</span>{" "}
                                {new Date(staff.staffdateoffirstapt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Present Appointment:</span>{" "}
                                {new Date(staff.staffdateofpresentapt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Indicators */}
                {isPending ? (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                        {staff.daysUntilConfirmation} days left
                    </div>
                ) : isAwaitingConfirmation ? (
                    <div className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full">

                        <button
                            onClick={() => handleConfirmStaff(staff.staff_id)}
                            className="ml-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Confirm
                        </button>
                    </div>
                ) : (
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                        Confirmed
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 bg-red-50 rounded-md">
                {error}
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Staff Confirmation Status</h1>
                    
                    {/* Tab Navigation */}
                    <div className="flex gap-4 mb-6">
                        <button
                            className={`px-4 py-2 rounded-lg ${
                                activeTab === "pending"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700"
                            }`}
                            onClick={() => setActiveTab("pending")}
                        >
                            Pending ({pendingStaff.length})
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg ${
                                activeTab === "awaiting_confirmation"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700"
                            }`}
                            onClick={() => setActiveTab("awaiting_confirmation")}
                        >
                            Awaiting Confirmation ({awaitingConfirmationStaff.length})
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg ${
                                activeTab === "confirmed"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700"
                            }`}
                            onClick={() => setActiveTab("confirmed")}
                        >
                            Confirmed ({confirmedStaff.length})
                        </button>
                    </div>

                    {/* Staff List */}
                    <div className="space-y-4">
                        {activeTab === "pending"
                            ? pendingStaff.map((staff) => (
                                  <StaffCard
                                      key={staff.staff_id}
                                      staff={staff}
                                      isPending={true}
                                      isAwaitingConfirmation={false}
                                      getStaffsfromendpoint={getStaffsfromendpoint} // Pass the function
                                  />
                              ))
                            : activeTab === "awaiting_confirmation"
                            ? awaitingConfirmationStaff.map((staff) => (
                                  <StaffCard
                                      key={staff.staff_id}
                                      staff={staff}
                                      isPending={false}
                                      isAwaitingConfirmation={true}
                                      getStaffsfromendpoint={getStaffsfromendpoint} // Pass the function
                                  />
                              ))
                            : confirmedStaff.map((staff) => (
                                  <StaffCard
                                      key={staff.staff_id}
                                      staff={staff}
                                      isPending={false}
                                      isAwaitingConfirmation={false}
                                      getStaffsfromendpoint={getStaffsfromendpoint} // Pass the function
                                  />
                              ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center gap-2 mt-6">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Confirmation;