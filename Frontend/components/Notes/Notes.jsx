import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import './Notes.css';

const branches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'OTHER'];
const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

const Notes = () => {
  const [selectedBranch, setSelectedBranch] = useState('CSE');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [form, setForm] = useState({ title: '', link: '', branch: 'CSE', semester: '1' });
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, [selectedBranch, selectedSemester]);

  const fetchNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${BASE_URL}/notes`, {
        params: { branch: selectedBranch, semester: selectedSemester }
      });
      setNotes(response.data);
    } catch (err) {
      setError('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadMsg('');
    try {
      await axios.post(`${BASE_URL}/notes`, {
        title: form.title,
        link: form.link,
        branch: form.branch,
        semester: form.semester
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUploadMsg('Note uploaded successfully!');
      setForm({ title: '', link: '', branch: selectedBranch, semester: selectedSemester });
      fetchNotes();
    } catch (err) {
      setUploadMsg('Failed to upload note');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="notes-container">
      <h2>Notes Repository</h2>
      <div className="notes-filter-bar">
        <label>Branch:
          <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>
        <label>Semester:
          <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <div className="notes-upload-section">
        <h3>Upload a Note</h3>
        <form onSubmit={handleUpload} className="notes-upload-form">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleFormChange}
            required
          />
          <input
            type="url"
            name="link"
            placeholder="Paste Google Drive/Dropbox/other link"
            value={form.link}
            onChange={handleFormChange}
            required
          />
          <select name="branch" value={form.branch} onChange={handleFormChange} required>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select name="semester" value={form.semester} onChange={handleFormChange} required>
            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
        </form>
        {uploadMsg && <div className="upload-msg">{uploadMsg}</div>}
      </div>

      <div className="notes-list-section">
        <h3>Available Notes</h3>
        {loading ? (
          <div>Loading notes...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : notes.length === 0 ? (
          <div>No notes found for this branch/semester.</div>
        ) : (
          <ul className="notes-list">
            {notes.map(note => {
              console.log('Note:', note);
              return (
                <li key={note.id} className="note-item">
                  <span className="note-title">{note.title}</span>
                  <span className="note-meta">{note.uploaderEmail} | {new Date(note.createdAt).toLocaleString()}</span>
                  {note.link ? (
                    <a href={note.link} target="_blank" rel="noopener noreferrer" className="download-link">View/Download</a>
                  ) : (
                    <span style={{color: 'red'}}>No link provided</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notes; 