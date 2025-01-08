import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import Reports from './Reports.jsx';
import ListStaff from './LIstStaff.jsx';
import AddStaff from './AddStaff.jsx';
import Confirmation from './Confirmation.jsx';
import Promotion from './Promotion.jsx';
import AddLcmStaff from './AddLcmStaff.jsx';
import LcmStaffTable from './ListLcmStaff.jsx';
import AddUser from './AddUser.jsx';
import UserList from './UserList.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/api/dashboard" element={<Dashboard />} />
        <Route path='/api/reports' element={<Reports/>} />
        <Route path="/api/add_staff" element={<AddStaff />} />
        <Route path='/api/liststaffs' element={<ListStaff />}/>
        <Route path='/api/confirmation' element={<Confirmation />}/>
        <Route path='/api/promotion' element={<Promotion />}/>
        <Route path='/api/add_lcm_staff' element={<AddLcmStaff />}/>
        <Route path='/api/list_lcm_staff' element={<LcmStaffTable />}/>
        <Route path='/api/add_user' element={<AddUser/>}/>
        <Route path='/api/userlist' element={<UserList/>}/>
      </Routes>
    </Router>
  );
}

export default App;