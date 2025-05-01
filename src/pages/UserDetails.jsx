import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        setUser(data.data);
      } catch (err) {
        toast.error(err.message);
        navigate('/users', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('User deleted successfully');
      navigate('/users');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <div className="loading-spinner">Loading user details...</div>;
  if (!user) return <div className="error-message">User not found</div>;

  return (
    <div className="user-details">
      <button onClick={() => navigate(-1)} className="back-btn">
        &larr; Back to Users
      </button>

      <div className="user-profile">
        <img
          src={user.image || 'https://via.placeholder.com/150'}
          alt={user.fullName}
          className="profile-image"
        />
        
        <h2>{user.firstName} {user.lastName}</h2>
        
        <div className="user-meta">
          <p><strong>Email:</strong> {user.email}</p>
          {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
          <p><strong>Gender:</strong> {user.gender}</p>
          {user.age && <p><strong>Age:</strong> {user.age}</p>}
          {user.university && <p><strong>University:</strong> {user.university}</p>}
        </div>

        <div className="action-buttons">
          <button 
            onClick={() => navigate(`/edit-user/${user._id}`)}
            className="edit-btn"
          >
            Edit User
          </button>
          <button 
            onClick={handleDelete}
            disabled={deleting}
            className="delete-btn"
          >
            {deleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDetails;