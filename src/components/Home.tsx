import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import quizzesImage from './quiz.png';
import NavBar from './Navbar';

import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import { useTheme } from './ThemeContext';

interface UserDetails {
  savedMaterials: any;
  name: string;
  age: number;
  role: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  url: string;
  teacherId: string;
}
interface HomeProps {
  user: User | null;
}

const Home: React.FC<HomeProps>= () => {
  const [user, setUser] = useState< User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [needsDetails, setNeedsDetails] = useState<boolean>(false);
  const [] = useState<string>('');
  const [savedMaterials, setSavedMaterials] = useState<string[]>([]);
  const [filteredMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log('User logged in:', currentUser);
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          console.log('User document does not exist. Prompting for details.');
          setNeedsDetails(true);
        } else {
          const userData = userDoc.data() as UserDetails;
          setUserDetails(userData);
          setNeedsDetails(false);
        }
        setLoading(false);
      } else {
        console.log('No user logged in. Redirecting to login.');
        setUser(null);
        setLoading(false);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchSavedMaterials = async () => {
      try {
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserDetails;
            const savedMaterialIds = userData.savedMaterials || [];
            setSavedMaterials(savedMaterialIds);
          }
        }
      } catch (error) {
        console.error('Error fetching saved materials:', error);
      }
    };

    fetchSavedMaterials();
  }, [user]);

  const handleDetailsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { name, age, role } = e.currentTarget.elements as typeof e.currentTarget.elements & {
      name: HTMLInputElement;
      age: HTMLInputElement;
      role: RadioNodeList;
    };

    try {
      if (!user) throw new Error("User is not logged in");

      const userData: UserDetails = {
        name: name.value,
        age: parseInt(age.value),
        role: role.value,
        savedMaterials: [],
      };
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('User details saved successfully.');
      setUserDetails(userData);
      setNeedsDetails(false);

      if (role.value === 'student') {
        navigate('/student');
      } else if (role.value === 'teacher') {
        navigate('/teacher');
      }
    } catch (error) {
      console.error('Error saving user details:', error);
    }
  };


  const handleSaveMaterial = async (materialId: string) => {
    try {
      if (!user) throw new Error("User is not logged in");

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserDetails;
        const updatedSavedMaterials = [...userData.savedMaterials, materialId];
        await setDoc(userDocRef, { savedMaterials: updatedSavedMaterials }, { merge: true });
        setSavedMaterials(updatedSavedMaterials);
      }
    } catch (error) {
      console.error('Error saving material:', error);
    }
  };

  const handleRemoveSavedMaterial = async (materialId: string) => {
    try {
      if (!user) throw new Error("User is not logged in");

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserDetails;
        const updatedSavedMaterials = userData.savedMaterials.filter((id: string) => id !== materialId);
        await setDoc(userDocRef, { savedMaterials: updatedSavedMaterials }, { merge: true });
        setSavedMaterials(updatedSavedMaterials);
      }
    } catch (error) {
      console.error('Error removing saved material:', error);
    }
  };


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar user={user} userDetails={userDetails} showUserDetails={true} />
      {needsDetails ? (
        <div className="container mt-5 d-flex justify-content-center">
          <form onSubmit={handleDetailsSubmit} className="w-50">
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name:</label>
              <input type="text" id="name" name="name" className="form-control" required />
            </div>
            <div className="mb-3">
              <label htmlFor="age" className="form-label">Age:</label>
              <input type="number" id="age" name="age" className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Role:</label>
              <div>
                <div className="form-check">
                  <input type="radio" id="student" name="role" value="student" className="form-check-input" required />
                  <label htmlFor="student" className="form-check-label">Student</label>
                </div>
                <div className="form-check">
                  <input type="radio" id="teacher" name="role" value="teacher" className="form-check-input" required />
                  <label htmlFor="teacher" className="form-check-label">Teacher</label>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>
      ) : (
        <div className={`container mt-5 ${isDarkMode ? 'text-light' : 'text-dark'}`}>
          <div className="text-center mb-5">
            <h1>Welcome to the Collaborative Study Platform</h1>
            <p>Your one-stop destination for creating and sharing study materials,create quizzes,attempt quizzes and more.</p>
          </div>
          <div className="row justify-content-center">
            <div className="col-md-4 mb-4">
              <div className={`card ${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
                <img src={quizzesImage} alt="Quizzes" className="card-img-top" /><br/>
                <div className="card-body">
                  <h5 className="card-title">Quizzes</h5>
                  <p className="card-text">Test your knowledge with quizzes created by other users.</p>
                  <Link to="/attempt-quizzes" className="btn btn-primary">Go to Quizzes</Link>
                </div>
              </div>
            </div>
          </div>
          {filteredMaterials.length > 0 && (
            <div className="row justify-content-center mt-5">
              <div className="col-md-8">
                <h3>Search Results</h3>
                <ul className="list-group">
                  {filteredMaterials.map(material => (
                    <li key={material.id} className={`list-group-item ${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
                      {material.title}
                      {!savedMaterials.includes(material.id) ? (
                        <button className="btn btn-primary" onClick={() => handleSaveMaterial(material.id)}>Save</button>
                      ) : (
                        <button className="btn btn-danger" onClick={() => handleRemoveSavedMaterial(material.id)}>Remove</button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
