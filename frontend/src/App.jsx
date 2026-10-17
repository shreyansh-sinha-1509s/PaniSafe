import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ExplorePage from './pages/ExplorePage';
import StationDetailsPage from './pages/StationDetailsPage';
import MapPage from './pages/MapPage';
import AlertsPage from './pages/AlertsPage';
import MethodologyPage from './pages/MethodologyPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

function getPathFromLocation() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#')) {
    return hash.substring(1) || '/';
  }
  return window.location.pathname || '/';
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(getPathFromLocation);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getPathFromLocation());
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Route matching
  let pageContent = null;

  if (currentPath === '/' || currentPath === '') {
    pageContent = <HomePage navigate={navigate} />;
  } else if (currentPath === '/dashboard') {
    pageContent = <DashboardPage navigate={navigate} />;
  } else if (currentPath === '/explore') {
    pageContent = <ExplorePage navigate={navigate} />;
  } else if (currentPath.startsWith('/stations/')) {
    const stationId = currentPath.replace('/stations/', '');
    pageContent = <StationDetailsPage stationId={stationId} navigate={navigate} />;
  } else if (currentPath === '/map') {
    pageContent = <MapPage navigate={navigate} />;
  } else if (currentPath === '/alerts') {
    pageContent = <AlertsPage navigate={navigate} />;
  } else if (currentPath === '/methodology') {
    pageContent = <MethodologyPage navigate={navigate} />;
  } else if (currentPath === '/about') {
    pageContent = <AboutPage navigate={navigate} />;
  } else if (currentPath === '/contact') {
    pageContent = <ContactPage navigate={navigate} />;
  } else if (currentPath === '/login') {
    pageContent = <LoginPage navigate={navigate} />;
  } else if (currentPath === '/register') {
    pageContent = <RegisterPage navigate={navigate} />;
  } else {
    pageContent = <NotFoundPage navigate={navigate} />;
  }

  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar currentPath={currentPath} navigate={navigate} />
        <main style={{ flex: 1 }}>
          {pageContent}
        </main>
        <Footer navigate={navigate} />
      </div>
    </AuthProvider>
  );
}
