import React, { useState, useEffect } from 'react';
import axios from './api/axios';
import { Activity, Users, UserCheck, User } from 'lucide-react';
import Sidebar from './Sidebar';
import img from './assets/3.jpg';

const Dashboard = () => {
  const [stats, setStats] = useState({
    allStaffsCount: 0,
    totalPermanentStaffCount: 0,
    lcmStaffCount: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/dashboard');
        setStats({
          allStaffsCount: response.data.allStaffCount,
          totalPermanentStaffCount: response.data.permanentStaffCount,
          lcmStaffCount: response.data.lcmStaffCount,
          totalUsers: response.data.totalUsers
        });
      } catch (error) {
        setError('Failed to load dashboard data');
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, bgColor = "bg-white", textColor = "text-gray-800" }) => (
    <div className={`${bgColor} rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor} opacity-70`}>{title}</p>
          <p className={`text-2xl font-bold mt-2 ${textColor}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${bgColor === "bg-white" ? "bg-blue-50" : "bg-opacity-20 bg-white"}`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to FMC Records Management System</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Staff" 
            value={stats.allStaffsCount} 
            icon={Users}
          />
          <StatCard 
            title="Permanent Staff" 
            value={stats.totalPermanentStaffCount} 
            icon={UserCheck}
            bgColor="bg-black"
            textColor="text-white"
          />
          <StatCard 
            title="LCM Staff" 
            value={stats.lcmStaffCount} 
            icon={Activity}
          />
          <StatCard 
            title="System Users" 
            value={stats.totalUsers} 
            icon={User}
            bgColor="bg-black"
            textColor="text-white"
          />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors">
                Add New Staff
              </button>
              <button className="p-4 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-colors">
                View Reports
              </button>
              <button className="p-4 bg-purple-50 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors">
                Manage Users
              </button>
              <button className="p-4 bg-orange-50 rounded-lg text-orange-600 hover:bg-orange-100 transition-colors">
                Settings
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">System Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">System Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Updated</span>
                <span className="text-gray-800">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database Status</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="mt-8">
        <img
            src={img}
            alt="FMC Overview"
            className="w-full h-[470px] object-cover rounded-xl shadow-2xl border-4 border-gray-300"
        />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;