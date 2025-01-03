import React, { useState, useEffect } from "react";
import axios from "./api/axios.js";
import Sidebar from "./Sidebar.jsx";

const StaffTable = () => {
  const [staffData, setStaffData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await axios.get("/api/liststaffs");
        setStaffData(response.data.staff || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  const handleEdit = (staffId) => {
    console.log("Edit staff with ID:", staffId);
  };

  const handleDelete = async (staffId) => {
    try {
      await axios.delete(`/api/staff/${staffId}`);
      setStaffData(staffData.filter((staff) => staff.staff_id !== staffId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-grow p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-red-600 mb-2">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : staffData.length ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Permanent & Pensionable Staff Records</h2>
                <p className="text-gray-600 mt-1">Total Staff: {staffData.length}</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S/N</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {staffData.map((staff, index) => (
                      <tr key={staff.staff_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {`${staff.firstName} ${staff.midName} ${staff.lastName}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.stafftype}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.staffrank}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.staffsalgrade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <button
                            onClick={() => handleEdit(staff.staff_id)}
                            className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(staff.staff_id)}
                            className="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <p className="text-gray-500 text-lg">No staff records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffTable;