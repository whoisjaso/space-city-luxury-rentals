import { Routes, Route, Navigate } from 'react-router';
import './App.css';
import { AuthProvider } from './providers/AuthProvider';
import { QueryProvider } from './providers/QueryProvider';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Catch-all: redirect unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
