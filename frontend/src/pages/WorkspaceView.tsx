import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  
  Edit,
  Trash2,
  Clock,
  
  FileText,
  
  Sparkles,
  
  Check,
  AlertCircle,
  
  Atom,
  Home,
  LayoutDashboard,
  Search,
  MessageSquare,
  Upload,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
  
  Plus,
  MoreVertical,
  Eye,
  RefreshCw,
  Grid,
  List,
  
  Filter,
  
  Users,
 
  Star,
  StarOff
} from 'lucide-react';

interface Workspace {
  id: number;
  name: string;
  description: string;
  color: string;
  created_at: string;
  papers_count: number;
  owner_id: number;
}

interface Paper {
  id: number;
  title: string;
  authors: string[] | string;
  source: string;
  date: string;
  abstract?: string;
  tags?: string[] | string;
  analyzed: boolean;
  starred?: boolean;
  file_path?: string;
  analyses?: any[];
}

interface WorkspaceStats {
  total_papers: number;
  analyzed_papers: number;
  pending_papers: number;
  collaborators: number;
  last_activity: string;
  total_analyses: number;
}

// Helper function to parse authors
const parseAuthors = (authors: any): string[] => {
  if (!authors) return [];
  if (Array.isArray(authors)) return authors;
  if (typeof authors === 'string') {
    try {
      const parsed = JSON.parse(authors);
      return Array.isArray(parsed) ? parsed : [authors];
    } catch {
      return authors.split(',').map((a: string) => a.trim());
    }
  }
  return [];
};

// Helper function to parse tags
const parseTags = (tags: any): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [tags];
    } catch {
      return tags.split(',').map((t: string) => t.trim());
    }
  }
  return [];
};

const API_BASE_URL = import.meta.env.VITE_API_URL;


const WorkspaceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [stats, setStats] = useState<WorkspaceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'analyzed'>('date');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchWorkspaceData();
  }, [id]);

  useEffect(() => {
  if (import.meta.env.DEV && debugInfo) {
    console.log("Workspace Debug Info:", debugInfo);
  }
}, [debugInfo]);

  const fetchWorkspaceData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    setDebugInfo('');
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/');
        return;
      }

      console.log("Fetching workspace data for ID:", id);

      
      const workspaceResponse = await fetch(`${API_BASE_URL}/api/workspaces/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!workspaceResponse.ok) {
        if (workspaceResponse.status === 404) {
          throw new Error("Workspace not found");
        }
        throw new Error("Failed to fetch workspace");
      }

      const workspaceData = await workspaceResponse.json();
      console.log("Workspace data:", workspaceData);
      setWorkspace(workspaceData);

      // Fetch papers in this workspace
      console.log("Fetching papers for workspace ID:", id);
      const papersResponse = await fetch(`${API_BASE_URL}/api/papers?workspace_id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!papersResponse.ok) {
        const errorText = await papersResponse.text();
        console.error("Papers fetch error:", errorText);
        setDebugInfo(`Papers API error: ${papersResponse.status} - ${errorText}`);
        throw new Error(`Failed to fetch papers: ${papersResponse.status}`);
      }

      const papersData = await papersResponse.json();
      console.log("Papers data received:", papersData);
      console.log("Papers count:", papersData.length);
      
      if (papersData.length > 0) {
        console.log("First paper structure:", papersData[0]);
        setDebugInfo(`Found ${papersData.length} papers. First paper: ${JSON.stringify(papersData[0]).substring(0, 200)}...`);
      } else {
        setDebugInfo('No papers found in response');
      }

      const enrichedPapers = papersData.map((paper: any) => {
       
        const authors = parseAuthors(paper.authors);
        
        
        const tags = parseTags(paper.tags);
        
       
        const hasAnalyses = paper.analyses && paper.analyses.length > 0;
        
        return {
          ...paper,
          authors,
          tags,
          analyzed: hasAnalyses || paper.analyzed || false,
          starred: paper.starred || false,
          date: paper.date || paper.publication_date || paper.created_at || new Date().toISOString(),
          source: paper.source || paper.journal || 'Unknown',
        };
      });

      console.log("Enriched papers:", enrichedPapers);
      setPapers(enrichedPapers);
      
      
      const analyzedCount = enrichedPapers.filter((p: Paper) => p.analyzed).length;
      const totalAnalyses = enrichedPapers.reduce((acc: number, p:Paper) => acc + (p.analyses?.length || 0), 0);
      
      setStats({
        total_papers: enrichedPapers.length,
        analyzed_papers: analyzedCount,
        pending_papers: enrichedPapers.length - analyzedCount,
        collaborators: workspaceData.collaborators?.length || 1,
        last_activity: new Date().toISOString(),
        total_analyses: totalAnalyses || analyzedCount * 2,
      });

      setError(null);
    } catch (err: any) {
      console.error("Workspace error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspace) return;
    
    if (!window.confirm(`Are you sure you want to delete "${workspace.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/workspaces/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete workspace");

      navigate('/dashboard');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleToggleStar = async (paperId: number) => {
    setPapers(prev => prev.map(p => 
      p.id === paperId ? { ...p, starred: !p.starred } : p
    ));
  };

  const handleDeletePaper = async (paperId: number) => {
    if (!window.confirm("Are you sure you want to remove this paper from the workspace?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/papers/${paperId}?workspace_id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to remove paper");

      
      setPapers(prev => prev.filter(p => p.id !== paperId));
      
      if (stats) {
        const paper = papers.find(p => p.id === paperId);
        setStats({
          ...stats,
          total_papers: stats.total_papers - 1,
          pending_papers: paper?.analyzed ? stats.pending_papers : stats.pending_papers - 1,
          analyzed_papers: paper?.analyzed ? stats.analyzed_papers - 1 : stats.analyzed_papers,
        });
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };



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

  const getSortedPapers = () => {
    let sorted = [...papers];
    
    if (sortBy === 'date') {
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'analyzed') {
      sorted.sort((a, b) => (a.analyzed === b.analyzed ? 0 : a.analyzed ? -1 : 1));
    }
    
    if (filterTag) {
      sorted = sorted.filter(p => {
        const tags = parseTags(p.tags);
        return tags.includes(filterTag);
      });
    }
    
    return sorted;
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    papers.forEach(p => {
      const paperTags = parseTags(p.tags);
      paperTags.forEach(t => tags.add(t));
    });
    return Array.from(tags);
  };

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Search Papers", path: "/search", icon: <Search className="w-5 h-5" /> },
    { name: "AI Tools", path: "/ai-tools", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Upload PDF", path: "/upload", icon: <Upload className="w-5 h-5" /> },
    { name: "DocSpace", path: "/docspace", icon: <FileText className="w-5 h-5" /> },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900 items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="flex min-h-screen bg-gray-900 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || "Workspace not found"}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const sortedPapers = getSortedPapers();
  const allTags = getAllTags();

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-gray-800 border-r border-gray-700 transition-all duration-300 z-40 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
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
              {isSidebarCollapsed ? 
                <ChevronRight className="w-5 h-5 text-gray-300" /> : 
                <ChevronLeft className="w-5 h-5 text-gray-300" />
              }
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

          <div className="p-4 border-t border-gray-700">
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center">
                <span className="text-sm font-medium text-purple-400">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-white truncate">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email || 'user@researchhub.ai'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
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
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg ${getColorClasses(workspace.color)} flex items-center justify-center`}>
                  <span className="text-sm font-bold">{workspace.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">{workspace.name}</h1>
                  <p className="text-xs text-gray-400">{workspace.description || 'No description'}</p>
                </div>
              </div>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <Atom className="w-5 h-5 text-purple-400" />
              <h1 className="text-xl font-bold text-white">ResearchHub AI</h1>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchWorkspaceData(true)}
                disabled={refreshing}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => navigate(`/workspaces/${id}/edit`)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Edit workspace"
              >
                <Edit className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={handleDeleteWorkspace}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete workspace"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>


          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-700 bg-gray-800">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-purple-400 hover:bg-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Workspace Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile header */}
          <div className="md:hidden mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg ${getColorClasses(workspace.color)} flex items-center justify-center`}>
                <span className="text-xl font-bold">{workspace.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{workspace.name}</h1>
                <p className="text-sm text-gray-400">{workspace.description || 'No description'}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <StatCard
                icon={<FileText className="w-4 h-4" />}
                label="Total Papers"
                value={stats.total_papers}
                color="purple"
              />
              <StatCard
                icon={<Check className="w-4 h-4" />}
                label="Analyzed"
                value={stats.analyzed_papers}
                color="green"
              />
              <StatCard
                icon={<Clock className="w-4 h-4" />}
                label="Pending"
                value={stats.pending_papers}
                color="orange"
              />
              <StatCard
                icon={<Users className="w-4 h-4" />}
                label="Collaborators"
                value={stats.collaborators}
                color="blue"
              />
              <StatCard
                icon={<Sparkles className="w-4 h-4" />}
                label="Analyses"
                value={stats.total_analyses}
                color="pink"
              />
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-white">Papers</h2>
              <span className="px-2 py-1 bg-gray-700 rounded-lg text-xs text-gray-300">
                {papers.length} total
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="analyzed">Sort by Status</option>
              </select>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters || filterTag ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>

              {/* Add Paper Button */}
              <Link
                to={`/search?workspace=${id}`}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Add Papers</span>
              </Link>
            </div>
          </div>

          {/* Filter Bar */}
          {showFilters && allTags.length > 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">Filter by Tag</span>
                {filterTag && (
                  <button
                    onClick={() => setFilterTag(null)}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filterTag === tag
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Papers Grid/List */}
          {papers.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No papers in this workspace</h3>
              <p className="text-gray-400 text-sm mb-6">
                Start by adding papers from the search page or uploading new ones
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Link
                  to={`/search?workspace=${id}`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Search Papers
                </Link>
                <Link
                  to="/upload"
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Upload PDF
                </Link>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedPapers.map((paper) => (
                <PaperGridCard
                  key={paper.id}
                  paper={paper}
                  workspaceId={id!}
                  onToggleStar={handleToggleStar}
                  onDelete={handleDeletePaper}
                  parseTags={parseTags}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Title</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Authors</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Source</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {sortedPapers.map((paper) => (
                    <PaperListRow
                      key={paper.id}
                      paper={paper}
                      workspaceId={id!}
                      onToggleStar={handleToggleStar}
                      onDelete={handleDeletePaper}
                      parseTags={parseTags}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800 text-gray-400 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Atom className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-300">ResearchHub AI</span>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
              <p className="text-sm text-gray-500 mt-4 md:mt-0">
                &copy; {new Date().getFullYear()} ResearchHub AI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => {
  const colors = {
    purple: "bg-purple-500/20 text-purple-400",
    green: "bg-green-500/20 text-green-400",
    orange: "bg-orange-500/20 text-orange-400",
    blue: "bg-blue-500/20 text-blue-400",
    pink: "bg-pink-500/20 text-pink-400",
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
      <div className={`inline-flex p-2 rounded-lg ${colors[color as keyof typeof colors]} mb-2`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
};

// Paper Grid Card Component
const PaperGridCard = ({ paper,  onToggleStar, onDelete, parseTags }: any) => {
  const tags = parseTags(paper.tags);
  
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-purple-500/50 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${paper.analyzed ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
          <FileText className={`w-5 h-5 ${paper.analyzed ? 'text-green-400' : 'text-yellow-400'}`} />
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onToggleStar(paper.id)}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {paper.starred ? (
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            ) : (
              <StarOff className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <div className="relative group">
            <button className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-gray-700 rounded-lg border border-gray-600 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <Link
                to={`/papers/${paper.id}`}
                className="block px-3 py-2 text-xs text-gray-300 hover:bg-gray-600 rounded-t-lg"
              >
                View Details
              </Link>
              <Link
                to={`/analysis/new?paper=${paper.id}`}
                className="block px-3 py-2 text-xs text-gray-300 hover:bg-gray-600"
              >
                Analyze
              </Link>
              <button
                onClick={() => onDelete(paper.id)}
                className="block w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-gray-600 rounded-b-lg"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Link to={`/papers/${paper.id}`} className="block">
        <h3 className="text-white font-medium mb-2 line-clamp-2 hover:text-purple-400 transition-colors">
          {paper.title}
        </h3>
        
        <p className="text-xs text-gray-400 mb-2 line-clamp-2">
          {Array.isArray(paper.authors) 
            ? paper.authors.slice(0, 2).join(', ')
            : paper.authors}
          {Array.isArray(paper.authors) && paper.authors.length > 2 && ' et al.'}
        </p>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">{paper.source || 'Unknown'}</span>
          <span className="text-gray-500">{new Date(paper.date).toLocaleDateString()}</span>
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.slice(0, 2).map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-700 rounded-full text-xs text-gray-300">
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="px-2 py-0.5 bg-gray-700 rounded-full text-xs text-gray-300">
                +{tags.length - 2}
              </span>
            )}
          </div>
        )}
      </Link>
    </div>
  );
};

// Paper List Row Component
const PaperListRow = ({ paper, onToggleStar, onDelete, }: any) => {
  
  return (
    <tr className="hover:bg-gray-700/50 transition-colors">
      <td className="py-3 px-4">
        <Link to={`/papers/${paper.id}`} className="flex items-center space-x-3">
          <div className={`p-1.5 rounded-lg ${paper.analyzed ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
            <FileText className={`w-4 h-4 ${paper.analyzed ? 'text-green-400' : 'text-yellow-400'}`} />
          </div>
          <span className="text-white text-sm font-medium hover:text-purple-400 transition-colors">
            {paper.title.length > 50 ? paper.title.substring(0, 50) + '...' : paper.title}
          </span>
        </Link>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-400">
          {Array.isArray(paper.authors) 
            ? paper.authors.slice(0, 2).join(', ')
            : paper.authors}
          {Array.isArray(paper.authors) && paper.authors.length > 2 && ' et al.'}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-400">{paper.source || 'Unknown'}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-400">{new Date(paper.date).toLocaleDateString()}</span>
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs px-2 py-1 rounded-full ${
          paper.analyzed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {paper.analyzed ? 'Analyzed' : 'Pending'}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onToggleStar(paper.id)}
            className="p-1 hover:bg-gray-600 rounded-lg transition-colors"
          >
            {paper.starred ? (
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            ) : (
              <StarOff className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <Link
            to={`/papers/${paper.id}`}
            className="p-1 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-400" />
          </Link>
          <button
            onClick={() => onDelete(paper.id)}
            className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );
};


export default WorkspaceView;