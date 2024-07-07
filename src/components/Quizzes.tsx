import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { fetchQuizzes, fetchQuizAttempts, addQuiz, updateQuiz, deleteQuiz } from './firebaseService';
import QuizFormModal from './QuizFormModal';
import { Quiz, QuizAttempt } from './types';
import NavBar from './Navbar';
import { Container, Table, Button } from 'react-bootstrap';
import { useTheme } from './ThemeContext'; // Import useTheme
import 'bootstrap/dist/css/bootstrap.min.css';
import { User } from 'firebase/auth';
interface Props {
  user: User | null;
  userDetails: UserDetails | null;
}
interface UserDetails {
  name: string;
  age: number;
  role: string;
}
const Quizzes: React.FC<Props>= ({user,userDetails}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [isTeacher] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [showStudentMarks, setShowStudentMarks] = useState<boolean>(false); // State to manage visibility of student marks
  const { isDarkMode } = useTheme(); // Use the isDarkMode state from ThemeContext

  useEffect(() => {
    fetchQuizzesFromFirestore();
    fetchQuizAttemptsFromFirestore();
  }, []);

  const fetchQuizzesFromFirestore = async () => {
    try {
      const fetchedQuizzes = await fetchQuizzes();
      setQuizzes(fetchedQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes: ', error);
    }
  };

  const fetchQuizAttemptsFromFirestore = async () => {
    try {
      const fetchedQuizAttempts = await fetchQuizAttempts();
      setQuizAttempts(fetchedQuizAttempts);
    } catch (error) {
      console.error('Error fetching quiz attempts: ', error);
    }
  };

  const handleAddQuiz = async (quiz: Omit<Quiz, 'id'>) => {
    try {
      const quizId = await addQuiz(quiz);
      setQuizzes(prevQuizzes => [...prevQuizzes, { id: quizId, ...quiz }]);
    } catch (error) {
      console.error('Error adding quiz: ', error);
    }
  };

  const handleUpdateQuiz = async (quizId: string, quiz: Partial<Quiz>) => {
    try {
      await updateQuiz(quizId, quiz);
      setQuizzes(prevQuizzes =>
        prevQuizzes.map(q => (q.id === quizId ? { ...q, ...quiz } : q))
      );
    } catch (error) {
      console.error('Error updating quiz: ', error);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteQuiz(quizId);
      setQuizzes(prevQuizzes => prevQuizzes.filter(q => q.id !== quizId));
    } catch (error) {
      console.error('Error deleting quiz: ', error);
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingQuiz(null);
    setShowModal(false);
  };

  return (
    <div className={isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}>
      <NavBar user={user} userDetails={userDetails} showUserDetails={true} />
      <Container className="mt-4">
        <h2 className="mt-5 mb-4">Quizzes</h2>
        {isTeacher && (
          <div className="text-right mb-3">
            <Button variant="primary" onClick={() => setShowModal(true)}>Add Quiz</Button>
          </div>
        )}
        <QuizFormModal
          show={showModal}
          handleClose={handleCloseModal}
          onAddQuiz={handleAddQuiz}
          onUpdateQuiz={handleUpdateQuiz}
          editingQuiz={editingQuiz}
          
        />
        <Table striped bordered hover className={isDarkMode ? 'table-dark' : 'table-light'}>
          <thead>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Options</th>
              <th>Correct Answer</th>
              {isTeacher && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz, index) => (
              <tr key={quiz.id}>
                <td>{index + 1}</td>
                <td>{quiz.question}</td>
                <td>
                  <ul>
                    {quiz.options.map((option, idx) => (
                      <li key={idx}>{option}</li>
                    ))}
                  </ul>
                </td>
                <td>{quiz.correctAnswer}</td>
                {isTeacher && (
                  <td>
                    <Button variant="outline-success" onClick={() => handleEditQuiz(quiz)}>
                      <FaEdit /> Edit
                    </Button>{' '}
                    <Button variant="outline-danger" onClick={() => handleDeleteQuiz(quiz.id)}>
                      <FaTrash /> Delete
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>

        {isTeacher && (
          <>
            <Button
              variant="secondary"
              className="mt-5 mb-4"
              onClick={() => setShowStudentMarks(!showStudentMarks)}
            >
              {showStudentMarks ? 'Hide Student Marks' : 'Show Student Marks'}
            </Button>
            {showStudentMarks && (
              <>
                <h3 className="mt-5 mb-4">Student Quiz Attempts</h3>
                <Table striped bordered hover className={isDarkMode ? 'table-dark' : 'table-light'}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student Name</th>
                      <th>Marks Obtained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizAttempts.map((attempt, index) => (
                      <tr key={attempt.id}>
                        <td>{index + 1}</td>
                        <td>{attempt.studentName}</td>
                        <td>{attempt.totalMarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default Quizzes;
