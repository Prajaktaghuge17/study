import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Omit } from 'react-bootstrap/esm/helpers';
import { Quiz } from './types';
import { useTheme } from './ThemeContext';

interface QuizFormModalProps {
  show: boolean;
  handleClose: () => void;
  onAddQuiz: (quiz: Omit<Quiz, 'id'>) => void;
  onUpdateQuiz: (quizId: string, quiz: Partial<Quiz>) => void;
  editingQuiz: Quiz | null;
}

const QuizFormModal: React.FC<QuizFormModalProps> = ({
  show,
  handleClose,
  onAddQuiz,
  onUpdateQuiz,
  editingQuiz,
}) => {
  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const { isDarkMode } = useTheme();
  useEffect(() => {
    if (editingQuiz) {
      setQuestion(editingQuiz.question);
      setOptions(editingQuiz.options);
      setCorrectAnswer(editingQuiz.correctAnswer);
    } else {
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
    }
  }, [editingQuiz]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question && correctAnswer && options.every(option => option)) {
      if (editingQuiz) {
        onUpdateQuiz(editingQuiz.id, { question, options, correctAnswer });
      } else {
        onAddQuiz({
          question, options, correctAnswer,
          id: ''
        });
      }
      handleClose();
    }
  };

  return (
    <div  className={isDarkMode ? 'table-dark' : 'table-light'}>
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{editingQuiz ? 'Edit Quiz' : 'Add New Quiz'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="question">
            <Form.Label>Question</Form.Label>
            <Form.Control
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              required
            />
          </Form.Group>
          {options.map((option, index) => (
            <Form.Group controlId={`option${index}`} key={index}>
              <Form.Label>Option {index + 1}</Form.Label>
              <Form.Control
                type="text"
                value={option}
                onChange={e => handleOptionChange(index, e.target.value)}
                required
              />
            </Form.Group>
          ))}
          <Form.Group controlId="correctAnswer">
            <Form.Label>Correct Answer</Form.Label>
            <Form.Control
              type="text"
              value={correctAnswer}
              onChange={e => setCorrectAnswer(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            {editingQuiz ? 'Update Quiz' : 'Add Quiz'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
    </div>
  );
};

export default QuizFormModal;
