import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share2,
  Trash2,
  Clock,
  FileText,
  TrendingUp,
  BookOpen,
  Sparkles,
  Layers,
  Copy,
  Check,
  AlertCircle,
  Loader,
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
  Zap,
  FileCheck,
  Printer
} from 'lucide-react';

interface AnalysisData {
  id: number;
  analysis_type: 'summary' | 'insights' | 'literature_review';
  title: string;
  content: string;
  created_at: string;
  user_id: number;
  paper_id?: number;
  analysis_metadata?: {
    paper_ids?: number[];
    paper_count?: number;
    paper_titles?: string[];
    [key: string]: any;
  };
}

interface Paper {
  id: number;
  title: string;
  authors: string[];
  source: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AnalysisView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/ai-tools/analyses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Analysis not found");
        }
        throw new Error("Failed to fetch analysis");
      }

      const data = await response.json();
      setAnalysis(data);

      // Fetch papers if paper_ids exist in metadata
      if (data.analysis_metadata?.paper_ids?.length > 0) {
        fetchPapers(data.analysis_metadata.paper_ids);
      }
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPapers = async (paperIds: number[]) => {
    try {
      const token = localStorage.getItem("token");
      // Fetch each paper individually or create a batch endpoint
      const papersData = await Promise.all(
        paperIds.map(async (paperId) => {
          const response = await fetch(`${API_BASE_URL}/api/papers/${paperId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            return response.json();
          }
          return null;
        })
      );
      setPapers(papersData.filter(p => p !== null));
    } catch (err) {
      console.error("Failed to fetch papers:", err);
    }
  };

  const handleCopyContent = () => {
    if (analysis?.content) {
      navigator.clipboard.writeText(analysis.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!analysis) return;

    const content = `# ${analysis.title}\n\n` +
      `Type: ${analysis.analysis_type.replace('_', ' ').toUpperCase()}\n` +
      `Generated: ${new Date(analysis.created_at).toLocaleString()}\n\n` +
      `${analysis.content}`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.analysis_type}-${analysis.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/ai-tools/analyses/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete");

      navigate('/ai-tools');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const getIcon = () => {
    if (!analysis) return <FileText className="w-8 h-8 text-purple-400" />;
    
    switch (analysis.analysis_type) {
      case 'summary':
        return <FileCheck className="w-8 h-8 text-purple-400" />;
      case 'insights':
        return <TrendingUp className="w-8 h-8 text-purple-400" />;
      case 'literature_review':
        return <BookOpen className="w-8 h-8 text-purple-400" />;
      default:
        return <FileText className="w-8 h-8 text-purple-400" />;
    }
  };

  const getTypeLabel = () => {
    if (!analysis) return '';
    
    switch (analysis.analysis_type) {
      case 'summary':
        return 'AI Summary';
      case 'insights':
        return 'Key Insights';
      case 'literature_review':
        return 'Literature Review';
      default:
        return 'Analysis';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900 items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex min-h-screen bg-gray-900 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || "Analysis not found"}</p>
          <Link
            to="/ai-tools"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to AI Tools
          </Link>
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

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate('/ai-tools')}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <h1 className="text-xl font-semibold text-white">{getTypeLabel()}</h1>
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
              <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center">
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

        {/* Analysis Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button for mobile */}
          <button
            onClick={() => navigate('/ai-tools')}
            className="md:hidden flex items-center space-x-2 text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to AI Tools</span>
          </button>

          {/* Title Section */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  {getIcon()}
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
                      {getTypeLabel()}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{formatDate(analysis.created_at)}</span>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">{analysis.title}</h1>
                  
                  {/* Papers info */}
                  {analysis.analysis_metadata?.paper_count && (
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Layers className="w-4 h-4" />
                      <span>Based on {analysis.analysis_metadata.paper_count} paper(s)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyContent}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors relative"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Download as markdown"
                >
                  <Download className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Print"
                >
                  <Printer className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Papers Used */}
          {papers.length > 0 && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 text-purple-400 mr-2" />
                Papers Analyzed
              </h2>
              <div className="space-y-3">
                {papers.map((paper) => (
                  <Link
                    key={paper.id}
                    to={`/papers/${paper.id}`}
                    className="block p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors"
                  >
                    <h3 className="text-white font-medium mb-1">{paper.title}</h3>
                    <p className="text-xs text-gray-400">
                      {paper.authors?.join(', ') || 'Unknown authors'} • {paper.source || 'Unknown source'}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="border-b border-gray-700 p-4 bg-gray-900/50">
              <h2 className="text-white font-medium flex items-center">
                <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
                Generated Content
              </h2>
            </div>
            <div className="p-6">
              <div className="prose prose-invert max-w-none">
                {analysis.analysis_type === 'summary' && (
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {analysis.content.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                )}

                {analysis.analysis_type === 'insights' && (
                  <div className="space-y-6">
                    {analysis.content.split('\n\n').map((section, idx) => {
                      if (section.startsWith('#')) {
                        return (
                          <h3 key={idx} className="text-xl font-semibold text-white mt-6 mb-3">
                            {section.replace('#', '').trim()}
                          </h3>
                        );
                      }
                      return (
                        <div key={idx} className="text-gray-300 leading-relaxed">
                          {section.split('\n').map((line, lineIdx) => {
                            if (line.startsWith('-')) {
                              return (
                                <li key={lineIdx} className="ml-4 text-gray-300 list-disc">
                                  {line.substring(1).trim()}
                                </li>
                              );
                            }
                            return <p key={lineIdx} className="mb-2">{line}</p>;
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}

                {analysis.analysis_type === 'literature_review' && (
                  <div className="space-y-6">
                    {analysis.content.split('\n\n').map((section, idx) => {
                      if (section.startsWith('#')) {
                        const level = section.match(/^#+/)?.[0].length || 1;
                        const text = section.replace(/^#+\s*/, '');
                        
                        if (level === 1) {
                          return <h1 key={idx} className="text-2xl font-bold text-white mt-8 mb-4">{text}</h1>;
                        } else if (level === 2) {
                          return <h2 key={idx} className="text-xl font-semibold text-white mt-6 mb-3">{text}</h2>;
                        } else {
                          return <h3 key={idx} className="text-lg font-medium text-white mt-4 mb-2">{text}</h3>;
                        }
                      }
                      return (
                        <div key={idx} className="text-gray-300 leading-relaxed">
                          {section.split('\n').map((line, lineIdx) => {
                            if (line.startsWith('-')) {
                              return (
                                <li key={lineIdx} className="ml-4 text-gray-300 list-disc">
                                  {line.substring(1).trim()}
                                </li>
                              );
                            }
                            if (line.match(/^\d+\./)) {
                              return (
                                <li key={lineIdx} className="ml-4 text-gray-300 list-decimal">
                                  {line.replace(/^\d+\.\s*/, '')}
                                </li>
                              );
                            }
                            return <p key={lineIdx} className="mb-2">{line}</p>;
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-6 text-xs text-gray-500 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span>Analysis ID: {analysis.id}</span>
              <span>•</span>
              <span>Generated by: {user?.full_name || 'User'}</span>
            </div>
          </div>
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

export default AnalysisView;