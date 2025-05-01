import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/users?page=${currentPage}&limit=${usersPerPage}`);
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.data);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]);

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName} ${user.university || ''} ${user.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading-spinner">Loading users...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="users-container">
      <h1>Users List</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name, email, or university..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="users-grid">
        {filteredUsers.length === 0 ? (
          <div className="no-results">No users found</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user._id} className="user-card">
              <img
                src={user.image || 'https://via.placeholder.com/150'}
                alt={user.fullName}
                className="user-image"
              />
              <div className="user-info">
                <h3>{user.firstName} {user.lastName}</h3>
                <p>{user.email}</p>
                {user.university && <p>{user.university}</p>}
                <Link to={`/users/${user._id}`} className="view-btn">
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default UsersList;