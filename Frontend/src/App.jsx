import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import GrainOverlay from './components/ui/GrainOverlay';
import { ProtectedRoute, PublicOnlyRoute, AdminRoute } from './components/layout/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import BookDetail from './pages/BookDetail';
import UploadBook from './pages/UploadBook';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import MyBooks from './pages/MyBooks';

export default function App() {
  return (
    <ToastProvider>
      <GrainOverlay />
      <Router>
        <Routes>
          {/* Public / Auth */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/my-books" element={<ProtectedRoute><MyBooks /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          <Route path="/books/upload" element={<ProtectedRoute><UploadBook /></ProtectedRoute>} />
          <Route path="/books/:bookId" element={<ProtectedRoute><BookDetail /></ProtectedRoute>} />
          
          <Route path="/books/:bookId/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
