import React, { useState } from 'react'; // Add useState
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faTachometerAlt, faFileInvoiceDollar, faStethoscope, faClinicMedical, faBed, faPaperPlane, faArrowLeft, faArrowRight, faArrowDown, faArrowRightRotate, faUserAlt, faCodePullRequest, faAd, faAdd, faUserEdit, faBedPulse, faUserDoctor, faUserNurse, faList } from '@fortawesome/free-solid-svg-icons';
import { faHospitalAlt } from '@fortawesome/free-regular-svg-icons/faHospitalAlt';
import { useNavigate } from 'react-router-dom'

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false); // State for sidebar collapse

    // States to control the visibility of each submenu
    const [openMenu, setOpenMenu] = useState({
        himUnit: false,
        outPatient: false,
        inPatient: false,
        directRequest: false,
    });

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const navigate = useNavigate();

    const collapsediteminmenu = (title, icon, endpoint) => {
        return (
            <li 
                className="flex items-center space-x-4 p-2 hover:bg-gray-700 rounded cursor-pointer"
                onClick={() => endpoint && navigate(endpoint)}
            >
                <div className="flex items-center space-x-4">
                    <FontAwesomeIcon icon={icon} className="text-lg" />
                    {!isCollapsed && <span>{title}</span>}
                </div>
            </li>
        );
    };

    const toggleSubMenu = (menu) => {
        setOpenMenu(prevState => ({
            ...prevState,
            [menu]: !prevState[menu],
        }));
    };

    return (
        <aside
            style={{ backgroundColor: '#1e1e2d' }}
            className={`h-screen text-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}
        >
            {/* Header Section */}
            <div style={{ backgroundColor: '#1a1a26' }} className="p-4 flex items-center justify-between">
                {/* Title */}
                {!isCollapsed && (
                    <h1 className="text-2xl font-semibold text-blue-400">HealthDis</h1>
                )}

                {/* Back Icon */}
                <button
                    className={`text-white hover:text-blue-400 cursor-pointer transition-transform duration-300 ease-in-out ${
                        isCollapsed ? 'rotate-0' : 'rotate-180'
                    }`}
                    onClick={toggleSidebar}
                >
                    <FontAwesomeIcon icon={faArrowRight} className="text-xl" />
                </button>
            </div>

            {/* Menu Section */}
            <ul className="p-4 space-y-4">
                {/* Dashboard */}
                <li className="flex items-center space-x-4 p-2 hover:bg-gray-700 rounded">
                    <FontAwesomeIcon icon={faTachometerAlt} className="text-lg" />
                    {!isCollapsed && <span>Dashboard</span>}
                </li>
                {/* Billing */}
                <li className="flex items-center space-x-4 p-2 hover:bg-gray-700 rounded">
                    <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-lg" />
                    {!isCollapsed && <span>Billing</span>}
                </li>
                {/* Home */}
                <li className="flex items-center space-x-4 p-2 hover:bg-gray-700 rounded">
                    <FontAwesomeIcon icon={faHome} className="text-lg" />
                    {!isCollapsed && <span>Home</span>}
                </li>
                {/* HIM Unit */}
                <li
                    className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer"
                    onClick={() => toggleSubMenu('himUnit')} // Toggle HIM Unit submenu
                >
                    <div className="flex items-center space-x-4">
                        <FontAwesomeIcon icon={faStethoscope} className="text-lg" />
                        {!isCollapsed && <span>HIM Unit</span>}
                    </div>
                    {!isCollapsed && (
                        <FontAwesomeIcon
                            icon={faArrowDown}
                            className={`text-sm transform transition-transform ${openMenu.himUnit ? 'rotate-180' : ''}`}
                        />
                    )}
                </li>
                {openMenu.himUnit && !isCollapsed && (
                    <ul className="pl-8 space-y-2">
                        {collapsediteminmenu('HIM Dashboard', faTachometerAlt)}
                        {collapsediteminmenu('New Patient Enrollment', faUserAlt, '/clinical/new_patient')}
                        {collapsediteminmenu('Update Patient Record', faArrowRightRotate)}
                        {collapsediteminmenu('Patients Registered List', faList)}
                        {collapsediteminmenu('Follow-up Visit', faHospitalAlt)}

                    </ul>
                )}
                {/* Out-Patient Clinic */}
                <li
                    className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer"
                    onClick={() => toggleSubMenu('outPatient')} // Toggle Out-Patient submenu
                >
                    <div className="flex items-center space-x-4">
                        <FontAwesomeIcon icon={faClinicMedical} className="text-lg" />
                        {!isCollapsed && <span>Out-Patient Clinic</span>}
                    </div>
                    {!isCollapsed && (
                        <FontAwesomeIcon
                            icon={faArrowDown}
                            className={`text-sm transform transition-transform ${openMenu.outPatient ? 'rotate-180' : ''}`}
                        />
                    )}
                </li>
                {openMenu.outPatient && !isCollapsed && (
                    <ul className="pl-8 space-y-2">
                        {collapsediteminmenu('Doctor Sign-In', faUserDoctor)}
                        {collapsediteminmenu('Nurse Desk', faUserNurse)}
                        
                    </ul>
                )}
                {/* In-Patient/Wards */}
                <li
                    className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer"
                    onClick={() => toggleSubMenu('inPatient')} // Toggle In-Patient submenu
                >
                    <div className="flex items-center space-x-4">
                        <FontAwesomeIcon icon={faBed} className="text-lg" />
                        {!isCollapsed && <span>In-Patient/Wards</span>}
                    </div>
                    {!isCollapsed && (
                        <FontAwesomeIcon
                            icon={faArrowDown}
                            className={`text-sm transform transition-transform ${openMenu.inPatient ? 'rotate-180' : ''}`}
                        />
                    )}
                </li>
                {openMenu.inPatient && !isCollapsed && (
                    <ul className="pl-8 space-y-2">
                        {collapsediteminmenu('Ward Login', faBedPulse)}
                    </ul>
                )}
                {/* Direct Request */}
                <li
                    className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer"
                    onClick={() => toggleSubMenu('directRequest')} // Toggle Direct Request submenu
                >
                    <div className="flex items-center space-x-4">
                        <FontAwesomeIcon icon={faPaperPlane} className="text-lg" />
                        {!isCollapsed && <span>Direct Request</span>}
                    </div>
                    {!isCollapsed && (
                        <FontAwesomeIcon
                            icon={faArrowDown}
                            className={`text-sm transform transition-transform ${openMenu.directRequest ? 'rotate-180' : ''}`}
                        />
                    )}
                </li>
                {openMenu.directRequest && !isCollapsed && (
                    <ul className="pl-8 space-y-2">
                        {collapsediteminmenu('New Request', faAdd)}
                        {collapsediteminmenu('New IGR Request', faUserEdit)}
                    </ul>
                )}
            </ul>
        </aside>
    );
};

export default Sidebar;