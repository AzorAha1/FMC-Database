import React, { useState, useEffect } from "react";
import axios from "./api/axios.js";
import Sidebar from "./Sidebar.jsx";
import EditStaff from "./EditStaff.jsx";
import { useAuth } from "./AuthContext.jsx";
import { Search } from 'lucide-react';

const StaffTable = () => {
  const [staffData, setStaffData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isEditWindowOpen, setIsEditWindowOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const { userRole } = useAuth();
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

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setIsEditWindowOpen(true);
  }

  const handleSearchTerm = (event) => {
    setSearchTerm(event.target.value);
  }

  // const filteredDate = staffData.filter((staff) => ``)

  const handleSaveEdit = async (updatedData) => {

    try {
        const editeddata = {
            staff_id: editingStaff.staff_id,
            stafffirstName: updatedData.firstName,
            staffmidName: updatedData.midName,
            stafflastName: updatedData.lastName,
            staffdob: updatedData.dob,
            fileNumber: updatedData.fileNumber,
            department: updatedData.department,
            staffpno: updatedData.phone,
            staffippissNumber: updatedData.staffippissNumber,
            staffrank: updatedData.staffrank,
            staffsalgrade: updatedData.staffsalgrade,
            staffdopa: updatedData.staffdateofpresentapt,
            staffgender: updatedData.staffgender,
            stafforigin: updatedData.stafforigin,
            localgovorigin: updatedData.localgovorigin,
            qualification: updatedData.qualification
        };

        await axios.put(`/api/manage_staff/${editingStaff.staff_id}`, editeddata);
        
        // Create updated staff object that matches the structure of your staffData
        const updatedStaffRecord = {
            ...editingStaff,
            firstName: updatedData.firstName,
            midName: updatedData.midName,
            lastName: updatedData.lastName,
            dob: updatedData.dob,
            fileNumber: updatedData.fileNumber,
            department: updatedData.department,
            phone: updatedData.phone,
            staffippissNumber: updatedData.staffippissNumber,
            staffrank: updatedData.staffrank,
            staffsalgrade: updatedData.staffsalgrade,
            staffdateofpresentapt: updatedData.staffdateofpresentapt,
            staffgender: updatedData.staffgender,
            stafforigin: updatedData.stafforigin,
            localgovorigin: updatedData.localgovorigin,
            qualification: updatedData.qualification
        };

        // Update the staffData state with the new information
        setStaffData(staffData.map((staff) => 
            staff.staff_id === editingStaff.staff_id ? updatedStaffRecord : staff
        ));

        setIsEditWindowOpen(false);
        setEditingStaff(null);
    } catch (err) {
        console.error("Edit error:", err);
    }
};

const handleDelete = async (staffId) => {
    if (window.confirm("Are you sure you want to delete this staff record?")) {
        try {
            await axios.delete(`/api/manage_staff/${staffId}`);  // Updated endpoint to match your backend
            
            // Update the state to remove the deleted staff
            setStaffData(staffData.filter((staff) => staff.staff_id !== staffId));
            
            // Optionally add a success message
            setSuccessMessage("Staff record deleted successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            console.error("Delete error:", err);
            // Optionally add error handling
            setError("Failed to delete staff record. Please try again.");
            setTimeout(() => setError(null), 3000);
        }
    }
};

return (
  <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-grow p-8 overflow-auto w-full">
        
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
                      <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search staff by name..."
                            value={searchTerm}
                            onChange={handleSearchTerm}
                            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="min-w-full">
                              <thead className="bg-gray-50">
                                  <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S/N</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surname</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Other Name(s)</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sal Grade</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOFA</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOPA</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LGA</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                                      {userRole === 'admin' && (
                                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                      )}
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
                                                  {staff.lastName}
                                              </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              {`${staff.firstName} ${staff.midName}`}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              {staff.staffrank}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              {staff.staffsalgrade}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              {staff.dob}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              {staff.staffdateoffirstapt}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              {staff.staffdateofpresentapt}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              {staff.staffgender}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              {staff.localgovorigin}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              {staff.qualification}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              {staff.stafforigin}
                                          </td>
                                          {userRole === 'admin' && (
                                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                  <button
                                                      onClick={() => handleEdit(staff)}
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
                                          )}
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
      {editingStaff && (
          <EditStaff
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
}
export default StaffTable;