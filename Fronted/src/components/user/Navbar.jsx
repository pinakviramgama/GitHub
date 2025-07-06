import { Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search query:", searchQuery);
  };

  return (
    <nav className="navbar">
      {/* Left: Logo */}
      <div className="navbar-left">
        <Link to="/" className="logo">
          <img
            src="https://www.github.com/images/modules/logos_page/GitHub-Mark.png"
            alt="GitHub Logo"
            className="logo-img"
          />
          <h3>GitHub</h3>
        </Link>
      </div>

      {/* Center: Search bar */}
      <form onSubmit={handleSearch} className="navbar-search">
        <Search className="search-icon" size={16} />
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Right: Links */}
      <div className="navbar-right">
        <Link to="/create" className="nav-link">Create a Repository</Link>
        <Link to="/profile" className="nav-link">Profile</Link>

        {/* My Repos Dropdown */}
        <div className="dropdown-container">
          <button
            className="nav-link dropdown-toggle"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            My Repos ▾
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              <Link to="/starred" className="dropdown-item">⭐ Starred Repos</Link>
              <Link to="/pinned" className="dropdown-item">📌 Pinned Repos</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
