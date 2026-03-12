import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MessageSquare, 
  FileText, 
  BookOpen, 
  Menu,
  X,
  LayoutDashboard,
  Upload,
  Home,
  ChevronLeft,
  ChevronRight,
  Atom,
  Filter,
  Calendar,
  User,
  
  Download,
  Bookmark,
  ChevronDown,
  Globe,
  
  Star,
  Github,
  Twitter,
  Linkedin,
  AlertCircle,
  Loader
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';

interface SearchResult {
  title: string;
  authors: string[];
  abstract: string;
  source: string;
  url: string;
  pdf_url?: string;
  doi?: string;
  date: string;
  citations: number;
  tags: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL;


const ResearchHubSearch: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('agentic ai');
  const [selectedSource, setSelectedSource] = useState('All Sources');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<SearchResult | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/workspaces`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      }
    } catch (err) {
      console.error("Failed to fetch workspaces:", err);
      toast.error('Failed to load workspaces', { id: 'workspaces-error' });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query', { 
        id: 'search-empty',
        icon: '🔍'
      });
      return;
    }

    setLoading(true);
    setError(null);
    

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/search/papers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: searchQuery,
          source: selectedSource === 'All Sources' ? null : selectedSource,
          max_results: 20
        }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data.results || []);
      
      if (data.results.length === 0) {
        toast.success('No papers found. Try adjusting your search.', { 
          id: 'searching',
          icon: '📚',
          duration: 4000
        });
      } else {
        toast.success(`Found ${data.results.length} papers!`, { 
          id: 'searching',
          icon: '✅',
          duration: 3000
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(`Search failed: ${err.message}`, { 
        id: 'searching',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedPaper) return;

    setImporting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/search/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...selectedPaper,
          workspace_id: selectedWorkspace
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to import paper");
      }

      toast.success('Paper imported successfully!', { 
        id: 'importing',
        icon: '📥',
        duration: 4000
      });
      
      setShowImportModal(false);
      setSelectedPaper(null);
      setSelectedWorkspace(null);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Import failed: ${err.message}`, { 
        id: 'importing',
        duration: 5000
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFilterClick = (filterName: string) => {
    toast(`Filter: ${filterName}`, { 
      id: `filter-${filterName}`,
      icon: '🔍',
      duration: 2000
    });
  };

  const handleSortChange = (sortType: string) => {
    toast(`Sorting by: ${sortType}`, { 
      id: 'sort',
      icon: '📊',
      duration: 2000
    });
  };

  const handleLoadMore = () => {
    toast.loading('Loading more results...', { id: 'load-more' });
    // Simulate loading more
    setTimeout(() => {
      toast.success('Loaded 10 more papers!', { 
        id: 'load-more',
        icon: '📚',
        duration: 3000
      });
    }, 2000);
  };

  const handleViewPaper = (paper: SearchResult) => {
    toast.success(`Opening: ${paper.title.substring(0, 50)}...`, { 
      id: 'view-paper',
      icon: '📄',
      duration: 2000
    });
  };

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Search Papers", path: "/search", icon: <Search className="w-5 h-5" /> },
    { name: "AI Tools", path: "/ai-tools", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Upload PDF", path: "/upload", icon: <Upload className="w-5 h-5" /> },
    { name: "DocSpace", path: "/docspace", icon: <FileText className="w-5 h-5" /> },
  ];

  const sources = ['All Sources', 'arXiv', 'Nature', 'Science', 'ICML', 'NeurIPS', 'IEEE', 'ACM'];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

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
                  <p className="text-sm font-medium text-white">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-400">{user?.email || 'user@researchhub.ai'}</p>
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

            <div className="hidden md:flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-white">Search Papers</h1>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <Atom className="w-5 h-5 text-purple-400" />
              <h1 className="text-xl font-bold text-white">ResearchHub AI</h1>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                onClick={() => toast.success('Bookmarks feature coming soon!', { 
                  id: 'bookmarks',
                  icon: '🔖',
                  duration: 2000 
                })}
              >
                <Bookmark className="w-5 h-5 text-gray-300" />
              </button>
              <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center md:hidden">
                <span className="text-sm font-medium text-purple-400">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
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

        {/* Search Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Search Research Papers</h2>
            <p className="text-gray-400">Search across millions of research papers and import them to your workspace</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search Bar */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    placeholder="Enter keywords, title, or author..."
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="relative min-w-45">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    value={selectedSource}
                    onChange={(e) => {
                      setSelectedSource(e.target.value);
                      toast(`Source changed to: ${e.target.value}`, { 
                        id: 'source-change',
                        icon: '🌐',
                        duration: 1500 
                      });
                    }}
                    className="w-full pl-10 pr-8 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  >
                    {sources.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">Filters:</span>
              </div>
              <button 
                onClick={() => handleFilterClick('Last 6 months')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-600 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Last 6 months</span>
              </button>
              <button 
                onClick={() => handleFilterClick('First author')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-600 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>First author</span>
              </button>
              <button 
                onClick={() => handleFilterClick('High impact')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-600 transition-colors"
              >
                <Star className="w-4 h-4" />
                <span>High impact</span>
              </button>
              <button 
                onClick={() => handleFilterClick('Open access')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-600 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Open access</span>
              </button>
            </div>
          </div>

          {/* Results Header */}
          {results.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Found {results.length} papers</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Sort by:</span>
                <select 
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500"
                >
                  <option value="Relevance">Relevance</option>
                  <option value="Date (newest)">Date (newest)</option>
                  <option value="Date (oldest)">Date (oldest)</option>
                  <option value="Citations">Citations</option>
                </select>
              </div>
            </div>
          )}

          {/* Papers List */}
          <div className="space-y-4 mb-8">
            {loading ? (
              <div className="text-center py-12">
                <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Searching papers...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No papers found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your search query</p>
              </div>
            ) : (
              results.map((paper, index) => (
                <div key={index} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-2 hover:text-purple-400 transition-colors">
                        <a 
                          href={paper.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={() => handleViewPaper(paper)}
                        >
                          {paper.title}
                        </a>
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {paper.authors.map((author, idx) => (
                          <React.Fragment key={idx}>
                            <span className="text-sm text-gray-400 hover:text-purple-400 transition-colors cursor-pointer">
                              {author}
                            </span>
                            {idx < paper.authors.length - 1 && <span className="text-gray-600">•</span>}
                          </React.Fragment>
                        ))}
                      </div>

                      <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                        {paper.abstract}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        {paper.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-700 rounded-lg text-xs text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-gray-400">{formatDate(paper.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Globe className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-gray-400">{paper.source}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3.5 h-3.5 text-yellow-500" />
                          <span className="text-gray-400">{paper.citations} citations</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:flex-col items-center lg:items-stretch gap-2">
                      <a 
                        href={paper.pdf_url || paper.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => handleViewPaper(paper)}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Paper</span>
                      </a>
                      <button 
                        onClick={() => {
                          setSelectedPaper(paper);
                          setShowImportModal(true);
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap"
                      >
                        <Download className="w-4 h-4" />
                        <span>Import</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More */}
          {results.length > 0 && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={handleLoadMore}
                className="px-6 py-3 bg-gray-800 text-white font-medium rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <span>Load More Results</span>
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Import Modal */}
        {showImportModal && selectedPaper && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Import Paper</h3>
              <p className="text-gray-300 text-sm mb-4">{selectedPaper.title}</p>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Select Workspace (Optional)</label>
                <select
                  value={selectedWorkspace || ''}
                  onChange={(e) => setSelectedWorkspace(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">No workspace</option>
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setSelectedPaper(null);
                    setSelectedWorkspace(null);
                    toast('Import cancelled', { id: 'import-cancel', icon: '❌', duration: 2000 });
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {importing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Import</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

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

export default ResearchHubSearch;