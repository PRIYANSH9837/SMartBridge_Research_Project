
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import ResearchHubLanding from './pages/LangingPage';
import ResearchHubDashboard from './pages/Dashboard';
import ResearchHubSearch from './pages/Search';
import ResearchHubAITools from './pages/AItools';
import ResearchHubUploadPDF from './pages/Upload';
import ResearchHubDocSpace from './pages/DocSpace';
import ProtectedRoute from "./components/protectedRoute";
import AnalysisView from './pages/AnalysisView';
import WorkspaceView from './pages/WorkspaceView';

const App = () => {
  return (
    <div>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#1f2937', 
            color: '#fff',
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<ResearchHubLanding />} />
          <Route path="/dashboard" element={<ProtectedRoute><ResearchHubDashboard /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><ResearchHubSearch /></ProtectedRoute>} />
          <Route path="/ai-tools" element={<ProtectedRoute><ResearchHubAITools/></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><ResearchHubUploadPDF /></ProtectedRoute>} />
          <Route path="/docspace" element={<ProtectedRoute><ResearchHubDocSpace /></ProtectedRoute>} />
          <Route path="/analysis/:id" element={<ProtectedRoute><AnalysisView /></ProtectedRoute>} />
          <Route path="/workspaces/:id" element={<ProtectedRoute><WorkspaceView /></ProtectedRoute>} />
        </Routes>
      </Router>
    </div>
  )
}

export default App