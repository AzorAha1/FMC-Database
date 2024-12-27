import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/api/dashboard" element={<Dashboard />} /> {/* Remove the /api/ prefix */}
      </Routes>
    </Router>
  );
}

export default App;