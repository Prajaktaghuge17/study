export interface Quiz {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
  }
  export interface QuizAttempt {
    id: string;
    studentName: string;
    totalMarks: number;
    quizDate: Date;
    userId: string;
  }
  