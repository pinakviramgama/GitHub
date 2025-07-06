import { BookOpen, Clock, Eye, GitBranch, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../user/Navbar"; // Assuming Navbar is correctly imported and styled

const Repo = () => {
  const { id } = useParams();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("code"); // State for active tab

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const res = await fetch(`http://localhost:3000/repo/${id}`);
        const data = await res.json();
        setRepo(data.repository);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepo();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#0d1117] min-h-screen flex items-center justify-center text-white">
        <p className="text-lg">Loading repository data...</p>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="bg-[#0d1117] min-h-screen flex items-center justify-center text-white">
        <p className="text-lg">Repository not found.</p>
      </div>
    );
  }

  const { reponame, description, visibility, content, issues = [], createdAt } = repo;

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-[#0d1117] min-h-screen text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="border-b border-gray-700 pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-blue-500">
              <BookOpen size={24} className="text-gray-500" />
              <span>{reponame}</span>
              <span className="">
                {visibility === "public" ? "Public" : "Private"}
              </span>
            </h1>
            <p className="text-gray-400 mt-2 text-md">
              {description || "No description provided."}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-300">
            {/* Star Button */}
            <button className="flex items-center gap-1 px-3 py-1 bg-[#21262d] border border-gray-600 rounded-md hover:bg-[#30363d] transition-colors">
              <Star size={16} className="text-yellow-300" />
              <span>Star</span>
              <span className="ml-1 text-gray-400">12</span> {/* Placeholder for dynamic stars */}
            </button>

            {/* Watch Button (similar to GitHub's eye icon) */}
            <button className="flex items-center gap-1 px-3 py-1 bg-[#21262d] border border-gray-600 rounded-md hover:bg-[#30363d] transition-colors">
              <Eye size={16} className="text-purple-300" />
              <span>Watch</span>
              <span className="ml-1 text-gray-400">0</span> {/* Placeholder for dynamic watches */}
            </button>

            {/* Fork Button */}
            <button className="flex items-center gap-1 px-3 py-1 bg-[#21262d] border border-gray-600 rounded-md hover:bg-[#30363d] transition-colors">
              <GitBranch size={16} className="text-green-300" />
              <span>Fork</span>
              <span className="ml-1 text-gray-400">0</span> {/* Placeholder for dynamic forks */}
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="border-b border-gray-700 mb-6">
          <ul className="flex gap-6 text-md font-medium -mb-px"> {/* -mb-px to align border properly */}
            <li>
              <button
                onClick={() => setActiveTab("code")}
                className={`py-3 px-1 border-b-2 ${
                  activeTab === "code"
                    ? "text-blue-400 border-blue-400"
                    : "text-gray-400 border-transparent hover:text-white hover:border-gray-500"
                } transition-colors duration-200`}
              >
                Code
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("issues")}
                className={`py-3 px-1 border-b-2 ${
                  activeTab === "issues"
                    ? "text-blue-400 border-blue-400"
                    : "text-gray-400 border-transparent hover:text-white hover:border-gray-500"
                } transition-colors duration-200`}
              >
                Issues <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-gray-700 rounded-full">{issues.length}</span>
              </button>
            </li>
            {/* Add more tabs like Pull Requests, Actions, Projects, Wiki, Security, Insights, Settings */}
          </ul>
        </nav>

        {/* Main Content Area */}
        {activeTab === "code" && (
          <section>
            {/* Branch Selector and Latest Commit Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#161b22] border border-gray-700 rounded-t-lg p-3">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 sm:mb-0">
                <GitBranch size={16} className="text-gray-500" />
                <span className="font-semibold text-gray-300">main</span>
                {/* Add a dropdown for branch selection here */}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock size={16} className="text-gray-500" />
                <span>Last updated {formatDate(createdAt)}</span>
              </div>
            </div>

            {/* Code Viewer / File Explorer */}
            <div className="bg-[#0d1117] border border-t-0 border-gray-700 rounded-b-lg overflow-hidden">
              {/* This section would typically list files and folders. For now, we'll keep the code content */}
              <div className="p-5">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-200 bg-gray-900 p-4 rounded-md overflow-x-auto">
                  {content || "// No content available in this repository yet."}
                </pre>
              </div>
            </div>
          </section>
        )}

        {activeTab === "issues" && (
          <section className="bg-[#161b22] border border-gray-700 rounded-lg p-5">
            <h3 className="text-xl font-semibold mb-4">Issues</h3>
            {issues.length > 0 ? (
              <ul>
                {issues.map((issue, index) => (
                  <li key={index} className="border-b border-gray-700 py-2 last:border-b-0">
                    <p className="text-blue-400 hover:underline cursor-pointer">
                      {issue.title || `Issue #${index + 1}`}
                    </p>
                    <p className="text-sm text-gray-400">
                      Opened by {issue.author || "Unknown"} on {formatDate(issue.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No issues found for this repository.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Repo;