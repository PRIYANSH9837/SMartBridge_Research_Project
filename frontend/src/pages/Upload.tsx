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
  Download,
  CheckCircle,
  File,
  Folder,
  AlertCircle,
  Trash2,
  Eye,
  Github,
  Twitter,
  Linkedin,
  Loader
} from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Workspace {
  id: number;
  name: string;
  color: string;
}

interface UploadedPaper {
  id: number;
  title: string;
  file_path: string;
  file_size: number;
  created_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;


const ResearchHubUploadPDF: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [saveToWorkspace, setSaveToWorkspace] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(null);
  const [recentUploads, setRecentUploads] = useState<UploadedPaper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchWorkspaces();
    fetchRecentUploads();
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
        toast.success('Workspaces loaded', { id: 'workspaces-loaded', icon: '📁', duration: 2000 });
      }
    } catch (err) {
      console.error("Failed to fetch workspaces:", err);
      toast.error('Failed to load workspaces', { id: 'workspaces-error' });
    }
  };

  const fetchRecentUploads = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/papers?limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecentUploads(data);
      }
    } catch (err) {
      console.error("Failed to fetch recent uploads:", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      uploadFile(files[0]);
    } else {
      setError("Please upload a PDF file");
      toast.error('Please upload a PDF file', { id: 'invalid-file', icon: '❌' });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files[0].type === 'application/pdf') {
        uploadFile(files[0]);
      } else {
        setError("Please upload a PDF file");
        toast.error('Please upload a PDF file', { id: 'invalid-file', icon: '❌' });
      }
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadedFile(file);


    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace('.pdf', ''));
    if (selectedWorkspace) {
      formData.append('workspace_ids', JSON.stringify([selectedWorkspace]));
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/papers/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      const data = await response.json();
      setExtractedText(data.extracted_text || "Text extracted successfully!");
      setSaveToWorkspace(!!selectedWorkspace);
      
      toast.success('PDF uploaded successfully!', { 
        id: 'uploading',
        icon: '✅',
        duration: 4000
      });

      toast.success('Text extracted from PDF', { 
        id: 'extracted',
        icon: '📄',
        duration: 3000
      });
      
      // Refresh recent uploads
      fetchRecentUploads();
      
    } catch (err: any) {
      setError(err.message);
      setUploadedFile(null);
      setExtractedText(null);
      
      toast.error(`Upload failed: ${err.message}`, { 
        id: 'uploading',
        duration: 5000
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setExtractedText(null);
    setSaveToWorkspace(false);
    setSelectedWorkspace(null);
    setError(null);
    
    toast('File removed', { id: 'file-removed', icon: '🗑️', duration: 2000 });
  };

  const handleDownloadText = () => {
    if (!extractedText) return;
    
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = uploadedFile?.name.replace('.pdf', '.txt') || 'extracted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Text file downloaded!', { id: 'download', icon: '📥', duration: 2000 });
  };

  const handleWorkspaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const workspaceId = value ? parseInt(value) : null;
    setSelectedWorkspace(workspaceId);
    
    if (workspaceId) {
      const workspace = workspaces.find(w => w.id === workspaceId);
      toast(`Workspace selected: ${workspace?.name}`, { 
        id: 'workspace-select',
        icon: '📁',
        duration: 2000
      });
    }
  };

  const handleViewPaper = (paperId: number) => {
    navigate(`/papers/${paperId}`);
    toast.success('Opening paper...', { id: 'view-paper', icon: '📄', duration: 1500 });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Search Papers", path: "/search", icon: <Search className="w-5 h-5" /> },
    { name: "AI Tools", path: "/ai-tools", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Upload PDF", path: "/upload", icon: <Upload className="w-5 h-5" /> },
    { name: "DocSpace", path: "/docspace", icon: <FileText className="w-5 h-5" /> },
  ];

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
              <h1 className="text-xl font-semibold text-white">Upload PDF</h1>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <Atom className="w-5 h-5 text-purple-400" />
              <h1 className="text-xl font-bold text-white">ResearchHub AI</h1>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                onClick={() => toast.success('Folder view coming soon!', { 
                  id: 'folder',
                  icon: '📁',
                  duration: 2000 
                })}
              >
                <Folder className="w-5 h-5 text-gray-300" />
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

        {/* Upload PDF Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Upload Research Paper</h2>
            <p className="text-gray-400">
              Upload a PDF to extract text and generate AI insights. Papers will be stored in your personal research library.
            </p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Upload Area */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Upload className="w-5 h-5 text-purple-400 mr-2" />
                  Upload PDF
                </h3>

                {/* Workspace Selection */}
                {workspaces.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">Select Workspace (Optional)</label>
                    <select
                      value={selectedWorkspace || ''}
                      onChange={handleWorkspaceChange}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">No workspace</option>
                      {workspaces.map((ws) => (
                        <option key={ws.id} value={ws.id}>{ws.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Drop Zone */}
                {!uploadedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      isDragging
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-purple-400' : 'text-gray-500'}`} />
                      <p className="text-gray-300 mb-2">Drop your PDF file here</p>
                      <p className="text-gray-500 text-sm mb-4">or</p>
                      <label className="cursor-pointer">
                        <span className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors inline-block">
                          Select PDF File
                        </span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      <p className="text-gray-500 text-xs mt-4">Maximum file size: 50MB</p>
                    </div>
                  </div>
                ) : (
                  /* Uploaded File Info */
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <File className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{uploadedFile.name}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {formatFileSize(uploadedFile.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveFile}
                          className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      
                      {isUploading && (
                        <div className="mt-3">
                          <div className="flex items-center space-x-2">
                            <Loader className="w-4 h-4 text-purple-400 animate-spin" />
                            <span className="text-sm text-gray-400">Processing PDF...</span>
                          </div>
                          <div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
                            <div className="w-full h-full bg-purple-500 animate-pulse"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Options */}
                    {!isUploading && extractedText && (
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saveToWorkspace}
                            onChange={(e) => {
                              setSaveToWorkspace(e.target.checked);
                              if (e.target.checked) {
                                toast.success('Paper will be saved to workspace', { 
                                  id: 'save-workspace',
                                  icon: '📁',
                                  duration: 2000 
                                });
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                          />
                          <span className="text-sm text-gray-300">Save to Workspace</span>
                        </label>

                        <button
                          onClick={handleDownloadText}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm font-medium">Download Text</span>
                        </button>
                      </div>
                    )}

                    {saveToWorkspace && (
                      <div className="flex items-center space-x-2 text-sm text-green-400 bg-green-500/10 p-3 rounded-lg">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>Paper will be saved to your workspace</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tips */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-white mb-3">Tips:</h4>
                  <ul className="space-y-2 text-xs text-gray-400">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />
                      <span>PDF files are automatically processed for text extraction</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />
                      <span>Extracted text can be used with AI tools for analysis</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />
                      <span>Save to workspace to organize with other papers</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column - Extracted Text */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <FileText className="w-5 h-5 text-purple-400 mr-2" />
                    Extracted Text
                  </h3>
                  {extractedText && (
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        onClick={() => toast.success('Preview mode', { id: 'preview', icon: '👁️', duration: 1500 })}
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>

                {extractedText ? (
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 max-h-125overflow-y-auto">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                      {extractedText}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-900/50 rounded-lg p-8 border border-gray-700 text-center">
                    {uploadedFile && isUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader className="w-8 h-8 text-purple-400 animate-spin mb-4" />
                        <p className="text-gray-300">Extracting text from PDF...</p>
                        <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-gray-600 mb-4" />
                        <p className="text-gray-400">No PDF uploaded yet</p>
                        <p className="text-gray-500 text-sm mt-2">
                          Upload a PDF file to see extracted text
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Recent Uploads */}
                {recentUploads.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-white mb-3">Recent Uploads</h4>
                    <div className="space-y-2">
                      {recentUploads.map((paper) => (
                        <div key={paper.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <File className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-gray-300">{paper.title}</span>
                          </div>
                          <button 
                            onClick={() => handleViewPaper(paper.id)}
                            className="text-xs text-purple-400 hover:text-purple-300"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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

export default ResearchHubUploadPDF;