import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <h1 className="text-4xl font-bold text-center py-8">
          🍎 FoodTrack
        </h1>
        <p className="text-center text-secondary">
          AI-трекер питания по фото
        </p>
      </div>
    </Router>
  );
}

export default App;