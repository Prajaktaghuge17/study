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
  const { currentUser, userDetails } = useAuth();

  return (
    <div>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />

        <Route path="/" element={<Home />} />

        <Route path="/student" element={<Student user={currentUser} />} />
        <Route path="/teacher" element={<Teacher user={currentUser} />} />
        <Route path="/my-profile" element={<MyProfile user={currentUser} userDetails={userDetails}/>} />
        <Route path="/quizzes" element={<Quizzes />}/>
        <Route path="/attempt-quizzes" element={<AttemptQuizzes/>}/>


        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
     { currentUser&&<Footer/>}
    </div>
  );
};

export default App;
