import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MessageSquare, 
  FileText, 
  BookOpen, 
  CheckCircle, 
  ArrowRight,
  Menu,
  X,
  LayoutDashboard,
  Upload,
  Home,
  ChevronLeft,
  ChevronRight,
  Atom,
  LogIn,
  UserPlus
} from 'lucide-react';
import AuthModal from '../components/authModal';
import { useNavigate } from 'react-router-dom';
import { Link ,NavLink} from 'react-router-dom';

const ResearchHubLanding: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<any>(null);
  

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Search Papers", path: "/search", icon: <Search className="w-5 h-5" /> },
    { name: "AI Tools", path: "/ai-tools", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Upload PDF", path: "/upload", icon: <Upload className="w-5 h-5" /> },
    { name: "DocSpace", path: "/docspace", icon: <FileText className="w-5 h-5" /> },
  ];

  const features = [
    {
      icon: <Search className="w-8 h-8 text-purple-400" />,
      title: 'Smart Paper Search',
      description: 'Find research papers across multiple databases with AI-powered search.'
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-purple-400" />,
      title: 'AI Chat Assistant',
      description: 'Ask questions about your research papers and get intelligent responses.'
    },
    {
      icon: <FileText className="w-8 h-8 text-purple-400" />,
      title: 'DocSpace Editor',
      description: 'Create and edit documents with rich text formatting like Google Docs.'
    },
    {
      icon: <BookOpen className="w-8 h-8 text-purple-400" />,
      title: 'Literature Review',
      description: 'Generate comprehensive literature reviews from selected papers.'
    }
  ];

  const benefits = [
    'Save 80% time on literature review',
    'Access millions of research papers',
    'AI-powered insights and summaries',
    'Collaborative workspace features',
    'Export to multiple formats'
  ];

  return (
    <div className="flex min-h-screen bg-gray-900">
      <aside 
        className={`fixed left-0 top-0 h-full bg-gray-800 border-r border-gray-700 transition-all duration-300 z-40 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } hidden md:block`}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-2">
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
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <header className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 z-30">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="hidden md:flex items-center space-x-2">
              <Atom className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">ResearchHub AI</h2>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <Atom className="w-5 h-5 text-purple-400" />
              <h1 className="text-xl font-bold text-white">ResearchHub AI</h1>
            </div>

            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <div className="relative group">
                    <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold cursor-pointer">
                      {user.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                        <p className="font-semibold">{user.full_name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={openLoginModal}
                    className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-gray-300 hover:text-purple-400 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="text-sm font-medium">Login</span>
                  </button>

                  <button 
                    onClick={openSignupModal}
                    className="hidden sm:flex items-center space-x-1 px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </button>
                </>
              )}
            </div>
          </div>

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
                {!user && (
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <button 
                      onClick={openLoginModal}
                      className="flex items-center space-x-1 px-3 py-1.5 text-gray-300 hover:text-purple-400 transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="text-sm font-medium">Login</span>
                    </button>
                    <button 
                      onClick={openSignupModal}
                      className="flex items-center space-x-1 px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        <section className="bg-linear-to-br from-gray-800 via-gray-900 to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Your AI-Powered <span className='text-purple-400'>Research Assistant</span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
                Accelerate your research with intelligent paper discovery, AI-powered insights, 
                and collaborative document editing - all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center group"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <button 
                    onClick={openSignupModal}
                    className="px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center group"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
                <Link
                  to="/docspace"
                  className="px-8 py-4 bg-gray-800 text-purple-400 text-lg font-semibold rounded-lg border-2 border-purple-400 hover:bg-gray-700 transition-colors flex items-center justify-center group"
                >
                  Try DocSpace
                  <FileText className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Powerful Features for Modern Research
              </h3>
              <div className="w-24 h-1 bg-purple-400 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="p-6 rounded-xl bg-gray-800 border border-gray-700 hover:border-purple-600 hover:shadow-lg hover:shadow-purple-900/20 transition-all group"
                >
                  <div className="mb-4 p-3 bg-gray-700 rounded-lg inline-block group-hover:bg-gray-600 transition-colors">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Why Choose ResearchHub AI?
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-lg text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  {user ? (
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  ) : (
                    <button 
                      onClick={openSignupModal}
                      className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Get Started Today
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-900 p-6 rounded-xl shadow-md shadow-gray-900 text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">80%</div>
                  <div className="text-gray-400">Time Saved</div>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl shadow-md shadow-gray-900 text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">10M+</div>
                  <div className="text-gray-400">Papers</div>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl shadow-md shadow-gray-900 text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
                  <div className="text-gray-400">AI Support</div>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl shadow-md shadow-gray-900 text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">5K+</div>
                  <div className="text-gray-400">Researchers</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-black text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Atom className="w-6 h-6 text-purple-400" />
                  <h4 className="text-white text-lg font-semibold">ResearchHub AI</h4>
                </div>
                <p className="text-sm text-gray-400">
                  Accelerating research through AI-powered tools and collaborative workspaces.
                </p>
              </div>
              <div>
                <h5 className="text-white font-medium mb-4">Product</h5>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                  <li><Link to="/docspace" className="text-gray-400 hover:text-white transition-colors">DocSpace</Link></li>
                  <li><Link to="/ai-tools" className="text-gray-400 hover:text-white transition-colors">AI Tools</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-medium mb-4">Company</h5>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-medium mb-4">Legal</h5>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} ResearchHub AI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onLoginSuccess={(userData) => {
          setUser(userData);
        }}
      />
    </div>
  );
};

export default ResearchHubLanding;