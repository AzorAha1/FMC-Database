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
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  const handleEdit = (staffId) => {
    console.log("Edit staff with ID:", staffId);
    // Implement navigation or modal
  };

  const handleDelete = async (staffId) => {
    console.log("Delete staff with ID:", staffId);
    try {
      await axios.delete(`/api/staff/${staffId}`);
      setStaffData(staffData.filter((staff) => staff.staff_id !== staffId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="flex h-screen">
        <Sidebar />
      {/* Main Content */}
      <div className="flex-grow p-6 bg-gray-100 overflow-auto">
        {isLoading ? (
          <div className="text-center text-lg">Loading staff data...</div>
        ) : error ? (
          <div className="text-center text-red-500 mb-4">
            Error: {error}
            <button
              onClick={() => window.location.reload()}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : staffData.length ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">Permanent Staff Records</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold border-b">Name</th>
                    <th className="px-4 py-2 text-left font-semibold border-b">Staff Type</th>
                    <th className="px-4 py-2 text-left font-semibold border-b">Department</th>
                    <th className="px-4 py-2 text-left font-semibold border-b">Rank</th>
                    <th className="px-4 py-2 text-left font-semibold border-b">Grade</th>
                    <th className="px-4 py-2 text-center font-semibold border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffData.map((staff, index) => (
                    <tr key={staff.staff_id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b text-gray-600">
                        {`${staff.firstName} ${staff.midName} ${staff.lastName}`}
                      </td>
                      <td className="px-4 py-2 border-b text-gray-600">{staff.stafftype}</td>
                      <td className="px-4 py-2 border-b text-gray-600">{staff.department}</td>
                      <td className="px-4 py-2 border-b text-gray-600">{staff.staffrank}</td>
                      <td className="px-4 py-2 border-b text-gray-600">{staff.staffsalgrade}</td>
                      <td className="px-4 py-2 border-b text-center">
                        <button
                          onClick={() => handleEdit(staff.staff_id)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-full shadow-sm hover:bg-yellow-600 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(staff.staff_id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600"
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
          <div className="text-center text-gray-500">No staff records found.</div>
        )}
      </div>
    </div>
  );
};

export default StaffTable;