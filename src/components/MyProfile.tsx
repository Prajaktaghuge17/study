import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import NavBar from './Navbar';
import { Spinner, Container, Button, Modal, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from './ThemeContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { User } from 'firebase/auth';

interface MyProfileProps {
  user: User | null;
  userDetails: UserDetails | null;
}

interface UserDetails {
  name: string;
  age: number;
  role: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  url: string;
  userId: string;
}

const MyProfile: React.FC<MyProfileProps> = ({ user, userDetails }) => {
  const [savedMaterials, setSavedMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<StudyMaterial | null>(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchSavedMaterials = async () => {
      if (user) {
        try {
          const q = query(collection(db, 'savedMaterials'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const materials = querySnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            description: doc.data().description,
            url: doc.data().url,
            userId: doc.data().userId,
          }));
          setSavedMaterials(materials);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching saved materials:', error);
          setLoading(false);
        }
      }
    };

    fetchSavedMaterials();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'savedMaterials', id));
      setSavedMaterials(prevMaterials => prevMaterials.filter(material => material.id !== id));
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const confirmDelete = (material: StudyMaterial) => {
    setMaterialToDelete(material);
    setShowModal(true);
  };

  const handleConfirmDelete = () => {
    if (materialToDelete) {
      handleDelete(materialToDelete.id);
      setMaterialToDelete(null);
      setShowModal(false);
    }
  };

  const handleCancelDelete = () => {
    setMaterialToDelete(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <div className={isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}>
      <NavBar user={user} userDetails={userDetails} showUserDetails={true} />
      <Container className="mt-4">
        <h3 className="mt-4">Saved Study Materials</h3>
        {savedMaterials.length === 0 ? (
          <p>No study materials saved yet.</p>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover variant={isDarkMode ? 'dark' : 'light'}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>URL</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {savedMaterials.map(material => (
                  <tr key={material.id}>
                    <td>{material.title}</td>
                    <td>{material.description}</td>
                    <td>
                      <a href={material.url} target="_blank" rel="noopener noreferrer">
                        {material.url}
                      </a>
                    </td>
                    <td>
                      <Button variant="danger" onClick={() => confirmDelete(material)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
        <Modal show={showModal} onHide={handleCancelDelete}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete {materialToDelete?.title}?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default MyProfile;
