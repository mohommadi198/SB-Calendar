import React, { JSX, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserApp from './components/UserApp';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // Auth State
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAdmin(!!user);
    });

    return () => unsubscribe();
  }, []);

  // Protected Route wrapper
  const AdminRoute = ({ children }: { children: JSX.Element }) => {
    if (isAdmin === null) return <div>Loading...</div>;
    return isAdmin ? children : <Navigate to="/admin/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/*" element={<UserApp isAdmin={isAdmin} />} />
        
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        
        {/* Alias for admin root */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />

        
        <Route path="*" element={(
            <div className='App'>
              <br/>
              <br/>
              <br/>
              <br/>
              <br/>
              <h1>Not Found</h1>
            </div>
          )} />
      </Routes>
    </Router>
  );
};

export default App;
