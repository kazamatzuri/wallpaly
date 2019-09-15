import React from 'react';
import './App.css';
import { LinesCanvas } from "./components/LinesCanvas";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <LinesCanvas></LinesCanvas>
    </div>
  );
}

export default App;
