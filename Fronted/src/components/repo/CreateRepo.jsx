import axios from "axios";
import { useState } from "react";
import Navbar from "../user/Navbar"; // Adjust path if needed
import "./createRepo.css"; // Optional styling

const CreateRepo = () => {
  const [formData, setFormData] = useState({
    reponame: "",
    description: "",
    content: "",
    issues: [],
    visibility: "public",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("User not logged in.");
      return;
    }

    const repoData = {
      owner: userId,
      ...formData,
      createdAt: new Date(),
    };

    try {
      const response = await axios.post("http://localhost:3000/repo/create", repoData);
      alert("Repository created successfully!");
      console.log(response.data);
    } catch (err) {
      console.error("Error creating repository:", err);
      alert("Failed to create repository.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-repo-wrapper">
        <h2>Create New Repository</h2>
        <form onSubmit={handleSubmit} className="create-repo-form">
          <input
            type="text"
            name="reponame"
            placeholder="Repository Name"
            value={formData.reponame}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
          <textarea
            name="content"
            placeholder="README content"
            value={formData.content}
            onChange={handleChange}
          ></textarea>
          <select
            name="visibility"
            value={formData.visibility}
            onChange={handleChange}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <button type="submit">Create Repository</button>
        </form>
      </div>
    </>
  );
};

export default CreateRepo;
