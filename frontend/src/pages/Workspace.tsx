import React, { useState, useEffect } from 'react';
import { 
  X,
  Plus,
  Folder,
  Palette,
  Type,
  
  Check,
  AlertCircle,
  Loader,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateNewWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceCreated: (workspace: any) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;


const CreateNewWorkspace: React.FC<CreateNewWorkspaceProps> = ({ 
  isOpen, 
  onClose, 
  onWorkspaceCreated 
}) => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('purple');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form after modal closes
      setTimeout(() => {
        setWorkspaceName('');
        setDescription('');
        setSelectedColor('purple');
        setError(null);
        setIsCreating(false);
      }, 300);
    }
  }, [isOpen]);

  const colors = [
    { name: 'purple', bg: 'bg-purple-500', lightBg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400' },
    { name: 'blue', bg: 'bg-blue-500', lightBg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400' },
    { name: 'green', bg: 'bg-green-500', lightBg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400' },
    { name: 'orange', bg: 'bg-orange-500', lightBg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-400' },
    { name: 'pink', bg: 'bg-pink-500', lightBg: 'bg-pink-500/20', border: 'border-pink-500', text: 'text-pink-400' },
    { name: 'red', bg: 'bg-red-500', lightBg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400' },
    { name: 'yellow', bg: 'bg-yellow-500', lightBg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400' },
    { name: 'indigo', bg: 'bg-indigo-500', lightBg: 'bg-indigo-500/20', border: 'border-indigo-500', text: 'text-indigo-400' },
  ];

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      setError('Workspace name is required');
      toast.error('Workspace name is required', { 
        id: 'workspace-name-error',
        icon: '📁',
        duration: 3000
      });
      return;
    }

    setIsCreating(true);
    setError(null);


    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/workspaces/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: workspaceName.trim(),
          description: description.trim() || undefined,
          color: selectedColor,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create workspace');
      }

      const newWorkspace = await response.json();
      
      toast.success(`Workspace "${newWorkspace.name}" created successfully!`, { 
        id: 'creating-workspace',
        icon: '✅',
        duration: 4000
      });
      
      // Reset form
      setWorkspaceName('');
      setDescription('');
      setSelectedColor('purple');
      
      // Notify parent
      onWorkspaceCreated(newWorkspace);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating workspace');
      toast.error(`Failed to create workspace: ${err.message}`, { 
        id: 'creating-workspace',
        duration: 5000
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setWorkspaceName(suggestion);
    toast(`Selected: ${suggestion}`, { 
      id: 'suggestion',
      icon: '✨',
      duration: 1500
    });
  };

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    toast(`Color: ${colorName}`, { 
      id: 'color-select',
      icon: '🎨',
      duration: 1500
    });
  };

  const handleClose = () => {
    onClose();
    toast('Creation cancelled', { 
      id: 'cancel',
      icon: '❌',
      duration: 2000
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal - Scrollable Container */}
      <div className="flex min-h-full items-start sm:items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-md transform rounded-xl bg-gray-800 border border-gray-700 shadow-2xl transition-all my-4 sm:my-8">
          
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 bg-gray-800 rounded-t-xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Folder className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Create New Workspace</h3>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-16rem)]">
            <div className="p-4 sm:p-6 space-y-6">
              
              {/* Workspace Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Workspace Name *
                </label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    placeholder="e.g., AI Research 2025"
                    autoFocus
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                  placeholder="Describe the purpose of this workspace..."
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <div className="flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-purple-400" />
                    <span>Workspace Color</span>
                  </div>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorSelect(color.name)}
                      className={`
                        relative p-3 rounded-lg border-2 transition-all
                        ${selectedColor === color.name 
                          ? `${color.border} ${color.lightBg}` 
                          : 'border-gray-700 hover:border-gray-600'
                        }
                      `}
                      title={`Select ${color.name} color`}
                    >
                      <div className={`w-full h-1 ${color.bg} rounded-full mb-2`} />
                      <span className={`text-xs capitalize ${selectedColor === color.name ? color.text : 'text-gray-400'}`}>
                        {color.name}
                      </span>
                      {selectedColor === color.name && (
                        <Check className={`absolute top-1 right-1 w-3 h-3 ${color.text}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              {/* AI Suggestion */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">Pro Tip</h4>
                    <p className="text-xs text-gray-400">
                      Create separate workspaces for different research projects. 
                      You can organize papers, documents, and analyses by topic or project.
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggested Names */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Suggested names:</p>
                <div className="flex flex-wrap gap-2">
                  {['AI Agents Research', 'LLM Papers', 'Literature Review 2025', 'Computer Vision', 'NLP Projects'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-gray-300 transition-colors"
                      title={`Use "${suggestion}"`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Workspaces Note */}
              <div className="text-xs text-gray-500 border-t border-gray-700 pt-4">
                <p>You can create unlimited workspaces to organize your research papers and documents.</p>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 flex items-center justify-end space-x-3 p-4 sm:p-6 border-t border-gray-700 bg-gray-800 rounded-b-xl">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateWorkspace}
              disabled={!workspaceName.trim() || isCreating}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2
                ${workspaceName.trim() && !isCreating
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isCreating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Workspace</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewWorkspace;