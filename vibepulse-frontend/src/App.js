import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DocumentationPage from './pages/DocumentationPage';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import APIKeysAndPlayground from './pages/user/APIKeysAndPlayground';
import MusicLibrary from './pages/user/MusicLibrary';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UsersPage from './pages/admin/UsersPage';
import SongsPage from './pages/admin/SongsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          style={{ zIndex: 99999 }} // 👈 TAMBAHKAN INI
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/docs" element={<DocumentationPage />} />

          {/* User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/api-keys"
            element={
              <ProtectedRoute>
                <Layout>
                  <APIKeysAndPlayground />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Redirect /playground to /api-keys */}
          <Route path="/playground" element={<Navigate to="/api-keys" replace />} />
          
          <Route
            path="/music"
            element={
              <ProtectedRoute>
                <Layout>
                  <MusicLibrary />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <UsersPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/songs"
            element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <SongsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/music"
            element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <MusicLibrary />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;