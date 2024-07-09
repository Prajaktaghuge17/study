import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Quiz } from './types';

interface QuizFormModalProps {
  show: boolean;
  handleClose: () => void;
  onAddQuiz: (quiz: Omit<Quiz, 'id'>) => void;
  onUpdateQuiz: (id: string, quiz: Partial<Quiz>) => void;
  editingQuiz: Quiz | null;
}

const QuizFormModal: React.FC<QuizFormModalProps> = ({ show, handleClose, onAddQuiz, onUpdateQuiz, editingQuiz }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const newQuiz = { question, options, correctAnswer };

    if (editingQuiz && editingQuiz.id) {
      onUpdateQuiz(editingQuiz.id, newQuiz);
    } else {
      onAddQuiz(newQuiz);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{editingQuiz ? 'Edit Quiz' : 'Add Quiz'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group controlId="question">
            <Form.Label>Question</Form.Label>
            <Form.Control
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </Form.Group>
          {options.map((option, index) => (
            <Form.Group controlId={`option-${index}`} key={index}>
              <Form.Label>Option {index + 1}</Form.Label>
              <Form.Control
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
              />
            </Form.Group>
          ))}
          <Form.Group controlId="correctAnswer">
            <Form.Label>Correct Answer</Form.Label>
            <Form.Control
              type="text"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" type="submit">
            {editingQuiz ? 'Update Quiz' : 'Add Quiz'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default QuizFormModal;
