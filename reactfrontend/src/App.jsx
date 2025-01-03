import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import Reports from './Reports.jsx';
import ListStaff from './LIstStaff.jsx';
import AddStaff from './AddStaff.jsx';
import Confirmation from './Confirmation.jsx';


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
      </Routes>
    </Router>
  );
}

export default App;