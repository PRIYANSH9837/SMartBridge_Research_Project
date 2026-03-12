import React, { useState, useEffect } from "react";
import {
  Search,
  MessageSquare,
  FileText,
  
  Menu,
  X,
  LayoutDashboard,
  Upload,
  Home,
  ChevronLeft,
  ChevronRight,
  Atom,
  Plus,
  Folder,
  File,
  
  Users,
  TrendingUp,
  
  AlertCircle,
  
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  ExternalLink
} from "lucide-react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import CreateNewWorkspace from "./Workspace";

interface DashboardData {
  user: {
    full_name: string;
    email: string;
    username: string;
    created_at?: string;
  };
  stats: {
    total_workspaces: number;
    total_papers: number;
    papers_analyzed: number;
    total_analyses?: number;
  };
  workspaces: Array<{
    id: number;
    name: string;
    description: string;
    color: string;
    created: string;
    papers: number;
    papers_count?: number;
    analyses_count?: number;
    last_accessed?: string;
  }>;
}
const API_BASE_URL = import.meta.env.VITE_API_URL;
const ResearchHubDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Fetch Dashboard Data
  const fetchDashboard = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error('Session expired. Please login again.', { id: 'session-expired' });
          navigate("/");
          return;
        }
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      
      // Enrich workspace data
      const enrichedData = {
        ...data,
        workspaces: data.workspaces.map((ws: any) => ({
          ...ws,
          analyses_count: Math.floor(Math.random() * 5) + 1, // Mock data - replace with real data
          last_accessed: new Date(Date.now() - Math.random() * 7 * 24 * 3600000).toISOString()
        }))
      };
      
      setDashboardData(enrichedData);
      setError(null);
      
      if (showRefreshing) {
        toast.success('Dashboard refreshed!', { 
          id: 'dashboard-refresh', 
          icon: '🔄',
          duration: 3000
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to load dashboard: ${err.message}`, { id: 'dashboard-error' });
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    
    // Welcome toast
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      toast.success(`Welcome back, ${userData.full_name.split(' ')[0]}!`, {
        id: 'welcome',
        icon: '👋',
        duration: 4000
      });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success('Logged out successfully', { 
      id: 'logout',
      icon: '👋',
      duration: 3000
    });
    navigate("/");
  };

  const handleWorkspaceCreated = (newWorkspace: any) => {
    setDashboardData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        workspaces: [{
          ...newWorkspace,
          analyses_count: 0,
          last_accessed: new Date().toISOString()
        }, ...prev.workspaces],
        stats: {
          ...prev.stats,
          total_workspaces: prev.stats.total_workspaces + 1
        }
      };
    });
    
    setIsCreateModalOpen(false);
    
    toast.success(`Workspace "${newWorkspace.name}" created successfully!`, {
      id: 'workspace-created',
      icon: '✅',
      duration: 5000
    });
  };

  const handleWorkspaceClick = (workspaceId: number) => {
    navigate(`/workspaces/${workspaceId}`);
  };

  const handleViewWorkspace = (e: React.MouseEvent, workspaceId: number) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/workspaces/${workspaceId}`);
  };

  const handleEditWorkspace = (e: React.MouseEvent, workspaceId: number) => {
    e.preventDefault();
    e.stopPropagation();
    toast.loading('Opening workspace editor...', { id: 'edit-workspace' });
    navigate(`/workspaces/${workspaceId}/edit`);
  };

  const handleDeleteClick = (e: React.MouseEvent, workspaceId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedWorkspace(workspaceId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteWorkspace = async () => {
    if (!selectedWorkspace) return;


    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/workspaces/${selectedWorkspace}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete workspace");

      // Update UI
      setDashboardData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          workspaces: prev.workspaces.filter(w => w.id !== selectedWorkspace),
          stats: {
            ...prev.stats,
            total_workspaces: prev.stats.total_workspaces - 1
          }
        };
      });

      setShowDeleteConfirm(false);
      setSelectedWorkspace(null);
      
      toast.success('Workspace deleted successfully', {
        id: 'deleting-workspace',
        icon: '🗑️',
        duration: 4000
      });
    } catch (err: any) {
      toast.error(`Failed to delete workspace: ${err.message}`, {
        id: 'deleting-workspace',
        duration: 5000
      });
    }
  };

  const handleRefresh = () => {
    fetchDashboard(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-red-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>{error || "Failed to load dashboard"}</p>
          <button 
            onClick={() => fetchDashboard()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Search Papers", path: "/search", icon: <Search className="w-5 h-5" /> },
    { name: "AI Tools", path: "/ai-tools", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Upload PDF", path: "/upload", icon: <Upload className="w-5 h-5" /> },
    { name: "DocSpace", path: "/docspace", icon: <FileText className="w-5 h-5" /> },
  ];

  const workspaces = dashboardData?.workspaces || [];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      green: "bg-green-500/20 text-green-400 border-green-500/30",
      orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      red: "bg-red-500/20 text-red-400 border-red-500/30",
      yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gray-800 border-r border-gray-700 transition-all duration-300 z-40 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        } hidden md:block`}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <Atom className="w-6 h-6 text-purple-400" />
                <h1 className="text-xl font-bold text-white">ResearchHub AI</h1>
              </div>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-300" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-300" />
              )}
            </button>
          </div>

          <nav className="flex-1 py-6 px-3">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-purple-400 transition-colors ${
                      isSidebarCollapsed ? "justify-center" : ""
                    }`}
                    title={isSidebarCollapsed ? item.name : undefined}
                  >
                    {item.icon}
                    {!isSidebarCollapsed && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-700">
            <div
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center">
                <span className="text-sm font-medium text-purple-400">
                  {dashboardData?.user?.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {dashboardData?.user?.full_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {dashboardData?.user?.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 z-30">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="hidden md:flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-white">Dashboard</h1>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <Atom className="w-5 h-5 text-purple-400" />
              <h1 className="text-xl font-bold text-white">ResearchHub AI</h1>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center focus:outline-none"
              >
                <span className="text-sm font-medium text-purple-400">
                  {dashboardData?.user?.full_name?.charAt(0).toUpperCase()}
                </span>
              </button>

              {/* Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="py-2 flex flex-col">
                    <span className="px-4 py-2 text-sm text-gray-300 cursor-default truncate">
                      {dashboardData?.user?.full_name}
                    </span>
                    <span className="px-4 py-1 text-xs text-gray-500 cursor-default truncate">
                      {dashboardData?.user?.email}
                    </span>
                    <hr className="my-1 border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm text-white hover:bg-red-600 rounded-lg transition-colors text-left"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-700 bg-gray-800">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive
                          ? "bg-gray-700 text-purple-400"
                          : "text-gray-300 hover:text-purple-400 hover:bg-gray-700"
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome back,{" "}
                {dashboardData?.user?.full_name?.split(" ")[0]}!
              </h2>
              <p className="text-gray-400">
                Manage your research workspaces and track your progress
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-900/20"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Workspace</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Folder className="w-6 h-6 text-purple-400" />}
              title="Total Workspaces"
              value={dashboardData?.stats?.total_workspaces || 0}
              subtitle={`${workspaces.filter(w => w.papers > 0).length} active`}
              bgColor="purple"
            />
            <StatCard
              icon={<File className="w-6 h-6 text-blue-400" />}
              title="Papers Imported"
              value={dashboardData?.stats?.total_papers || 0}
              subtitle={`${dashboardData?.stats?.papers_analyzed || 0} analyzed`}
              bgColor="blue"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6 text-green-400" />}
              title="Papers Analyzed"
              value={dashboardData?.stats?.papers_analyzed || 0}
              subtitle={`${Math.round((dashboardData?.stats?.papers_analyzed || 0) / Math.max(dashboardData?.stats?.total_papers || 1, 1) * 100)}% of total`}
              bgColor="green"
            />
            <StatCard
              icon={<Users className="w-6 h-6 text-orange-400" />}
              title="Total Analyses"
              value={dashboardData?.stats?.total_analyses || Math.floor((dashboardData?.stats?.papers_analyzed || 0) * 1.5)}
              subtitle="Including summaries & reviews"
              bgColor="orange"
            />
          </div>

          {/* Workspaces Section */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Folder className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Your Workspaces</h3>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400">
                  {workspaces.length} total
                </span>
              </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900/50">
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Workspace
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Papers
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Analyses
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="text-right py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workspaces.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <Folder className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <p className="mb-2">No workspaces yet</p>
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="text-purple-400 hover:text-purple-300 font-medium"
                        >
                          Create your first workspace
                        </button>
                      </td>
                    </tr>
                  ) : (
                    workspaces.slice(0, 5).map((workspace: any) => (
                      <tr
                        key={workspace.id}
                        onClick={() => handleWorkspaceClick(workspace.id)}
                        className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-lg ${getColorClasses(
                                workspace.color
                              )} flex items-center justify-center border`}
                            >
                              <span className="text-sm font-bold">
                                {workspace.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-white font-medium">
                              {workspace.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-400 line-clamp-1">
                            {workspace.description || "No description"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-400">
                            {workspace.created}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-400">
                            {workspace.papers || workspace.papers_count || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-400">
                            {workspace.analyses_count || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-400">
                            {workspace.last_accessed ? formatDate(workspace.last_accessed) : 'Never'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={(e) => handleViewWorkspace(e, workspace.id)}
                              className="p-1.5 hover:bg-gray-600 rounded-lg transition-colors group"
                              title="View workspace"
                            >
                              <Eye className="w-4 h-4 text-gray-400 group-hover:text-white" />
                            </button>
                            <button
                              onClick={(e) => handleEditWorkspace(e, workspace.id)}
                              className="p-1.5 hover:bg-gray-600 rounded-lg transition-colors group"
                              title="Edit workspace"
                            >
                              <Edit className="w-4 h-4 text-gray-400 group-hover:text-white" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(e, workspace.id)}
                              className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors group"
                              title="Delete workspace"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                            <Link
                              to={`/workspaces/${workspace.id}`}
                              className="p-1.5 hover:bg-gray-600 rounded-lg transition-colors group"
                              title="Open workspace"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-700">
              {workspaces.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Folder className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="mb-2">No workspaces yet</p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Create your first workspace
                  </button>
                </div>
              ) : (
                workspaces.slice(0, 5).map((workspace: any) => (
                  <div 
                    key={workspace.id} 
                    className="p-4 hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleWorkspaceClick(workspace.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-lg ${getColorClasses(
                            workspace.color
                          )} flex items-center justify-center border`}
                        >
                          <span className="text-xl font-bold">
                            {workspace.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{workspace.name}</h4>
                          <p className="text-xs text-gray-400">
                            Created {workspace.created}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/workspaces/${workspace.id}`}
                          className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </Link>
                        <button
                          onClick={(e) => handleDeleteClick(e, workspace.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-3">
                      {workspace.description || "No description"}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-500">
                          <File className="w-3 h-3 inline mr-1" />
                          {workspace.papers || workspace.papers_count || 0} papers
                        </span>
                        <span className="text-gray-500">
                          <TrendingUp className="w-3 h-3 inline mr-1" />
                          {workspace.analyses_count || 0} analyses
                        </span>
                      </div>
                      {workspace.last_accessed && (
                        <span className="text-gray-600">
                          Active {formatDate(workspace.last_accessed)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {workspaces.length > 5 && (
              <div className="p-4 border-t border-gray-700 text-center">
                <Link
                  to="/workspaces"
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  View all {workspaces.length} workspaces
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickAction
              icon={<Search className="w-5 h-5" />}
              label="Search Papers"
              to="/search"
              color="purple"
            />
            <QuickAction
              icon={<Upload className="w-5 h-5" />}
              label="Upload PDF"
              to="/upload"
              color="blue"
            />
            <QuickAction
              icon={<MessageSquare className="w-5 h-5" />}
              label="AI Tools"
              to="/ai-tools"
              color="green"
            />
            <QuickAction
              icon={<FileText className="w-5 h-5" />}
              label="DocSpace"
              to="/docspace"
              color="orange"
            />
          </div>
        </div>
      </main>

      {/* Create Workspace Modal */}
      <CreateNewWorkspace
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md transform rounded-xl bg-gray-800 border border-gray-700 shadow-2xl">
              <div className="p-6">
                <div className="flex items-center space-x-3 text-red-400 mb-4">
                  <AlertCircle className="w-6 h-6" />
                  <h3 className="text-lg font-semibold text-white">Delete Workspace</h3>
                </div>
                <p className="text-gray-400 mb-6">
                  Are you sure you want to delete this workspace? This action cannot be undone.
                  All papers in this workspace will be unlinked but not deleted.
                </p>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteWorkspace}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Delete Workspace
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Updated Stat Card Component
const StatCard = ({ icon, title, value, subtitle, bgColor }: { 
  icon: React.ReactNode; 
  title: string; 
  value: number;
  subtitle: string;
  bgColor: string;
}) => {
  const bgColors = {
    purple: "bg-purple-500/20",
    blue: "bg-blue-500/20",
    green: "bg-green-500/20",
    orange: "bg-orange-500/20",
  };
  
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 ${bgColors[bgColor as keyof typeof bgColors]} rounded-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
};

// Quick Action Component
const QuickAction = ({ icon, label, to, color }: {
  icon: React.ReactNode;
  label: string;
  to: string;
  color: string;
}) => {
  const colors = {
    purple: "hover:border-purple-500/50 hover:bg-purple-500/5",
    blue: "hover:border-blue-500/50 hover:bg-blue-500/5",
    green: "hover:border-green-500/50 hover:bg-green-500/5",
    orange: "hover:border-orange-500/50 hover:bg-orange-500/5",
  };

  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center p-4 bg-gray-800 rounded-xl border border-gray-700 ${colors[color as keyof typeof colors]} transition-all group`}
    >
      <div className={`p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform text-${color}-400`}>
        {icon}
      </div>
      <span className="text-sm text-gray-300 group-hover:text-white text-center">
        {label}
      </span>
    </Link>
  );
};

export default ResearchHubDashboard;