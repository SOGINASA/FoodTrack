import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

import Dashboard from './pages/Dashboard';
import AddMeal from './pages/AddMeal';
import Diary from './pages/Diary';
import Analytics from './pages/Analytics';
import Tips from './pages/Tips';
import Recipes from './pages/Recipes';
import Progress from './pages/Progress';
import Groups from './pages/Groups';
import Settings from './pages/Settings';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-white flex overflow-x-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        <div className="flex-1 flex flex-col lg:ml-64 overflow-x-hidden">
          <Header />

          <main className="flex-1 pb-20 lg:pb-8 overflow-x-hidden">
            <div className="w-full px-4 py-6 lg:px-8 lg:py-8 lg:max-w-7xl lg:mx-auto overflow-x-hidden">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add-meal" element={<AddMeal />} />
                <Route path="/diary" element={<Diary />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/tips" element={<Tips />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;