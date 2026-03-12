import React, { useState, useEffect } from 'react';
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
 
  Trash2,
  Download,
  Share2,
  Star,
  Clock,

  Github,
  Twitter,
  Linkedin,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Type,
  Image,
  Link2,
  Save,
  AlertCircle
} from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Document {
  id: number;
  name: string;
  content: string;
  document_type: 'document' | 'folder';
  is_starred: boolean;
  parent_id: number | null;
  workspace_id: number | null;
  created_at: string;
  updated_at: string;
}


const API_BASE_URL = import.meta.env.VITE_API_URL;

const ResearchHubDocSpace: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'starred' | 'folders'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/documents`, {
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
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();
      setDocuments(data);
      
      // Set first document as selected if available
      if (data.length > 0 && !selectedDoc) {
        const firstDoc = data.find((d: Document) => d.document_type === 'document');
        if (firstDoc) {
          setSelectedDoc(firstDoc);
          setDocTitle(firstDoc.name);
          setEditorContent(firstDoc.content);
        }
      }
      
      toast.success('Documents loaded successfully', { id: 'docs-loaded' });
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to load documents: ${err.message}`, { id: 'docs-error' });
    } finally {
      setLoading(false);
    }
  };

  const createNewDocument = async () => {
   
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'Untitled Document',
          content: '',
          document_type: 'document',
          is_starred: false
        }),
      });

      if (!response.ok) throw new Error("Failed to create document");

      const newDoc = await response.json();
      setDocuments(prev => [newDoc, ...prev]);
      setSelectedDoc(newDoc);
      setDocTitle(newDoc.name);
      setEditorContent('');
      
      toast.success('New document created!', { 
        id: 'create-doc',
        icon: '📄',
        duration: 3000
      });
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to create document: ${err.message}`, { 
        id: 'create-doc',
        duration: 4000
      });
    }
  };

  const saveDocument = async () => {
    if (!selectedDoc) return;

    setSaving(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/documents/${selectedDoc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: docTitle,
          content: editorContent,
          is_starred: selectedDoc.is_starred
        }),
      });

      if (!response.ok) throw new Error("Failed to save document");

      const updatedDoc = await response.json();
      setSelectedDoc(updatedDoc);
      setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
      
      toast.success('Document saved successfully!', { 
        id: 'save-doc',
        icon: '✅',
        duration: 2000
      });
      
      setTimeout(() => setSaving(false), 500);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to save: ${err.message}`, { 
        id: 'save-doc',
        duration: 4000
      });
      setSaving(false);
    }
  };

  const toggleStar = async (doc: Document) => {
    
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/documents/${doc.id}/star`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to toggle star");

      const result = await response.json();
      
      // Update local state
      setDocuments(prev => prev.map(d => 
        d.id === doc.id ? { ...d, is_starred: result.is_starred } : d
      ));
      
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(prev => prev ? { ...prev, is_starred: result.is_starred } : null);
      }
      
      toast.success(
        result.is_starred ? 'Added to starred!' : 'Removed from starred', 
        { 
          id: 'star-doc',
          icon: result.is_starred ? '⭐' : '☆',
          duration: 2000
        }
      );
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to update star: ${err.message}`, { 
        id: 'star-doc',
        duration: 4000
      });
    }
  };

  const deleteDocument = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete document");

      setDocuments(prev => prev.filter(d => d.id !== id));
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
        setDocTitle('');
        setEditorContent('');
      }
      
      toast.success('Document deleted successfully', { 
        id: 'delete-doc',
        icon: '🗑️',
        duration: 3000
      });
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to delete: ${err.message}`, { 
        id: 'delete-doc',
        duration: 4000
      });
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'starred' && !doc.is_starred) return false;
    if (filter === 'folders' && doc.document_type !== 'folder') return false;
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
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
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading documents...</p>
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

            <div className="hidden md:flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-white">DocSpace</h1>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <Atom className="w-5 h-5 text-purple-400" />
              <h1 className="text-xl font-bold text-white">ResearchHub AI</h1>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={createNewDocument}
                className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">New Document</span>
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

        {/* DocSpace Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  setFilter('all');
                  toast('Showing all documents', { id: 'filter-all', icon: '📄', duration: 2000 });
                }}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  filter === 'all' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => {
                  setFilter('starred');
                  toast('Showing starred documents', { id: 'filter-starred', icon: '⭐', duration: 2000 });
                }}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  filter === 'starred' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Starred
              </button>
              <button 
                onClick={() => {
                  setFilter('folders');
                  toast('Showing folders', { id: 'filter-folders', icon: '📁', duration: 2000 });
                }}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  filter === 'folders' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Folders
              </button>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Documents List */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">
                    {filter === 'all' ? 'All Documents' : 
                     filter === 'starred' ? 'Starred' : 'Folders'}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {filteredDocuments.length} items
                  </span>
                </div>
                
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No documents found</p>
                    <button 
                      onClick={createNewDocument}
                      className="mt-2 text-purple-400 hover:text-purple-300"
                    >
                      Create one
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-150 overflow-y-auto">
                    {filteredDocuments.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => {
                          setSelectedDoc(doc);
                          setDocTitle(doc.name);
                          setEditorContent(doc.content);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          selectedDoc?.id === doc.id
                            ? 'bg-purple-600/20 border border-purple-500/30'
                            : 'hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          {doc.document_type === 'folder' ? (
                            <Folder className="w-4 h-4 text-yellow-500 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                          )}
                          <div className="text-left min-w-0">
                            <p className="text-sm text-white truncate">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(doc.updated_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          {doc.is_starred && (
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc.id);
                            }}
                            className="p-1 hover:bg-gray-600 rounded"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Document Editor */}
            <div className="lg:col-span-2">
              {selectedDoc ? (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  {/* Editor Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-700 bg-gray-900/50">
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <Type className="w-4 h-4 text-gray-300" />
                    </button>
                    <div className="w-px h-6 bg-gray-700 mx-1"></div>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <Bold className="w-4 h-4 text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <Italic className="w-4 h-4 text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <Underline className="w-4 h-4 text-gray-300" />
                    </button>
                    <div className="w-px h-6 bg-gray-700 mx-1"></div>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <AlignLeft className="w-4 h-4 text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <AlignCenter className="w-4 h-4 text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <AlignRight className="w-4 h-4 text-gray-300" />
                    </button>
                    <div className="w-px h-6 bg-gray-700 mx-1"></div>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <List className="w-4 h-4 text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <ListOrdered className="w-4 h-4 text-gray-300" />
                    </button>
                    <div className="w-px h-6 bg-gray-700 mx-1"></div>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <Image className="w-4 h-4 text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <Link2 className="w-4 h-4 text-gray-300" />
                    </button>
                    <div className="flex-1"></div>
                    <button
                      onClick={() => toggleStar(selectedDoc)}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedDoc.is_starred 
                          ? 'text-yellow-400 hover:bg-gray-700' 
                          : 'text-gray-400 hover:bg-gray-700'
                      }`}
                      title={selectedDoc.is_starred ? 'Remove from starred' : 'Add to starred'}
                    >
                      <Star className={`w-4 h-4 ${selectedDoc.is_starred ? 'fill-yellow-400' : ''}`} />
                    </button>
                    <button
                      onClick={saveDocument}
                      disabled={saving}
                      className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span className="text-sm">{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>

                  {/* Document Title */}
                  <div className="p-4 border-b border-gray-700 flex items-center space-x-2">
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      onBlur={saveDocument}
                      className="flex-1 bg-transparent text-xl font-semibold text-white focus:outline-none"
                      placeholder="Document title"
                    />
                  </div>

                  {/* Editor Content */}
                  <div className="p-4 min-h-100">
                    <textarea
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      onBlur={saveDocument}
                      className="w-full h-full min-h-87.5 bg-transparent text-white focus:outline-none resize-none"
                      placeholder="Start writing..."
                    />
                  </div>

                  {/* Document Footer */}
                  <div className="flex items-center justify-between p-3 border-t border-gray-700 bg-gray-900/50">
                    <div className="flex items-center space-x-4">
                      <button 
                        className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
                        onClick={() => toast.success('Document exported!', { id: 'export', icon: '📥', duration: 2000 })}
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-xs">Export</span>
                      </button>
                      <button 
                        className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(editorContent);
                          toast.success('Content copied to clipboard!', { id: 'copy', icon: '📋', duration: 2000 });
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-xs">Share</span>
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        Last edited: {formatDate(selectedDoc.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Document Selected</h3>
                  <p className="text-gray-400 mb-4">Select a document from the list or create a new one</p>
                  <button
                    onClick={createNewDocument}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Document</span>
                  </button>
                </div>
              )}
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

export default ResearchHubDocSpace;