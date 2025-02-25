import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from './api/axios.js';
import { useAuth } from './AuthContext.jsx';
import { faCalendarTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import { faUserSlash } from '@fortawesome/free-solid-svg-icons';

import {
    faChartLine,
    faChartBar,
    faUserPlus,
    faList,
    faStethoscope,
    faCheckCircle,
    faArrowUp,
    faUsers,
    faChevronDown,
    faChevronRight,
    faSignOutAlt,
    faUserNurse,
    faUserCog,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openMenu, setOpenMenu] = useState({
        managePermanent: false,
        manageLocum: false,
        manageUsers: false,
        exit_management: false,
    });
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {userRole} = useAuth();

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    const toggleSubMenu = (menu) => {
        setOpenMenu((prevState) => ({
            ...prevState,
            [menu]: !prevState[menu],
        }));
    };

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const collapsedItemInMenu = (title, icon, endpoint) => (
        <li
            className={`flex items-center space-x-4 p-2 rounded cursor-pointer ${
                isActive(endpoint) ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
            }`}
            // onClick={() => endpoint && navigate(endpoint)}
            onClick={() => {
                if (endpoint === '/api/logout') {
                    handleLogout(); // Handle logout separately
                } else {
                    navigate(endpoint); // Navigate to other endpoints
                }
            }}
        >
            <FontAwesomeIcon icon={icon} className="text-lg" />
            {!isCollapsed && <span>{title}</span>}
        </li>
    );

    return (
        <aside
            style={{ backgroundColor: '#1e1e2d' }}
            className={`h-screen text-white transition-all overflow-y-auto duration-300 ${
                isCollapsed ? 'w-20' : 'w-72'
            }`}
        >
            {/* Header */}
            <div style={{ backgroundColor: '#1a1a26' }} className="p-4 flex items-center justify-between">
                {!isCollapsed && <h1 className="text-lg font-semibold text-blue-400">FMC Human Resources</h1>}
                <button
                    className={`text-white hover:text-blue-400 cursor-pointer`}
                    onClick={toggleSidebar}
                >
                    <FontAwesomeIcon
                        icon={isCollapsed ? faChevronRight : faChevronDown}
                        className="text-xl"
                    />
                </button>
            </div>

            {/* Menu */}
            <ul className="p-4 space-y-4">
                {collapsedItemInMenu('Dashboard', faChartLine, '/api/dashboard')}
                {collapsedItemInMenu('Reports', faChartBar, '/api/reports')}

                {/* Manage Permanent */}
                <li
                    className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer"
                    onClick={() => toggleSubMenu('managePermanent')}
                    aria-expanded={openMenu.managePermanent}
                >
                    <div className="flex items-center space-x-4">
                        <FontAwesomeIcon icon={faStethoscope} className="text-lg" />
                        {!isCollapsed && <span>Manage Permanent</span>}
                    </div>
                    {!isCollapsed && (
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            className={`text-sm transform transition-transform ${
                                openMenu.managePermanent ? 'rotate-180' : ''
                            }`}
                        />
                    )}
                </li>
                {openMenu.managePermanent && !isCollapsed && (
                    <ul className="pl-8 space-y-2">
                        {collapsedItemInMenu('Add Staff', faUserPlus, '/api/add_staff')}
                        {collapsedItemInMenu('List of Staff', faList, '/api/liststaffs')}
                    </ul>
                )}

                {/* Confirmation */}
                {collapsedItemInMenu('Confirmation', faCheckCircle, '/api/confirmation')}

                {/* Promotion */}
                {collapsedItemInMenu('Promotion', faArrowUp, '/api/promotion')}

                {/* Manage Locum Staffs */}
                <li
                    className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer"
                    onClick={() => toggleSubMenu('manageLocum')}
                    aria-expanded={openMenu.manageLocum}
                >
                    <div className="flex items-center space-x-4">
                        <FontAwesomeIcon icon={faUsers} className="text-lg" />
                        {!isCollapsed && <span>Manage Locum Staffs</span>}
                    </div>
                    {!isCollapsed && (
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            className={`text-sm transform transition-transform ${
                                openMenu.manageLocum ? 'rotate-180' : ''
                            }`}
                        />
                    )}
                </li>
                {openMenu.manageLocum && !isCollapsed && (
                    <ul className="pl-8 space-y-2">
                        {collapsedItemInMenu('Add LCM Staff', faUserNurse, '/api/add_lcm_staff')}
                        {collapsedItemInMenu('List of LCM Staff', faList, '/api/list_lcm_staff')}
                    </ul>
                )}
                {userRole === 'admin-user' && (
                    <>
                        {/* Manage Users */}
                        <li
                            className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer"
                            onClick={() => toggleSubMenu('manageUsers')}
                            aria-expanded={openMenu.manageUsers}
                        >
                            <div className="flex items-center space-x-4">
                                <FontAwesomeIcon icon={faUsers} className="text-lg" />
                                {!isCollapsed && <span>Manage Users</span>}
                            </div>
                            {!isCollapsed && (
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`text-sm transform transition-transform ${
                                        openMenu.manageUsers ? 'rotate-180' : ''
                                    }`}
                                />
                            )}
                        </li>
                        {openMenu.manageUsers && !isCollapsed && (
                            <ul className="pl-8 space-y-2">
                                {collapsedItemInMenu('Add User', faUserCog, '/api/add_user')}
                                {collapsedItemInMenu('User Table', faList, '/api/userlist')}
                            </ul>
                        )}
                    </>
                )}
                {/* Exit Management */}
                {/* {collapsedItemInMenu('Exit Management', faCalendarTimes, '/api/exit_management')} */}

                <li
                    className='flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer'
                    onClick={() => toggleSubMenu('exit_management')}
                    aria-expanded={openMenu.exit_management}
                >
                    <div className='flex items-center space-x-4'>
                        <FontAwesomeIcon icon={faCalendarTimes} className='text-lg' />
                        {!isCollapsed && <span>Exit Management</span>}
                        
                    </div>
                    {!isCollapsed && (
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            className={`text-sm transform transition-transform ${
                                openMenu.exit_management ? 'rotate-180' : ''
                            }`}
                        />
                    )}
                </li>
                {openMenu.exit_management && !isCollapsed && (
                    <ul className='pl-8 space-y-2'>
                        {collapsedItemInMenu('Active Staffs', faCalendarTimes, '/api/exit_management')}
                        {collapsedItemInMenu('Inactive Staffs', faUserSlash, '/api/inactive_staff')}
                    </ul>
                )}
                
                {/* Logout */}
                {collapsedItemInMenu('Logout', faSignOutAlt, '/api/logout')}
            </ul>
        </aside>
    );
};

export default Sidebar;