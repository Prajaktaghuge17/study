
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Registration from './components/Registration';
import Home from './components/Home';
import { useAuth } from './components/AuthProvider';
import Student from './components/Student';
import Teacher from './components/Teacher';
import MyProfile from './components/MyProfile';
import Footer from './components/Footer';
import Quizzes from './components/Quizzes';
import AttemptQuizzes from './components/attemptQuizzes';

const App: React.FC = () => {
  const { currentUser, initializing, userDetails } = useAuth();

  if (initializing) {
    return null; // You can render a loader or something while initializing
  }

  // ProtectedRoute component to check authentication
  const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        
        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Home user={currentUser} /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute><Student user={currentUser} /></ProtectedRoute>} />
        <Route path="/teacher" element={<ProtectedRoute><Teacher user={currentUser} /></ProtectedRoute>} />
        <Route path="/my-profile" element={<ProtectedRoute><MyProfile user={currentUser} userDetails={userDetails} /></ProtectedRoute>} />
        <Route path="/quizzes" element={<ProtectedRoute><Quizzes user={currentUser} userDetails={userDetails} /></ProtectedRoute>} />
        <Route path="/attempt-quizzes" element={<ProtectedRoute><AttemptQuizzes user={currentUser} userDetails={userDetails} /></ProtectedRoute>} />

        {/* Default route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Footer only displayed when user is authenticated */}
      {currentUser && <Footer />}
    </div>
  );
};

export default App;

