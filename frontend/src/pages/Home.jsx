import React from "react";
import { Link, NavLink } from "react-router-dom"; // Importing both Link and NavLink

export default function Home() {
  return (
    <div style={{ padding: '30px', textAlign: 'center' }}>
      <h1>🏠 Home Page</h1>
      <p>Welcome to the User Management App</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/users">
          <button>View Users</button>
        </Link>
        <Link to="/add-user" style={{ marginLeft: '10px' }}>
          <button>Add User</button>
        </Link>
        {/* Login Button Link */}
        <NavLink to="/login" style={{ marginLeft: '10px' }}>
          <button>Login</button>
        </NavLink>
      </div>
    </div>
  );
}
