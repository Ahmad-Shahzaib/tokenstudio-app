import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import Navbar from './components/Navbar';
import TokenGenerator from './pages/TokenGenerator';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import AirdropPage from './pages/Airdrop';

// import Footer from './components/Footer';

// Add Error Boundary component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong.</h1>
          <p className="text-white text-center">
            We're sorry for the inconvenience. The issue has been logged and our team is working on a fix.
          </p>
          <button
            className="mt-6 px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <WalletProvider>
      <Router>
        <ErrorBoundary> {/* Wrap with ErrorBoundary */}
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <Navbar />
            <Routes>
              <Route path="/create" element={<TokenGenerator />} />
              <Route path="/" element={<About />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/airdrop" element={<AirdropPage />} />
              <Route path="*" element={<NotFound />} />

            </Routes>
            {/* <Footer /> */}
          </div>

        </ErrorBoundary>
      </Router>
    </WalletProvider>
  );
}

export default App;