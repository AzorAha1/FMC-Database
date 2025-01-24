import React, { useState, useEffect } from "react";
import axios from "./api/axios.js";
import Sidebar from "./Sidebar.jsx";
import EditLcmStaff from "./EditLcmStaff.jsx";
import { Button } from 'antd';
import { Search } from 'lucide-react';
import { DownloadOutlined } from '@ant-design/icons';

const LcmStaffTable = () => {
  const [lcmStaffData, setLcmStaffData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isEditWindowOpen, setIsEditWindowOpen] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLcmStaffData = async () => {
      try {
        const response = await axios.get("/api/list_lcm_staff");
        setLcmStaffData(response.data.staff || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLcmStaffData();
  }, []);

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setIsEditWindowOpen(true);
  };

  const handleExport = () => {
    // Create the CSV headers
    const headers = ['Full Name', 'Staff Number', 'Staff Rank', 'Department', 'Salary Grade'].join(',');
  
    // Create the CSV rows
    const rows = filteredStaff.map((staff) => [
      `${staff.firstName} ${staff.midName} ${staff.lastName}`,
      `${staff.staffType}-${staff.fileNumber}`,
      staff.rank,
      staff.department,
      staff.salaryGrade
    ].join(','));
  
    // Combine headers and rows into a single CSV string
    const csvData = [headers, ...rows].join('\n');
  
    // Create a Blob with the CSV data
    const blob = new Blob([csvData], { type: 'text/csv' });
  
    // Create a URL for the Blob
    const url = window.URL.createObjectURL(blob);
  
    // Create a link element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `List-of-lcm-staffs-${new Date().toISOString().split('T')[0]}.csv`; // Format the date as YYYY-MM-DD
    a.click();
  
    // Revoke the URL to free up memory
    window.URL.revokeObjectURL(url);
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      const editedData = { ...updatedData, lcmstaff_id: editingStaff.lcmstaff_id };

      await axios.put(`/api/manage_lcm_staff/${editingStaff.lcmstaff_id}`, editedData);

      const updatedStaffRecord = {
        ...editingStaff,
        ...updatedData,
      };

      setLcmStaffData(lcmStaffData.map((staff) =>
        staff.lcmstaff_id === editingStaff.lcmstaff_id ? updatedStaffRecord : staff
      ));

      setIsEditWindowOpen(false);
      setEditingStaff(null);
    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  const handleDelete = async (staffId) => {
    if (window.confirm("Are you sure you want to delete this LCM staff record?")) {
      try {
        await axios.delete(`/api/manage_lcm_staff/${staffId}`);

        setLcmStaffData(lcmStaffData.filter((staff) => staff.lcmstaff_id !== staffId));
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredStaff = lcmStaffData.filter((staff) =>
    `${staff.firstName} ${staff.midName} ${staff.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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
          ) : lcmStaffData.length ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">LCM Staff Records</h2>
                <p className="text-gray-600 mt-1">Total Staff: {lcmStaffData.length}</p>
              </div>
              {/* Search Bar */}
              <div className="flex gap-4 mb-6 p-4 border-b border-gray-200">
                {/* Search Input with Icon */}
                <div className="flex-grow flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                  <Search className="h-5 w-5 text-gray-400 ml-3" /> {/* Icon */}
                  <input
                    type="text"
                    placeholder="Search staff by name..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-2 pr-4 py-2 w-full focus:outline-none rounded-lg"
                    aria-label="Search staff by name"
                  />
                </div>

                {/* Export Button */}
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <DownloadOutlined className="mr-2" />
                  Export
                </button>
              </div>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S/N</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStaff.map((staff, index) => (
                      <tr key={staff.lcmstaff_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {`${staff.firstName || ""} ${staff.midName || ""} ${staff.lastName || ""}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${staff.staffType}-${staff.fileNumber}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.rank}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.salaryGrade}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <button
                            onClick={() => handleEdit(staff)}
                            className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(staff.lcmstaff_id)}
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
              <p className="text-gray-500 text-lg">No LCM staff records found.</p>
            </div>
          )}
        </div>
      </div>
      {editingStaff && (
        <EditLcmStaff
          staff={editingStaff}
          isOpen={isEditWindowOpen}
          onClose={() => {
            setIsEditWindowOpen(false);
            setEditingStaff(null);
          }}
          onSave={(updatedData) => handleSaveEdit(updatedData)}
        />
      )}
    </div>
  );
};

export default LcmStaffTable;