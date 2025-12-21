"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Loader from "@/components/Loader";
// Removed mock API - using real API calls

interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const availableTech = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "HTML",
  "CSS",
  "Tailwind",
  "MongoDB",
  "PostgreSQL",
  "Firebase",
  "AWS",
  "Docker",
  "Git",
  "Figma",
  "Three.js",
  "WebGL",
];

export default function PortfolioPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    tech_stack: [] as string[],
    github_url: "",
    live_url: "",
  });
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTech, setFilterTech] = useState("All");

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/${user!._id}/projects`);
      const projectsData = await response.json();
      setProjects(projectsData);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadProjects();
  }, [user, router, loadProjects]);

  const handleAddProject = useCallback(async () => {
    if (!user || !newProject.title.trim() || !newProject.description.trim())
      return;

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          title: newProject.title,
          description: newProject.description,
          techStack: selectedTech,
          githubUrl: newProject.github_url || undefined,
          liveUrl: newProject.live_url || undefined,
        }),
      });
      await response.json();

      // Award points for adding a project
      await fetch(`/api/user/${user._id}/points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: 25 }),
      });

      setNewProject({
        title: "",
        description: "",
        tech_stack: [],
        github_url: "",
        live_url: "",
      });
      setSelectedTech([]);
      setShowAddForm(false);
      loadProjects();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  }, [user, newProject, selectedTech, loadProjects]);

  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      if (!user) return;

      try {
        await fetch(`/api/projects/${projectId}`, {
          method: "DELETE",
        });
        loadProjects();
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    },
    [user, loadProjects]
  );

  const toggleTech = useCallback((tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTech =
      filterTech === "All" || project.techStack.includes(filterTech);
    return matchesSearch && matchesTech;
  });

  if (!user) {
    return <Loader message="Loading portfolio data..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            My Portfolio 🎨
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Showcase your projects and build your professional portfolio.
          </p>
        </div>

        {/* Add Project Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-6 border border-green-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-black">Add New Project</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
            >
              {showAddForm ? "Cancel" : "Add Project"}
            </button>
          </div>

          {showAddForm && (
            <div className="space-y-4">
              <Input
                placeholder="Project Title"
                value={newProject.title}
                onChange={(e) =>
                  setNewProject((prev) => ({ ...prev, title: e.target.value }))
                }
                className="text-lg p-4 rounded-2xl border-2 border-gray-200 focus:border-green-500"
              />

              <textarea
                placeholder="Project Description"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:outline-none resize-none"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="GitHub URL (optional)"
                  value={newProject.github_url}
                  onChange={(e) =>
                    setNewProject((prev) => ({
                      ...prev,
                      github_url: e.target.value,
                    }))
                  }
                  className="p-4 rounded-2xl border-2 border-gray-200 focus:border-green-500"
                />
                <Input
                  placeholder="Live Demo URL (optional)"
                  value={newProject.live_url}
                  onChange={(e) =>
                    setNewProject((prev) => ({
                      ...prev,
                      live_url: e.target.value,
                    }))
                  }
                  className="p-4 rounded-2xl border-2 border-gray-200 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tech Stack (select technologies used):
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTech.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => toggleTech(tech)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedTech.includes(tech)
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProject}
                  disabled={
                    !newProject.title.trim() || !newProject.description.trim()
                  }
                  className="px-6 py-2 rounded-2xl bg-gradient-to-r from-green-600 to-blue-600 text-white"
                >
                  Add Project
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all duration-200"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-white">🔍</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterTech("All")}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  filterTech === "All"
                    ? "bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {availableTech.slice(0, 6).map((tech) => (
                <button
                  key={tech}
                  onClick={() => setFilterTech(tech)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    filterTech === tech
                      ? "bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200/50 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {project.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete project"
                  >
                    🗑️
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Tech Stack */}
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex items-center space-x-3">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors"
                      >
                        <span>🐙</span>
                        <span className="text-sm font-medium">GitHub</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-2xl hover:bg-blue-200 transition-colors"
                      >
                        <span>🌐</span>
                        <span className="text-sm font-medium">Live Demo</span>
                      </a>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    Added {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && !isLoading && (
          <div className="text-center py-10 border border-white rounded-3xl p-6">
            <div className="text-8xl mb-6">🎨</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {searchQuery || filterTech !== "All"
                ? "No projects found"
                : "No projects yet"}
            </h3>
            <p className="text-white mb-6">
              {searchQuery || filterTech !== "All"
                ? "Try adjusting your search or filter."
                : "Start building your portfolio by adding your first project!"}
            </p>
            {!searchQuery && filterTech === "All" && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
              >
                Add First Project
              </button>
            )}
          </div>
        )}

        {/* Portfolio Stats */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-200/50 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📊 Portfolio Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center bg-white/60 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-black text-green-600 mb-2">
                {projects.length}
              </div>
              <div className="text-gray-700 font-medium">Total Projects</div>
            </div>
            <div className="text-center bg-white/60 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-black text-blue-600 mb-2">
                {projects.filter((p) => p.githubUrl).length}
              </div>
              <div className="text-gray-700 font-medium">With GitHub</div>
            </div>
            <div className="text-center bg-white/60 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-black text-purple-600 mb-2">
                {projects.filter((p) => p.liveUrl).length}
              </div>
              <div className="text-gray-700 font-medium">Live Demos</div>
            </div>
            <div className="text-center bg-white/60 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-black text-orange-600 mb-2">
                {
                  Array.from(new Set(projects.flatMap((p) => p.techStack)))
                    .length
                }
              </div>
              <div className="text-gray-700 font-medium">Technologies</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
