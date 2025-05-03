// src/pages/VotePage.jsx
import { useState } from 'react';
import { toast } from 'react-toastify';

function VotePage() {
  const [candidate, setCandidate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔓 Get the user from localStorage (make sure it's saved during login)
  const user = JSON.parse(localStorage.getItem('user'));
  console.log('User from localStorage:', user); // 🧪 Debug log

  const voterId = user?.id; // ✅ Use actual user ID
  const candidates = ['Alice', 'Bob', 'Charlie'];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!voterId) {
      toast.error('You must be logged in to vote!');
      return;
    }

    if (!candidate) {
      toast.error('Please select a candidate');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId, candidate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Voting failed');
      }

      toast.success(`Vote submitted for ${candidate}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Vote for Your Candidate</h2>
      <form onSubmit={handleSubmit}>
        {candidates.map((c) => (
          <div key={c} className="form-group">
            <label>
              <input
                type="radio"
                name="candidate"
                value={c}
                checked={candidate === c}
                onChange={(e) => setCandidate(e.target.value)}
              />
              {c}
            </label>
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-btn"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Vote'}
        </button>
      </form>
    </div>
  );
}

export default VotePage;
