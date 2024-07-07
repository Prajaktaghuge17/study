import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useQuery } from '@tanstack/react-query';
import NavBar from './Navbar';
import { Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Dashboard.css';
import { useTheme } from './ThemeContext';

import { User } from 'firebase/auth';

interface UserDetails {
  name: string;
  role: string;
  age: number;
}

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  url: string;
  teacherId: string;
}

interface StudentProps {
  user: User | null;
}

const fetchUserDetails = async (userId: string) => {
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserDetails;
  } else {
    throw new Error('No such document!');
  }
};

const fetchStudyMaterials = async () => {
  const q = query(collection(db, 'study'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as StudyMaterial[];
};


const handleSaveMaterial = async (user: User | null, material: StudyMaterial, setAlertVisible: (visible: boolean) => void) => {
  try {
    // Add the material to the 'savedMaterials' collection
    await addDoc(collection(db, 'savedMaterials'), {
      userId: user?.uid,
      title: material.title,
      description: material.description,
      url: material.url,
    });

    // Update the UI to reflect the saved material
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 3000);
  } catch (error) {
    console.error('Error saving study material:', error);
    // Handle error state or alert the user
  }
};

const Student: React.FC<StudentProps> = ({ user }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [searchAlertVisible, setSearchAlertVisible] = useState(false);
  const [searchedMaterials, setSearchedMaterials] = useState<StudyMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      if (user && user.uid) {
        try {
          const userDetails = await fetchUserDetails(user.uid);
          setUserDetails(userDetails);
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    fetchUser();
  }, [user]);

  const { data: studyMaterials } = useQuery({
    queryKey: ['studyMaterials'],
    queryFn: fetchStudyMaterials,
    staleTime: 60000,
  });

  const userName = userDetails ? userDetails.name : 'Loading...';
  const userRole = userDetails ? userDetails.role : '';
  const userEmail = user ? user.email : 'Loading...';



  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchAlertVisible(true);
      setTimeout(() => {
        setSearchAlertVisible(false);
      }, 3000);
      return;
    }

    const foundMaterials = studyMaterials?.filter(material =>
      material.title.toLowerCase() === searchTerm.toLowerCase()
    ) || [];

    if (foundMaterials.length > 0) {
      setSearchedMaterials(foundMaterials);
    } else {
      setSearchedMaterials([]);
      setSearchAlertVisible(true);
      setTimeout(() => {
        setSearchAlertVisible(false);
      }, 3000);
    }
    setSearchTerm('');
  };

  return (
    <div className={isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}>
      <NavBar
        user={user}
        userDetails={userDetails}
        showUserDetails={true}
      />
      <Container className="mt-4">
        <div className={`card ${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
          <div className="card-body">
            {userDetails ? (
              <>
                <h3>Welcome, {userName}!</h3>
                <p>
                  <strong>Role:</strong> {userRole}
                </p>
                <p>
                  <strong>Email:</strong> {userEmail}
                </p>
              </>
            ) : (
              <div className="d-flex justify-content-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}
          </div>
        </div>

        <Row className="mt-4 justify-content-center">
          <Col md={6}>
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Subject..."
                  aria-label="Search"
                  aria-describedby="button-addon2"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <button className="btn btn-outline-success" type="submit" id="button-addon2">Search</button>
              </div>
            </form>
          </Col>
        </Row>

        {searchedMaterials.length > 0 && (
          <div className={`card mt-4 ${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
            <div className="card-header">
              <h2>Search Results</h2>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className={`table ${isDarkMode ? 'table-dark' : 'table-light'}`}>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>URL</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchedMaterials.map((material) => (
                      <tr key={material.id}>
                        <td>{material.description}</td>
                        <td>
                          <a href={material.url} target="_blank" rel="noopener noreferrer">
                            {material.url}
                          </a>
                        </td>
                        <td>
                          <button
                            className="btn btn-success"
                            onClick={() => handleSaveMaterial(user, material, setAlertVisible)}
                          >
                            <i className="fas fa-save"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bootstrap Alert for Save Confirmation */}
        <div
          className={`position-fixed bottom-0 end-0 p-3 ${alertVisible ? 'visible' : 'invisible'}`}
          style={{ zIndex: 1050 }}
        >
          <Alert variant="success" onClose={() => setAlertVisible(false)} dismissible>
            Study material saved successfully!
          </Alert>
        </div>

        {/* Bootstrap Alert for Search Results */}
        <div
          className={`position-fixed bottom-0 end-0 p-3 ${searchAlertVisible ? 'visible' : 'invisible'}`}
          style={{ zIndex: 1050 }}
        >
          <Alert variant="warning" onClose={() => setSearchAlertVisible(false)} dismissible>
            {searchedMaterials.length === 0 ? 'No study materials found for the entered title.' : 'Please enter a search term.'}
          </Alert>
        </div>
      </Container>
    </div>
  );
};

export default Student;
