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
  Sparkles,
  FileCheck,
  TrendingUp,
  Layers,
  CheckCircle,
  Circle,
  MoreVertical,
  Github,
  Twitter,
  Linkedin,
  Zap,
  AlertCircle,
  RefreshCw,
  Eye
} from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Paper {
  id: number;
  title: string;
  authors: string[];
  source: string;
  date: string;
  selected?: boolean;
}

interface Analysis {
  id: number;
  analysis_type: 'summary' | 'insights' | 'literature_review';
  title: string;
  content: string;
  created_at: string;
  analysis_metadata?: {
    paper_ids?: number[];
    paper_count?: number;
    paper_titles?: string[];
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ResearchHubAITools: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedPapers, setSelectedPapers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState<string | null>(null);
  const [availablePapers, setAvailablePapers] = useState<Paper[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchPapers();
    fetchRecentAnalyses();
  }, []);

  const fetchPapers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/papers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch papers");
      
      const data = await response.json();
      setAvailablePapers(data);
      toast.success('Papers loaded successfully', { id: 'papers-loaded' });
    } catch (err) {
      setError("Failed to load papers");
      toast.error('Failed to load papers', { id: 'papers-error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentAnalyses = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/ai-tools/analyses?limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch analyses");
      
      const data = await response.json();
      setRecentAnalyses(data);
      
      if (showRefreshing) {
        toast.success('Analyses refreshed', { 
          id: 'analyses-refresh', 
          icon: '🔄' 
        });
      }
    } catch (err) {
      console.error("Failed to load analyses:", err);
      toast.error('Failed to load analyses', { id: 'analyses-error' });
    } finally {
      if (showRefreshing) setRefreshing(false);
    }
  };

  const togglePaperSelection = (id: number) => {
    setSelectedPapers(prev => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        toast(`Removed from selection`, { 
          id: `paper-${id}`,
          icon: '➖',
          duration: 2000 
        });
        return prev.filter(paperId => paperId !== id);
      } else {
        toast(`Added to selection`, { 
          id: `paper-${id}`,
          icon: '✅',
          duration: 2000 
        });
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    const allIds = availablePapers.map(p => p.id);
    setSelectedPapers(allIds);
    toast.success(`Selected all ${allIds.length} papers`, {
      id: 'select-all',
      icon: '✅',
      duration: 3000
    });
  };

  const handleClearSelection = () => {
    setSelectedPapers([]);
    toast('Selection cleared', {
      id: 'clear-selection',
      icon: '🗑️',
      duration: 2000
    });
  };

  const handleGenerate = async (type: 'summary' | 'insights' | 'literature_review') => {
    if (selectedPapers.length === 0) {
      toast.error('Please select at least one paper', { 
        id: 'no-papers',
        icon: '📄' 
      });
      return;
    }

    if (type === 'literature_review' && selectedPapers.length < 2) {
      toast.error('Literature review requires at least 2 papers', { 
        id: 'min-papers',
        icon: '📚' 
      });
      return;
    }

    setIsGenerating(true);
    setGenerationType(type);
    setError(null);
    setSuccess(null);

    toast.loading(`Starting ${type.replace('_', ' ')} generation...`, {
      id: 'generating'
    });

    try {
      const token = localStorage.getItem("token");
      const endpoint = type === 'summary' ? 'summaries' : 
                      type === 'insights' ? 'insights' : 'literature-review';

      const response = await fetch(`${API_BASE_URL}/api/ai-tools/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paper_ids: selectedPapers,
          analysis_type: type,
          title: `${type.replace('_', ' ')} of ${selectedPapers.length} papers`,
          content: "",
          metadata: {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Generation failed");
      }

      
      toast.success(`${type.replace('_', ' ')} generation started!`, {
        id: 'generating',
        icon: '🚀',
        duration: 5000
      });

      toast.success('It will appear in recent analyses shortly', {
        id: 'processing',
        icon: '⏳',
        duration: 3000
      });
      
      setSuccess(`${type.replace('_', ' ')} generation started!`);
      
      // Refresh analyses after a delay
      setTimeout(() => {
        fetchRecentAnalyses(true);
        toast.success('New analyses loaded!', {
          id: 'analyses-loaded',
          icon: '✨',
          duration: 3000
        });
      }, 3000);
      
    } catch (err: any) {
      setError(err.message);
      toast.error(`Generation failed: ${err.message}`, {
        id: 'generating',
        duration: 5000
      });
    } finally {
      setIsGenerating(false);
      setGenerationType(null);
    }
  };

  const handleViewAnalysis = (analysisId: number) => {
    navigate(`/analysis/${analysisId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getAnalysisIcon = (type: string) => {
    switch(type) {
      case 'summary': return <FileCheck className="w-4 h-4 text-purple-400" />;
      case 'insights': return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'literature_review': return <BookOpen className="w-4 h-4 text-green-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAnalysisBadgeColor = (type: string) => {
    switch(type) {
      case 'summary': return 'bg-purple-500/20 text-purple-400';
      case 'insights': return 'bg-blue-500/20 text-blue-400';
      case 'literature_review': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
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
          <p className="text-white">Loading papers...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-semibold text-white">AI Tools</h1>
              <button
                onClick={() => fetchRecentAnalyses(true)}
                disabled={refreshing}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh analyses"
              >
                <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <Atom className="w-5 h-5 text-purple-400" />
              <h1 className="text-xl font-bold text-white">ResearchHub AI</h1>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-1 px-3 py-1.5 bg-purple-500/20 rounded-lg">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-400">Groq Llama 3.3 70B</span>
              </div>
              <Link
                to="/upload"
                className="hidden md:block px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Upload Paper
              </Link>
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
                <Link
                  to="/upload"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Paper</span>
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* AI Tools Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
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

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-green-400 shrink-0" />
                <p className="text-green-400 text-sm">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-400 hover:text-green-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Header with stats */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">AI-Powered Research Analysis Tools</h2>
                <p className="text-gray-400">
                  Leverage Groq Llama 3.3 70B to analyze, summarize, and extract insights from your research papers
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
                  <span className="text-sm text-gray-400">Papers: </span>
                  <span className="text-lg font-semibold text-white ml-1">{availablePapers.length}</span>
                </div>
                <div className="px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <span className="text-sm text-purple-400">Selected: </span>
                  <span className="text-lg font-semibold text-purple-400 ml-1">{selectedPapers.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Select Papers Section */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Layers className="w-5 h-5 text-purple-400 mr-2" />
              Select Papers for Analysis
            </h3>
            
            {availablePapers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="mb-2">No papers found. Upload some papers to get started.</p>
                <Link to="/upload" className="text-purple-400 hover:text-purple-300 font-medium inline-flex items-center space-x-1">
                  <Upload className="w-4 h-4" />
                  <span>Upload your first paper</span>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2">
                  {availablePapers.map((paper) => (
                    <div 
                      key={paper.id}
                      onClick={() => togglePaperSelection(paper.id)}
                      className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedPapers.includes(paper.id)
                          ? 'bg-purple-500/10 border-purple-500/50 hover:bg-purple-500/20'
                          : 'bg-gray-900/50 border-gray-700 hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="mt-0.5">
                        {selectedPapers.includes(paper.id) ? (
                          <CheckCircle className="w-5 h-5 text-purple-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium mb-1 truncate">{paper.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-gray-400 truncate max-w-xs">
                            {paper.authors?.slice(0, 2).join(', ')}
                            {paper.authors?.length > 2 && ' et al.'}
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-500">{paper.source || 'Unknown'}</span>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-500">
                            {paper.date ? new Date(paper.date).toLocaleDateString() : 'Unknown date'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <p className="text-gray-400">
                    <span className="font-semibold text-purple-400">{selectedPapers.length}</span> paper(s) selected
                  </p>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handleClearSelection}
                      className="text-sm text-gray-400 hover:text-white hover:underline"
                    >
                      Clear all
                    </button>
                    <button 
                      onClick={handleSelectAll}
                      className="text-sm text-purple-400 hover:text-purple-300 hover:underline"
                    >
                      Select all
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* AI Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Summaries */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <Sparkles className="w-5 h-5 text-purple-400 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Summaries</h3>
              <p className="text-gray-400 text-sm mb-4">
                Generate concise summaries of selected research papers. Perfect for quick understanding.
              </p>
              <button 
                onClick={() => handleGenerate('summary')}
                disabled={selectedPapers.length === 0 || isGenerating}
                className={`w-full py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  selectedPapers.length > 0 && !isGenerating
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isGenerating && generationType === 'summary' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Summaries</span>
                    <FileCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Key Insights */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/20 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <Sparkles className="w-5 h-5 text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Key Insights</h3>
              <p className="text-gray-400 text-sm mb-4">
                Extract key findings, methodologies, and trends from research papers.
              </p>
              <button 
                onClick={() => handleGenerate('insights')}
                disabled={selectedPapers.length === 0 || isGenerating}
                className={`w-full py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  selectedPapers.length > 0 && !isGenerating
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isGenerating && generationType === 'insights' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <span>Extract Insights</span>
                    <TrendingUp className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Literature Review */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-900/20 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <BookOpen className="w-6 h-6 text-green-400" />
                </div>
                <Sparkles className="w-5 h-5 text-green-400 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Literature Review</h3>
              <p className="text-gray-400 text-sm mb-4">
                Generate comprehensive literature reviews from multiple papers. Requires at least 2 papers.
              </p>
              <button 
                onClick={() => handleGenerate('literature_review')}
                disabled={selectedPapers.length < 2 || isGenerating}
                className={`w-full py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  selectedPapers.length >= 2 && !isGenerating
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isGenerating && generationType === 'literature_review' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Review</span>
                    <BookOpen className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Recent Analyses */}
          {recentAnalyses.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Analyses</h3>
                <Link 
                  to="/ai-tools/analyses" 
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  View all
                </Link>
              </div>
              <div className="bg-gray-800 rounded-xl border border-gray-700 divide-y divide-gray-700">
                {recentAnalyses.map((analysis) => (
                  <div 
                    key={analysis.id} 
                    className="p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${getAnalysisBadgeColor(analysis.analysis_type)}`}>
                        {getAnalysisIcon(analysis.analysis_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-white text-sm font-medium">{analysis.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getAnalysisBadgeColor(analysis.analysis_type)}`}>
                            {analysis.analysis_type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {analysis.analysis_metadata?.paper_count || 1} paper(s) • Generated {formatDate(analysis.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewAnalysis(analysis.id)}
                        className="p-2 hover:bg-gray-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="View analysis"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <Link 
                        to={`/analysis/${analysis.id}`}
                        className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for no analyses */}
          {recentAnalyses.length === 0 && !loading && availablePapers.length > 0 && (
            <div className="mt-12 text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
              <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-2">No analyses yet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Select papers and generate your first analysis to get started
              </p>
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

export default ResearchHubAITools;