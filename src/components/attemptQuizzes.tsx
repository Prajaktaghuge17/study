import React, { useState, useEffect } from 'react';
import { fetchQuizzes } from './firebaseService';
import { Quiz } from './types';
import NavBar from './Navbar'; // Import NavBar component
import { Container, Button, ListGroup, Alert, Modal, Spinner } from 'react-bootstrap';
import { useTheme } from './ThemeContext';
import { db } from './firebase';
import { useAuth } from './AuthProvider';
import { doc, getDoc, collection, addDoc, updateDoc, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { User } from 'firebase/auth';


interface QuizProps {
  user: User | null;
  userDetails: UserDetails | null;
}
interface UserDetails {
  name: string;
  age: number;
  role: string;
}


const AttemptQuizzes: React.FC<QuizProps> = ({user,userDetails}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [, setCorrectAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [questionTimer, setQuestionTimer] = useState<number>(60);
  const [totalMarks, setTotalMarks] = useState<number>(0);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { isDarkMode } = useTheme();
  const { currentUser } = useAuth();

  const handleStartExam = async () => {
    setLoading(true);
    try {
      const fetchedQuizzes = await fetchQuizzes();
      setQuizzes(fetchedQuizzes);
      setQuizStarted(true);
    } catch (error) {
      console.error('Error fetching quizzes: ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questionTimer > 0 && quizStarted && !showResults) {
      const interval = setInterval(() => {
        setQuestionTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (questionTimer === 0 && quizStarted && !showResults) {
      alert('Time up for this question!');
      handleNextQuestion();
    }
  }, [questionTimer, quizStarted, showResults]);

  const handleOptionSelect = (selectedOption: string) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuizIndex] = selectedOption;
    setSelectedOptions(newSelectedOptions);
  };

  const handleSubmit = () => {
    setShowModal(true);
  };

  const confirmSubmit = async () => {
    const newCorrectAnswers = quizzes.map((quiz, index) =>
      selectedOptions[index] === quiz.correctAnswer ? 1 : 0
    );
    setCorrectAnswers(newCorrectAnswers);

    const totalMarks = newCorrectAnswers.reduce((acc: number, curr: number) => acc + curr, 0);
    setTotalMarks(totalMarks);

    try {
      if (!currentUser) throw new Error("User is not logged in");

      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data() as DocumentData | undefined;
      const userName = userData?.name;

      const quizAttemptData = {
        studentName: userName,
        totalMarks,
        quizDate: new Date(),
        userId: currentUser.uid
      };

      const quizAttemptsQuery = query(collection(db, 'quiz_attempts'), where('userId', '==', currentUser.uid));
      const quizAttemptsSnapshot = await getDocs(quizAttemptsQuery);

      if (!quizAttemptsSnapshot.empty) {
        const quizAttemptDoc = quizAttemptsSnapshot.docs[0];
        await updateDoc(doc(db, 'quiz_attempts', quizAttemptDoc.id), quizAttemptData);
        console.log('Quiz attempt updated successfully');
      } else {
        await addDoc(collection(db, 'quiz_attempts'), quizAttemptData);
        console.log('Quiz attempt stored successfully');
      }

      setShowResults(true);
      setShowModal(false);
    } catch (error) {
      console.error('Error adding/updating quiz attempt:', error);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setQuestionTimer(60);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(currentQuizIndex - 1);
      setQuestionTimer(60);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}>
      <NavBar user={user} showUserDetails={true} userDetails={userDetails} /> {/* Pass currentUser as user prop */}
      <Container className="mt-4">
        <h2>Attempt Quizzes</h2>
        {!quizStarted && (
          <div className="text-center mt-4">
            <Button variant="success" onClick={handleStartExam}>
              Start Exam
            </Button>
          </div>
        )}
        {loading && quizStarted && (
          <div className="text-center mt-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}
        {quizzes.length > 0 && currentQuizIndex < quizzes.length && quizStarted && !showResults && !loading ? (
          <div>
            <div className="d-flex justify-content-between mb-3">
              <h5>{quizzes[currentQuizIndex].question}</h5>
              <h4>Time Left: {formatTime(questionTimer)}</h4>
            </div>
            <ListGroup>
              {quizzes[currentQuizIndex].options.map((option, index) => (
                <ListGroup.Item
                  key={index}
                  active={selectedOptions[currentQuizIndex] === option}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </ListGroup.Item>
              ))}
            </ListGroup>
            <div className="d-flex justify-content-between mt-3">
              <Button variant="secondary" onClick={handlePreviousQuestion} disabled={currentQuizIndex === 0}>
                Previous
              </Button>
              <Button variant="primary" onClick={handleNextQuestion} disabled={currentQuizIndex === quizzes.length - 1}>
                Next
              </Button>
            </div>
            <div className="text-right mt-3">
              <Button variant="success" onClick={handleSubmit}>
                Submit Quiz
              </Button>
            </div>
          </div>
        ) : showResults ? (
          <div>
            <h4>Results</h4>
            {quizzes.map((quiz, index) => (
              <Alert key={index} variant={selectedOptions[index] === quiz.correctAnswer ? 'success' : 'danger'}>
                <p>{quiz.question}</p>
                <p>Your Answer: {selectedOptions[index]}</p>
                <p>Correct Answer: {quiz.correctAnswer}</p>
              </Alert>
            ))}
            <h4>Total Marks: {totalMarks}</h4>
          </div>
        ) : (
          !loading
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Submission</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to submit the quiz?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmSubmit}>
              Yes, Submit
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default AttemptQuizzes;
