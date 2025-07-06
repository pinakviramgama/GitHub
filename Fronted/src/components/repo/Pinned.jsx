import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../user/Navbar";

const Pinned = () => {
  const [pinnedRepos, setPinnedRepos] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchPinnedRepos = async () => {
      try {
        const res = await fetch("http://localhost:3000/repo/getAllRepo");
        const allRepos = await res.json();

        // Filter by owner and pinned
        const filtered = allRepos.filter(
          (repo) => repo.owner === userId && repo.pinned === true
        );

        setPinnedRepos(filtered);
      } catch (err) {
        console.error("Failed to fetch pinned repos:", err);
      }
    };

    fetchPinnedRepos();
  }, [userId]);

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <main className="main-content">
        <h3 className="text-xl font-bold mb-4">📌 Pinned Repositories</h3>
        {pinnedRepos.length === 0 ? (
          <p className="text-sm text-gray-400">No pinned repositories.</p>
        ) : (
          pinnedRepos.map((repo) => (
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

export default Pinned;
