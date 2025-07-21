import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import './Clubs.css';
import { BiGroup } from 'react-icons/bi';

const Clubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinName, setJoinName] = useState({}); // { clubId: name }
  const [optimisticPending, setOptimisticPending] = useState({}); // { clubId: true }
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchClubs();
    // Optionally, refetch on focus or interval for real-time updates
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/clubs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setClubs(response.data);
    } catch (err) {
      setError('Failed to fetch clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (clubId) => {
    if (!joinName[clubId]) return;
    try {
      await axios.post(`${BASE_URL}/clubs/${clubId}/join`, { name: joinName[clubId] }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOptimisticPending(prev => ({ ...prev, [clubId]: true })); // Optimistically show pending
      fetchClubs(); // Refresh club data to update status
    } catch (err) {
      alert('Failed to send join request');
    }
  };

  const handleLeave = async (clubId) => {
    try {
      await axios.post(`${BASE_URL}/clubs/${clubId}/leave`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchClubs(); // Refresh club data to update status
    } catch (err) {
      alert('Failed to leave club');
    }
  };

  // Helper to get status for a club
  const getStatus = (club) => {
    if (club.members && club.members.includes(userId)) return 'member';
    if (club.pendingRequests && club.pendingRequests.some(r => r.userId === userId)) return 'pending';
    if (optimisticPending[club.id]) return 'pending';
    return null;
  };

  if (loading) return <div>Loading clubs...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="clubs-container">
      <h2>Campus Clubs</h2>
      <div className="clubs-list">
        {clubs.map(club => {
          const status = getStatus(club);
          return (
            <div key={club.id} className="club-card">
              {club.image ? (
                <img src={club.image} alt={club.name} className="club-image" />
              ) : (
                <div className="club-image club-placeholder">
                  <BiGroup size={48} color="#fe5d26" />
                </div>
              )}
              <h3>{club.name}</h3>
              <p><span style={{ color: '#f2c078', fontWeight: 600 }}>Lead:</span> <span style={{ color: '#faedca' }}>{club.lead}</span></p>
              <p>{club.description}</p>
              {status === 'member' ? (
                <>
                  <div className="club-status active">Active Member</div>
                  <button onClick={() => handleLeave(club.id)} className="leave-btn">Leave Club</button>
                </>
              ) : status === 'pending' ? (
                <div className="club-status pending">Request Pending</div>
              ) : (
                <div className="join-form">
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={joinName[club.id] || ''}
                    onChange={e => setJoinName(prev => ({ ...prev, [club.id]: e.target.value }))}
                  />
                  <button onClick={() => handleJoin(club.id)} className="join-btn">Join</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Clubs; 