import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../user/Navbar";

const Starred = () => {
  const [starredRepos, setStarredRepos] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchStarredRepos = async () => {
      try {
        const res = await fetch("http://localhost:3000/repo/getAllRepo");
        const allRepos = await res.json();

        // Filter by owner and starred
        const filtered = allRepos.filter(
          (repo) => repo.owner === userId && repo.starred === true
        );

        setStarredRepos(filtered);
      } catch (err) {
        console.error("Failed to fetch starred repos:", err);
      }
    };

    fetchStarredRepos();
  }, [userId]);

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <main className="main-content">
        <h3 className="text-xl font-bold mb-4">⭐ Starred Repositories</h3>
        {starredRepos.length === 0 ? (
          <p className="text-sm text-gray-400">No starred repositories.</p>
        ) : (
          starredRepos.map((repo) => (
            <Link key={repo._id} to={`/repo/${repo._id}`}>
              <div className="repo-card">
                <strong className="block text-blue-400 truncate">{repo.reponame}</strong>
                <p className="text-sm text-gray-400 truncate">
                  {repo.description || "No description"}
                </p>
              </div>
            </Link>
          ))
        )}
      </main>
    </div>
  );
};

export default Starred;
