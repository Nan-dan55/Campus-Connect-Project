import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // State for managing active tab (event, notice, club)
  const [activeTab, setActiveTab] = useState('event');

  // State for form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    maxParticipants: '',
    deadline: '',
    importance: 'low',
    image: null
  });

  // Add club form state
  const [clubForm, setClubForm] = useState({
    name: '',
    description: '',
    lead: '',
    image: null
  });

  // State for loading and message handling
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // State for pending club requests
  const [pendingClubs, setPendingClubs] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState('');

  // Fetch pending club requests when tab is selected
  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingClubs();
    }
  }, [activeTab]);

  const fetchPendingClubs = async () => {
    setPendingLoading(true);
    setPendingError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/clubs/pending-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPendingClubs(response.data);
    } catch (err) {
      setPendingError('Failed to fetch pending club requests');
    } finally {
      setPendingLoading(false);
    }
  };

  const handleApprove = async (clubId, userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/clubs/${clubId}/approve`, { userId }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPendingClubs();
    } catch (err) {
      alert('Failed to approve request');
    }
  };

  const handleReject = async (clubId, userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/clubs/${clubId}/reject`, { userId }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPendingClubs();
    } catch (err) {
      alert('Failed to reject request');
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ text: 'Authentication token not found. Please log in again.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      // Determine endpoint based on active tab
      const endpoint = activeTab === 'event' ? '/events' : '/notices';
      console.log('Sending request to:', `${BASE_URL}${endpoint}`);
      
      // Create request data object
      const requestData = {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline
      };

      // Add fields based on active tab
      if (activeTab === 'event') {
        Object.assign(requestData, {
          maxParticipants: parseInt(formData.maxParticipants),
          date: formData.date,
          time: formData.time,
          venue: formData.venue
        });
      } else {
        Object.assign(requestData, {
          importance: formData.importance
        });
      }

      console.log('Request data:', requestData);

      const response = await axios.post(`${BASE_URL}${endpoint}`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response:', response.data);

      // Show success message and reset form
      setMessage({ text: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} uploaded successfully!`, type: 'success' });
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        maxParticipants: '',
        deadline: '',
        importance: 'low',
        image: null
      });
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Show error message
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle club form input changes
  const handleClubInputChange = (e) => {
    const { name, value } = e.target;
    setClubForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle club image file selection
  const handleClubImageChange = (e) => {
    setClubForm(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  // Handle club form submission
  const handleClubSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ text: 'Authentication token not found. Please log in again.', type: 'error' });
      setLoading(false);
      return;
    }
    try {
      // Prepare form data for image upload if needed
      const formData = new FormData();
      formData.append('name', clubForm.name);
      formData.append('description', clubForm.description);
      formData.append('lead', clubForm.lead);
      if (clubForm.image) {
        formData.append('image', clubForm.image);
      }
      const response = await axios.post(`${BASE_URL}/clubs`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage({ text: 'Club created successfully!', type: 'success' });
      setClubForm({ name: '', description: '', lead: '', image: null });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Club creation failed';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Tab buttons for switching between event and notice */}
      <div className="tab-buttons">
        <button 
          className={activeTab === 'event' ? 'active' : ''}
          onClick={() => setActiveTab('event')}
        >
          Upload Event
        </button>
        <button 
          className={activeTab === 'notice' ? 'active' : ''}
          onClick={() => setActiveTab('notice')}
        >
          Upload Notice
        </button>
        <button
          className={activeTab === 'club' ? 'active' : ''}
          onClick={() => setActiveTab('club')}
        >
          Create Club
        </button>
        <button
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Pending Club Requests
        </button>
      </div>

      {/* Message display for success/error feedback */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Upload form */}
      {activeTab === 'event' && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Maximum Participants</label>
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Venue</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Registration Deadline</label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Image (Optional)</label>
            <label className="custom-file-label">
              Choose file
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
            {formData.image && (
              <span className="selected-file-name">{formData.image.name}</span>
            )}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : `Upload ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
          </button>
        </form>
      )}
      {/* Notice-specific fields */}
      {activeTab === 'notice' && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Importance</label>
            <select
              name="importance"
              value={formData.importance}
              onChange={handleInputChange}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="form-group">
            <label>Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Image (Optional)</label>
            <label className="custom-file-label">
              Choose file
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
            {formData.image && (
              <span className="selected-file-name">{formData.image.name}</span>
            )}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : `Upload ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
          </button>
        </form>
      )}

      {/* Club creation form */}
      {activeTab === 'club' && (
        <form onSubmit={handleClubSubmit} className="club-form">
          <div className="form-group">
            <label>Club Name</label>
            <input
              type="text"
              name="name"
              value={clubForm.name}
              onChange={handleClubInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={clubForm.description}
              onChange={handleClubInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Lead</label>
            <input
              type="text"
              name="lead"
              value={clubForm.lead}
              onChange={handleClubInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Image (optional)</label>
            <label className="custom-file-label">
              Choose file
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleClubImageChange}
              />
            </label>
            {clubForm.image && (
              <span className="selected-file-name">{clubForm.image.name}</span>
            )}
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Club'}
          </button>
        </form>
      )}

      {/* Pending Club Requests tab */}
      {activeTab === 'pending' && (
        <div className="pending-requests-tab">
          <h2>Pending Club Join Requests</h2>
          {pendingLoading ? (
            <div>Loading...</div>
          ) : pendingError ? (
            <div className="error">{pendingError}</div>
          ) : pendingClubs.length === 0 ? (
            <div>No pending requests.</div>
          ) : (
            <div className="pending-clubs-list">
              {pendingClubs.map(club => (
                <div key={club.id} className="pending-club-card">
                  <h3>{club.name}</h3>
                  <ul>
                    {club.pendingRequests.map(request => (
                      <li key={request.userId} className="pending-request-item">
                        <span><strong>Name:</strong> {request.name || 'N/A'}</span>
                        <span><strong>Email:</strong> {request.email || 'N/A'}</span>
                        <button onClick={() => handleApprove(club.id, request.userId)} className="approve-btn">Approve</button>
                        <button onClick={() => handleReject(club.id, request.userId)} className="reject-btn">Reject</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;