import React, { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import Logo from './l1.png';
import Profile from './profile1.png';
import { auth } from './firebase';
import { signOut, User } from 'firebase/auth';
import { useTheme } from './ThemeContext';

interface NavBarProps {
  user: User | null;
  showUserDetails: boolean;
  userDetails: {
    name: string;
    role: string;
    age: number;
  } | null;
}



const NavBar: React.FC<NavBarProps> = ({ user, userDetails, showUserDetails }) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("User logged out successfully");
      navigate('/login'); // Navigate to login page after logout
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);


  const userDetailsContent = useMemo(() => {
    if (showDetails && showUserDetails && userDetails) {
      return (
        <div className="user-details-dropdown">
          <p>Name: {userDetails.name}</p>
          <p>Age: {userDetails.age}</p>
          <p>Role: {userDetails.role}</p>
          <button id="btn1" onClick={handleLogout}>Logout</button>
        </div>
      );
    }
    return null;
  }, [showDetails, showUserDetails, userDetails, handleLogout]);

  return (
    <nav className={`navbar navbar-expand-lg ${isDarkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'}`}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img id='img1' src={Logo} alt="Logo" />
        </Link>
        <div className="d-flex align-items-center d-lg-none">
          <button className="btn btn-secondary me-2" onClick={toggleTheme}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          {user && (
            <div className="user-info">
              <img id='img2' src={Profile} alt="Profile" onClick={toggleDetails} />
              {userDetailsContent}
            </div>
          )}
          <button className="navbar-toggler ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            {userDetails?.role === 'teacher' && (
              <li className="nav-item">
                <Link className="nav-link" to="/quizzes">Add Quizzes</Link>
              </li>
            )}
            {userDetails?.role === 'student' && (
              <li className="nav-item">
                <Link className="nav-link" to="/attempt-quizzes">Attempt Quizzes</Link>
              </li>
            )}
            {userDetails?.role === 'teacher' && (
              <li className="nav-item">
                <Link className="nav-link" to="/teacher">Teacher</Link>
              </li>
            )}
            {userDetails?.role === 'student' && (
              <li className="nav-item">
                <Link className="nav-link" to="/student">Student</Link>
              </li>
            )}
            {userDetails?.role === 'student' && (
              <li className="nav-item">
                <Link className="nav-link" to="/my-profile">My Profile</Link>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center">
            <button className="btn btn-secondary me-2 d-none d-lg-block" onClick={toggleTheme}>
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            {user && (
              <div className="user-info d-none d-lg-flex">
                <img id='img2' src={Profile} alt="Profile" onClick={toggleDetails} />
                {userDetailsContent}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
