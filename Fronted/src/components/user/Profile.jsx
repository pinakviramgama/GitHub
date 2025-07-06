import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../user/Navbar";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:3000/getUserProfile/${userId}`);
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate, userId]);

  useEffect(() => {
    if (!user?.repositories || user.repositories.length === 0) return;

    const fetchAllUserRepos = async () => {
      try {
        const allRepos = await Promise.all(
          user.repositories.map(async (repoId) => {
            const res = await fetch(`http://localhost:3000/repo/${repoId}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.repository;
          })
        );

        const validRepos = allRepos.filter((r) => r !== null);
        setRepos(validRepos);
      } catch (err) {
        console.error("Error fetching user's repos:", err);
      }
    };

    fetchAllUserRepos();
  }, [user]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleDeleteRepo = async (repoId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this repository?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:3000/repo/delete/${repoId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRepos((prev) => prev.filter((r) => r._id !== repoId));
      } else {
        console.error("Failed to delete repo");
      }
    } catch (err) {
      console.error("Error deleting repo:", err);
    }
  };

  const handleUpdateRepo = async (repoId) => {
    const newName = prompt("Enter new repository name:");
    const newDesc = prompt("Enter new description:");
    if (!newName && !newDesc) return;

    try {
      const res = await fetch(`http://localhost:3000/repo/update/${repoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reponame: newName, description: newDesc }),
      });

      if (res.ok) {
        const updated = await res.json();
        setRepos((prev) => prev.map((r) => (r._id === repoId ? updated.repo : r)));
        navigate("/profile");
        window.location.reload(); // forces state reset

      } else {
        console.error("Failed to update repo");
      }
    } catch (err) {
      console.error("Error updating repo:", err);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />

      <div className="profile-container" style={{ padding: "2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h2>Welcome, {user.username}</h2>
          <p>Total Repositories: {user.repositories.length}</p>
          <p>Public Repositories: {repos.filter((repo) => !repo.private).length}</p>
          <p>Email: {user.email}</p>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <h3>{user.username}'s Repositories</h3>
          {repos.length === 0 ? (
            <p>No repositories found.</p>
          ) : (
            repos.map((repo) => (
              <div
                key={repo._id}
                style={{
                  padding: "1rem",
                  marginBottom: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                <h4>{repo.reponame}</h4>
                <p>{repo.description || "No description"}</p>
                <button
                  onClick={() => handleDeleteRepo(repo._id)}
                  style={{
                    marginRight: "0.5rem",
                    backgroundColor: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                >
                  🗑️ Delete
                </button>
                <button
                  onClick={() => handleUpdateRepo(repo._id)}
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                >
                  ✏️ Update
                </button>
              </div>
            ))
          )}
        </div>
        <button
          style={{
            marginTop: "1rem",
            border: "1px solid rgb(140, 187, 242)",
            padding: "8px 16px",
            cursor: "pointer",
          }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </>
  );
};

export default Profile;
