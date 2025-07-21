import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { BASE_URL } from '../config';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role is 'user'
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear previous messages
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        email,
        password,
        role,
        adminCode: role === 'admin' ? adminCode : undefined,
      });
      console.log('Signup successful:', response.data);
      setSuccess('User registered successfully');
    } catch (err) {
      setError(err.response.data.message);
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login'); // Navigate to the Login page
  };

  return (
    <div className="auth-container-small_2080">
      <h2>Signup</h2>
      {error && <p className="error_2080">{error}</p>}
      {success && <p className="success_2080">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group_2080">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group_2080">
          <label>Password</label>
          <div className="input-wrapper_2080">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password_2080"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </span>
          </div>
        </div>
        <div className="form-group_2080">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group_2080">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {role === 'admin' && (
          <div className="form-group_2080">
            <label>Admin Code</label>
            <input
              type="text"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              required
            />
          </div>
        )}
        <button type="submit" className="auth-btn_2080" disabled={isLoading}>
          {isLoading ? <div className="loading-spinner_2080"></div> : 'Signup'}
        </button>
      </form>
      <p>
        Already have an account?{' '}
        <button onClick={handleLoginClick} className="auth-link_2080">
          Log In
        </button>
      </p>
    </div>
  );
};

export default Signup;
