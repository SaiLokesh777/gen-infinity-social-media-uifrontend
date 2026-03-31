import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';   // ✅ default import
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    clearTimeout(searchTimeout.current);
    if (q.trim().length > 1) {
      searchTimeout.current = setTimeout(async () => {
        try {
          const res = await userService.searchUsers(q);
          setSearchResults(res.data?.content || res.data || []);
          setShowDropdown(true);
        } catch { setSearchResults([]); }
      }, 350);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const avatarUrl = user?.profilePicture || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">✦</span>
          GenInfinity
        </Link>

        <div className="navbar-search" ref={searchRef}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          />
          {showDropdown && searchResults.length > 0 && (
            <div className="search-dropdown animate-scaleIn">
              {searchResults.slice(0, 6).map((u) => (
                <Link
                  key={u.id || u.username}
                  to={`/profile/${u.username}`}
                  className="search-result-item"
                  onClick={() => { setShowDropdown(false); setSearchQuery(''); }}
                >
                  <img
                    src={u.profilePicture || u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                    alt={u.username}
                  />
                  <div>
                    <span className="result-username">@{u.username}</span>
                    {u.name && <span className="result-name">{u.name}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/create-post" className="nav-link">Post</Link>
          {user && (
            <Link to={`/profile/${user.username}`} className="nav-link nav-username">
              <img
                src={avatarUrl}
                alt={user.username}
                className="nav-avatar"
              />
              {user.username}
            </Link>
          )}
          <button className="grad-btn logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
