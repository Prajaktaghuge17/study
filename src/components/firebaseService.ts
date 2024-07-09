import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Quiz, QuizAttempt } from './types';

export const fetchQuizzes = async (): Promise<Quiz[]> => {
  try {
    const quizCollection = collection(db, 'quizzes');
    const quizSnapshot = await getDocs(quizCollection);
    
    const quizzes: Quiz[] = [];

    quizSnapshot.forEach((doc) => {
      quizzes.push({
        id: doc.id,
        ...doc.data()
      } as Quiz);
    });

    console.log('Fetched quizzes:', quizzes);
    return quizzes;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
};

export const addQuiz = async (quiz: Omit<Quiz, 'id'>): Promise<void> => {
  const quizCollection = collection(db, 'quizzes');
  await addDoc(quizCollection, quiz);
};

export const updateQuiz = async (id: string, quiz: Partial<Quiz>): Promise<void> => {

  if (!id) throw new Error("Invalid document ID");
  const quizDoc = doc(db, 'quizzes', id);
  await updateDoc(quizDoc, quiz);
};

export const deleteQuiz = async (id: string): Promise<void> => {
 
  if (!id) throw new Error("Invalid document ID");
  const quizDoc = doc(db, 'quizzes', id);
  await deleteDoc(quizDoc);
};


export const fetchQuizAttempts = async (): Promise<QuizAttempt[]> => {
  const querySnapshot = await getDocs(collection(db, 'quiz_attempts'));
  const quizAttempts: QuizAttempt[] = [];
  querySnapshot.forEach(doc => {
    quizAttempts.push({ id: doc.id, ...doc.data() } as QuizAttempt);
  });
  return quizAttempts;
};
