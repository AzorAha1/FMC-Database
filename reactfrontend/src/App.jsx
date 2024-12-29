import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import Reports from './Reports.jsx';
import AddStaff from './AddStaff.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/api/dashboard" element={<Dashboard />} />
        <Route path='/api/reports' element={<Reports/>} />
        <Route path="/api/add_staff" element={<AddStaff />} />
      </Routes>
    </Router>
  );
}

export default App;