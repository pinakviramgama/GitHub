import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../user/Navbar";
import "./dashboard.css";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [pinnedRepoIds, setPinnedRepoIds] = useState([]);
  const [starredRepoIds, setStarredRepoIds] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchRepositories = async () => {
      const response = await fetch(`http://localhost:3000/repo/user/${userId}`);
      const data = await response.json();
      setRepositories(data.repositories);
      setSearchResults(data.repositories);
    };

    const fetchSuggestedRepositories = async () => {
      const response = await fetch(`http://localhost:3000/repo/getAllRepo`);
      const data = await response.json();
      setSuggestedRepositories(data);
    };

    const fetchUserData = async () => {
      const repoRes = await fetch("http://localhost:3000/repo/getAllRepo");
      const allRepos = await repoRes.json();

      const starred = allRepos
        .filter((repo) => repo.owner === userId && repo.starred)
        .map((repo) => repo._id);
      setStarredRepoIds(starred);

      const pinned = allRepos
        .filter((repo) => repo.owner === userId && repo.pinned)
        .map((repo) => repo._id);
      setPinnedRepoIds(pinned);
    };

    fetchRepositories();
    fetchSuggestedRepositories();
    fetchUserData();
  }, [userId]);

  const handleSearchQuery = async (query) => {
    setSearchQuery(query);
    setShowSuggestions(true);

    // If input is empty, show all
    if (!query.trim()) {
      setSearchResults(repositories);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/repo/search?query=${encodeURIComponent(query)}&userId=${userId}`);
      const data = await res.json();

      if (Array.isArray(data.results)) {
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    }
  };

  const handleSuggestionClick = (repoName) => {
    setSearchQuery(repoName);
    setShowSuggestions(false);
    handleSearchQuery(repoName);
  };

  const handlePin = async (repoId) => {
    try {
      const res = await fetch(`http://localhost:3000/repo/pin/${repoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.pinned) {
        setPinnedRepoIds((prev) => [...prev, repoId]);
      } else {
        setPinnedRepoIds((prev) => prev.filter((id) => id !== repoId));
      }
    } catch (err) {
      console.error("Error pinning repo:", err);
    }
  };

  const handleStar = async (repoId) => {
    try {
      const res = await fetch(`http://localhost:3000/repo/star/${repoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.starred) {
        setStarredRepoIds((prev) => [...prev, repoId]);
      } else {
        setStarredRepoIds((prev) => prev.filter((id) => id !== repoId));
      }
    } catch (err) {
      console.error("Error starring repo:", err);
    }
  };

  const isPinned = (repoId) => pinnedRepoIds.includes(repoId);
  const isStarred = (repoId) => starredRepoIds.includes(repoId);

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-layout">
        {/* LEFT SIDEBAR */}
        <aside className="sidebar">
          <h3 className="text-lg font-semibold mb-3">Suggested Repositories</h3>
          {suggestedRepositories.length === 0 ? (
            <p className="text-sm text-gray-400">No suggestions available.</p>
          ) : (
            suggestedRepositories.map((repo) => (
              <div key={repo._id} className={`repo-card ${isPinned(repo._id) ? "pinned" : ""}`}>
                <Link to={`/repo/${repo._id}`}>
                  <strong className="block text-blue-400 truncate">{repo.reponame}</strong>
                  <p className="text-sm text-gray-400 truncate">
                    {repo.description || "No description"}
                  </p>
                </Link>

                <div className="repo-actions">
                  <button
                    className={`star-button ${isPinned(repo._id) ? "active" : ""}`}
                    onClick={() => handlePin(repo._id)}
                  >
                    {isPinned(repo._id) ? "📌 Pinned Repo" : "📌 Pin"}
                  </button>

                  <button
                    className={`star-button ${isStarred(repo._id) ? "active" : ""}`}
                    onClick={() => handleStar(repo._id)}
                  >
                    {isStarred(repo._id) ? "⭐ Starred Repo" : "⭐ Star"}
                  </button>
                </div>
              </div>
            ))
          )}
        </aside>

        {/* MAIN SECTION */}
        <main className="main-content">
          <h3 className="text-lg font-semibold mb-4">Your Repositories</h3>

          <div style={{ position: "relative", marginBottom: "1rem" }}>
  <input
    type="text"
    placeholder="Search your repositories..."
    value={searchQuery}
    onChange={(e) => handleSearchQuery(e.target.value)}
    onFocus={() => setShowSuggestions(true)}
    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
    style={{
      width: "100%",
      padding: "8px 12px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize: "14px",
    }}
  />
  {showSuggestions && searchQuery && (
    <ul
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        background: "#fff",
        border: "1px solid #ccc",
        borderTop: "none",
        maxHeight: "200px",
        overflowY: "auto",
        zIndex: 10,
        borderRadius: "0 0 4px 4px",
      }}
    >
      {searchResults.length === 0 ? (
        <li style={{ padding: "8px", color: "#888" }}>No matches found</li>
      ) : (
        searchResults.map((repo) => (
          <li
            key={repo._id}
            style={{
              padding: "8px",
              cursor: "pointer",
              borderBottom: "1px solid #eee",
            }}
            onClick={() => handleSuggestionClick(repo.reponame)}
          >
            {repo.reponame}
          </li>
        ))
      )}
    </ul>
  )}
</div>


          {/* Repository results */}
          {searchResults.length === 0 ? (
            <p className="text-sm text-gray-400">No repositories found.</p>
          ) : (
            searchResults.map((repo) => (
              <div key={repo._id} className="repo-card">
                <Link to={`/repo/${repo._id}`}>
                  <strong className="block text-blue-400 truncate">{repo.reponame}</strong>
                  <p className="text-sm text-gray-400 truncate">
                    {repo.description || "No description"}
                  </p>
                </Link>
              </div>
            ))
          )}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="right-sidebar">
          <h3 className="text-lg font-semibold mb-3">Upcoming Events</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>Tech Conference - Dec 15</li>
            <li>Developer Meetup - Dec 25</li>
            <li>React Summit - Jan 5</li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
