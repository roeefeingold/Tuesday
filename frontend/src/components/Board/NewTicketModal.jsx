import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Select from '../common/Select';
import { PRIORITIES, CATEGORIES } from '../../utils/constants';
import { get, post } from '../../api/client';
import './NewTicketModal.css';

export default function NewTicketModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('task');
  const [assigneeId, setAssigneeId] = useState('');
  const [developers, setDevelopers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      get('/users/developers')
        .then((res) => setDevelopers(res.data))
        .catch(() => {});
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('task');
      setAssigneeId('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
      };
      if (assigneeId) {
        payload.assignee_id = assigneeId;
      }
      await post('/tickets', payload);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const devOptions = developers.map((d) => ({
    value: String(d.id),
    label: d.full_name,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Ticket" size="md">
      <form className="new-ticket-form" onSubmit={handleSubmit}>
        {error && <div className="new-ticket-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Title *</label>
          <input
            type="text"
            className="form-input"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            placeholder="Add more details..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-row">
          <Select
            label="Priority"
            value={priority}
            onChange={setPriority}
            options={PRIORITIES}
          />
          <Select
            label="Category"
            value={category}
            onChange={setCategory}
            options={CATEGORIES}
          />
        </div>

        <Select
          label="Assignee"
          value={assigneeId}
          onChange={setAssigneeId}
          options={devOptions}
          placeholder="Unassigned"
        />

        <div className="form-actions">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Ticket'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
