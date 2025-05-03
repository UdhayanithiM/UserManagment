import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import UsersList from './pages/UsersList';
import UserDetails from './pages/UserDetails';
import AddUser from './pages/NewUserForm';
import EditUserForm from './pages/EditUserForm';
import VotePage from './pages/VotePage';
import LoginPage from './pages/LoginPage';
import ResultsPage from './pages/ResultsPage';

import PrivateRoute from './components/PrivateRoute'; // ✅ import PrivateRoute

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="main-nav">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Home
          </NavLink>
          <NavLink 
            to="/users" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Users
          </NavLink>
          <NavLink 
            to="/add-user" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Add User
          </NavLink>
          <NavLink 
            to="/vote" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Vote
          </NavLink>
          <NavLink 
            to="/results" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Results
          </NavLink>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="/users/:id" element={<UserDetails />} />
            <Route path="/add-user" element={<AddUser />} />
            <Route path="/edit-user/:id" element={<EditUserForm />} />
            <Route path="/vote" element={<VotePage />} />
            <Route
              path="/results"
              element={
                <PrivateRoute>
                  <ResultsPage />
                </PrivateRoute>
              }
            /> {/* ✅ Protected route */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
