// firebaseService.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Quiz ,QuizAttempt} from './types';

// Function to fetch all quizzes
export const fetchQuizzes = async (): Promise<Quiz[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'quizzes'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Quiz[];
  } catch (error) {
    console.error('Error fetching quizzes: ', error);
    throw error;
  }
};

// Function to add a new quiz
export const addQuiz = async (quiz: Omit<Quiz, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'quizzes'), quiz);
    return docRef.id;
  } catch (error) {
    console.error('Error adding quiz: ', error);
    throw error;
  }
};

// Function to update an existing quiz
export const updateQuiz = async (quizId: string, quiz: Partial<Quiz>): Promise<void> => {
  try {
    const quizRef = doc(db, 'quizzes', quizId);
    await updateDoc(quizRef, quiz);
  } catch (error) {
    console.error('Error updating quiz: ', error);
    throw error;
  }
};

// Function to delete a quiz
export const deleteQuiz = async (quizId: string): Promise<void> => {
  try {
    const quizRef = doc(db, 'quizzes', quizId);
    await deleteDoc(quizRef);
  } catch (error) {
    console.error('Error deleting quiz: ', error);
    throw error;
  }
};


export const fetchQuizAttempts = async (): Promise<QuizAttempt[]> => {
  const querySnapshot = await getDocs(collection(db, 'quiz_attempts'));
  const quizAttempts: QuizAttempt[] = [];
  querySnapshot.forEach(doc => {
    quizAttempts.push({ id: doc.id, ...doc.data() } as QuizAttempt);
  });
  return quizAttempts;
};
