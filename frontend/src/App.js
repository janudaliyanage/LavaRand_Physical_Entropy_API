import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Playground from './pages/Playground';
import Docs from './pages/Docs';
import Admin from './pages/Admin';
import './App.css';

// Scrolls to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/"            element={<Landing />} />
          <Route path="/playground"  element={<Playground />} />
          <Route path="/docs"        element={<Docs />} />
          <Route path="/admin"       element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;