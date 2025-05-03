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
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/users?page=${currentPage}&limit=${usersPerPage}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch users');
        }
        
        setUsers(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalUsers(data.pagination.totalItems);
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
    `${user.firstName} ${user.lastName} ${user.email} ${user.university || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) return <div className="loading-spinner">Loading users...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>Users List</h1>
        <Link to="/add-user" className="add-user-btn">
          Add New User
        </Link>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name, email, or university..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="total-users">Total Users: {totalUsers}</span>
      </div>

      <div className="users-grid">
        {filteredUsers.length === 0 ? (
          <div className="no-results">
            {searchTerm ? 'No matching users found' : 'No users available'}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user._id} className="user-card">
              <img
                src={user.image || 'https://via.placeholder.com/150'}
                alt={`${user.firstName} ${user.lastName}`}
                className="user-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
              <div className="user-info">
                <h3>{user.firstName} {user.lastName}</h3>
                <p className="user-email">{user.email}</p>
                {user.university && <p className="user-university">{user.university}</p>}
                <Link 
                  to={`/users/${user._id}`} 
                  className="view-btn"
                  state={{ from: currentPage }}
                >
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
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? 'active' : ''}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
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