import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...');
      const response = await axios.get(`${BASE_URL}/events`);
      console.log('Raw events data:', response.data);
      
      // Filter out events that have passed their deadline
      const currentTime = new Date();
      const validEvents = response.data.filter(event => {
        const deadline = new Date(event.deadline);
        console.log('Event deadline:', event.title, deadline, 'Current time:', currentTime);
        return deadline > currentTime;
      });
      console.log('Filtered valid events:', validEvents);
      setEvents(validEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ text: 'Please log in to join events', type: 'error' });
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/events/${eventId}/join`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update the events list with the new registration count
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, registeredParticipants: response.data.registeredParticipants }
            : event
        )
      );

      setMessage({ text: response.data.message, type: 'success' });
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Failed to join event', 
        type: 'error' 
      });
    }
  };

  if (loading) {
    return <div className="events-loading">Loading events...</div>;
  }

  if (error) {
    return <div className="events-error">{error}</div>;
  }

  return (
    <div className="events-container">
      <h2>Upcoming Events</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {events.length === 0 ? (
        <p className="no-events">No upcoming events at the moment.</p>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <div key={event.id} className="event-card">
              <h3>{event.title}</h3>
              <div className="event-details">
                <p><strong>Description:</strong> {event.description}</p>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {event.time}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p><strong>Registration Deadline:</strong> {new Date(event.deadline).toLocaleString()}</p>
                <p><strong>Capacity:</strong> {event.registeredParticipants} / {event.maxParticipants}</p>
              </div>
              <button
                className={`join-button ${event.registeredParticipants >= event.maxParticipants ? 'disabled' : ''}`}
                onClick={() => handleJoinEvent(event.id)}
                disabled={event.registeredParticipants >= event.maxParticipants}
              >
                {event.registeredParticipants >= event.maxParticipants 
                  ? 'Event Full' 
                  : 'Join Event'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events; 