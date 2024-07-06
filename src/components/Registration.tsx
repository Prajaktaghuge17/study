import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { auth } from './firebase';
import { useMutation } from '@tanstack/react-query';
import { createUserWithEmailAndPassword, AuthErrorCodes } from 'firebase/auth';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import './Register.css';

interface RegisterUserParams {
  email: string;
  password: string;
}

const registerUser = async ({ email, password }: RegisterUserParams) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
};

const schema = yup.object({
  email: yup.string().email('This must be a valid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters').matches(/^(?=.*[A-Z])/, 'Password must contain at least one capital letter'),
}).required();

interface IFormInput {
  email: string;
  password: string;
}

const Registration: React.FC = () => {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>({
    resolver: yupResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: useCallback(() => {
      alert('Account Created Successfully. Please log in.');
      navigate('/login');
    }, [navigate]),
    onError: useCallback((error: any) => {
      if (error.code === AuthErrorCodes.EMAIL_EXISTS) {
        alert('This email is already in use. Please use another email.');
      } else {
        console.error('Error registering:', error);
        alert('Failed to create account. Please try again.');
      }
    }, []),
  });

  const onSubmit: SubmitHandler<IFormInput> = useCallback((data) => {
    mutation.mutate(data);
  }, [mutation]);

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form className="mt-5 p-4 border rounded shadow" onSubmit={handleSubmit(onSubmit)}>
            <h2 className="mb-4 text-center">Register</h2>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                {...register("email")}
                required
              />
              {errors.email && (
                <span className="field-level-error form-text text-danger">{errors.email.message}</span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                {...register("password")}
                required
              />
              {errors.password && (
                <span className="field-level-error form-text text-danger">{errors.password.message}</span>
              )}
            </div>
            <div className="mb-3">
              <button type="submit" className="btn btn-primary w-100">Register</button>
            </div>
            <p className="text-center">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;
