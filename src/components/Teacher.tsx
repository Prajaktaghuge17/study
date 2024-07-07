import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation, useQuery, InvalidateQueryFilters } from '@tanstack/react-query';
import NavBar from './Navbar';
import { Spinner, Modal, Alert, Container, Row, Col, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Dashboard.css';

import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useTheme } from './ThemeContext';
import '../App.css';
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
  userId: string;
}

interface TeacherProps {
  user: User | null;
}

const fetchUserDetails = async (userId: string) => {
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as unknown as UserDetails;
  } else {
    throw new Error('No such document!');
  }
};

const fetchStudyMaterials = async (userId: string) => {
  const q = query(collection(db, 'study'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as StudyMaterial[];
};

const addStudyMaterial = async (newMaterial: Partial<StudyMaterial>, userId: string) => {
  const docRef = await addDoc(collection(db, 'study'), { ...newMaterial, userId });
  return { id: docRef.id, ...newMaterial, userId };
};

const updateStudyMaterial = async (material: StudyMaterial) => {
  const { id, ...data } = material;
  const docRef = doc(db, 'study', id);
  await updateDoc(docRef, data);
  return material;
};

const deleteStudyMaterial = async (id: string) => {
  const docRef = doc(db, 'study', id);
  await deleteDoc(docRef);
  return id;
};

const Teacher: React.FC<TeacherProps> = ({ user }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [studyMaterial, setStudyMaterial] = useState<Partial<StudyMaterial>>({
    title: '',
    description: '',
    url: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(true); // Ensure this state is correctly toggled
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showEditSuccessAlert, setShowEditSuccessAlert] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const { data: studyMaterials = [], isLoading: isMaterialsLoading, error: materialsError } = useQuery<StudyMaterial[], Error>({
    queryKey: ['studyMaterials', user?.uid],
    queryFn: () => fetchStudyMaterials(user?.uid ?? '')
  });

  const addMutation = useMutation({
    mutationFn: (newMaterial: Partial<StudyMaterial>) => addStudyMaterial(newMaterial, user?.uid ?? ''),
    onSuccess: () => {
      if (user?.uid) {
        queryClient.invalidateQueries(['studyMaterials', user.uid] as InvalidateQueryFilters);
      }
      setShowAddForm(false);
      setStudyMaterial({ title: '', description: '', url: '' });
    },
    onError: (error: any) => console.error('Error adding study material:', error)
  });

  const updateMutation = useMutation({
    mutationFn: updateStudyMaterial,
    onSuccess: () => {
      if (user?.uid) {
        queryClient.invalidateQueries(['studyMaterials', user.uid] as InvalidateQueryFilters);
      }
      setShowAddForm(false);
      setStudyMaterial({ title: '', description: '', url: '' });
      setEditingMaterialId(null);
      setShowEditSuccessAlert(true);
      setTimeout(() => {
        setShowEditSuccessAlert(false);
      }, 3000);
    },
    onError: (error: any) => console.error('Error updating study material:', error)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudyMaterial,
    onSuccess: () => {
      if (user?.uid) {
        queryClient.invalidateQueries(['studyMaterials', user.uid] as InvalidateQueryFilters);
      }
      setShowConfirmModal(false);
      setMaterialToDelete(null);
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
    },
    onError: (error: any) => console.error('Error deleting study material:', error)
  });

  useEffect(() => {
    if (userDetails && userDetails.role !== 'teacher') {
      navigate('/student');
    }
  }, [userDetails, navigate]);

  const handleAddStudyMaterial = () => {
    if (editingMaterialId) {
      updateMutation.mutate({ id: editingMaterialId, ...studyMaterial } as StudyMaterial);
    } else {
      addMutation.mutate(studyMaterial);
    }
  };

  const handleEdit = (material: StudyMaterial) => {
    setStudyMaterial(material);
    setEditingMaterialId(material.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    setShowConfirmModal(true);
    setMaterialToDelete(id);
  };

  const confirmDelete = () => {
    if (materialToDelete) {
      deleteMutation.mutate(materialToDelete);
    }
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (showAddForm) {
      setStudyMaterial({ title: '', description: '', url: '' });
      setEditingMaterialId(null);
    }
  };

  const toggleTableVisibility = () => {
    setShowTable(!showTable); // Toggle the state variable here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStudyMaterial({ ...studyMaterial, [name]: value });
  };

  const userName = userDetails ? userDetails.name : 'Loading...';
  const userRole = userDetails ? userDetails.role : '';
  const userEmail = user ? user.email : 'Loading...';

  if (!userDetails || isMaterialsLoading) {
    return (
      <div className="d-flex justify-content-center mt-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (materialsError) {
    return <div>Error loading study materials: {materialsError.message}</div>;
  }

  return (
    <div id="root">
      <NavBar user={user} userDetails={userDetails} showUserDetails={true} />
      <Container className="mt-4">
        <Row className="justify-content-center">
          <Col md={8}>
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Welcome, {userName} ({userRole})</h5>
                <p className="card-text">{userEmail}</p>
                <Button variant="primary" onClick={toggleAddForm}>
                  {showAddForm ? 'Close' : 'Add Study Material'}
                </Button>
                <Button variant="secondary" onClick={toggleTableVisibility} className="ms-2">
                  {showTable ? 'Hide Table' : 'Show Table'}
                </Button>
              </div>
              <div className="card-body">
                {showAddForm && (
                  <Modal show={showAddForm} onHide={toggleAddForm} centered>
                    <Modal.Header closeButton>
                      <Modal.Title>{editingMaterialId ? 'Edit Study Material' : 'Add Study Material'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form>
                        <Form.Group controlId="title">
                          <Form.Label>Title</Form.Label>
                          <Form.Control
                            type="text"
                            name="title"
                            value={studyMaterial.title}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                        <Form.Group controlId="description">
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            value={studyMaterial.description}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                        <Form.Group controlId="url">
                          <Form.Label>URL</Form.Label>
                          <Form.Control
                            type="url"
                            name="url"
                            value={studyMaterial.url}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Form>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={toggleAddForm}>
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={handleAddStudyMaterial}>
                        {editingMaterialId ? 'Update' : 'Add'}
                      </Button>
                    </Modal.Footer>
                  </Modal>
                )}
                <Alert show={showSuccessAlert} variant="success">
                  Study Material {editingMaterialId ? 'Updated' : 'Added'} successfully!
                </Alert>
                <Alert show={showEditSuccessAlert} variant="success">
                  Study Material Updated successfully!
                </Alert>
                <div className="table-responsive">
                  {showTable && (
                    <table className={`table mt-3 ${isDarkMode ? 'table-dark' : ''}`}>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Description</th>
                          <th>URL</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studyMaterials.map((material) => (
                          <tr key={material.id}>
                            <td>{material.title}</td>
                            <td>{material.description}</td>
                            <td>{material.url}</td>
                            <td>
                              <Button variant="outline-primary" size="sm" onClick={() => handleEdit(material)}>
                                <i className="fas fa-edit"></i>
                              </Button>{' '}
                              <Button variant="outline-danger" size="sm" onClick={() => handleDelete(material.id)}>
                                <i className="fas fa-trash-alt"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <Alert show={showConfirmModal} variant="danger">
                  <Alert.Heading>Delete Study Material</Alert.Heading>
                  <p>Are you sure you want to delete this study material?</p>
                  <div className="d-flex justify-content-end">
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} className="ms-2">
                      Delete
                    </Button>
                  </div>
                </Alert>
                <div className="d-flex justify-content-center mt-3">
                  {isMaterialsLoading && <Spinner animation="border" role="status" />}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Teacher;
