import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './ProtectedRoute'; // Import ProtectedRoute
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import Reports from './Reports.jsx';
import ListStaff from './ListStaff.jsx';
import AddStaff from './AddStaff.jsx';
import Confirmation from './Confirmation.jsx';
import Promotion from './Promotion.jsx';
import AddLcmStaff from './AddLcmStaff.jsx';
import LcmStaffTable from './ListLcmStaff.jsx';
import AddUser from './AddUser.jsx';
import UserList from './UserList.jsx';
import ExitManagement from './ExitManagement.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/api/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/api/reports' 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/api/add_staff" 
            element={
              <ProtectedRoute>
                <AddStaff />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/api/liststaffs' 
            element={
              <ProtectedRoute>
                <ListStaff />
              </ProtectedRoute>
            }
          />
          <Route 
            path='/api/confirmation' 
            element={
              <ProtectedRoute>
                <Confirmation />
              </ProtectedRoute>
            }
          />
          <Route 
            path='/api/promotion' 
            element={
              <ProtectedRoute>
                <Promotion />
              </ProtectedRoute>
            }
          />
          <Route 
            path='/api/add_lcm_staff' 
            element={
              <ProtectedRoute>
                <AddLcmStaff />
              </ProtectedRoute>
            }
          />
          <Route 
            path='/api/list_lcm_staff' 
            element={
              <ProtectedRoute>
                <LcmStaffTable />
              </ProtectedRoute>
            }
          />
          <Route 
            path='/api/add_user' 
            element={
              <ProtectedRoute adminRequired>
                <AddUser />
              </ProtectedRoute>
            }
          />
          <Route 
            path='/api/userlist' 
            element={
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
            path='/api/exit_management'
            element={
              <ProtectedRoute>
                <ExitManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;