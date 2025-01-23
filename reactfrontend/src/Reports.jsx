import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from './api/axios';
import Sidebar from './Sidebar.jsx';
import { 
  Search, ArrowUpDown, ChevronLeft, 
  Download, Filter, RefreshCw 
} from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const reportsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports');
      console.log('Raw report data:', response.data.reports);
      setReports(response.data.reports || []);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch reports';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const sortedReports = [...reports].sort((a, b) => {
    if (sortConfig.key === 'date') {
      const dateA = new Date(a.date.$date || a.date);
      const dateB = new Date(b.date.$date || b.date);
      return sortConfig.direction === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    }
    return sortConfig.direction === 'asc'
      ? String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key]))
      : String(b[sortConfig.key]).localeCompare(String(a[sortConfig.key]));
  });

  const filteredReports = sortedReports.filter(report => {
    const matchesSearch = Object.values(report).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesFilter = filterType === 'all' || report.action === filterType;
    return matchesSearch && matchesFilter;
  });

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const formatDate = (dateString) => {
    try {
      // Parse the MongoDB date string (handles both ISO strings and MongoDB's extended JSON)
      const date = new Date(dateString.$date || dateString);
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid date';
      }
  
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const handleExport = () => {
    const csv = filteredReports.map(report => {
      return [
        report.action,
        report.staff_id,
        report.details,
        formatDate(report.date)
      ].join(',');
    });
    csv.unshift(['Action', 'Staff ID', 'Details', 'Date & Time']);
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
              <p className="text-gray-600 mt-1">View and manage staff activity reports</p>
            </div>
            <button
               
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                </select>
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={fetchReports}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('action')}
                        className="flex items-center hover:text-gray-700"
                      >
                        Action
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('staff_id')}
                        className="flex items-center hover:text-gray-700"
                      >
                        Staff ID
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('date')}
                        className="flex items-center hover:text-gray-700"
                      >
                        Date & Time
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentReports.map((report, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-sm rounded-full ${
                          report.action === 'login' ? 'bg-green-100 text-green-800' :
                          report.action === 'logout' ? 'bg-yellow-100 text-yellow-800' :
                          report.action === 'update' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {report.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.staff_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {report.details}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(report.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstReport + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastReport, filteredReports.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredReports.length}</span> results
                </p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;