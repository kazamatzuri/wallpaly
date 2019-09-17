import React from 'react';
import './App.css';
import { LinesCanvas } from "./components/LinesCanvas";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <LinesCanvas width={640} height={480}></LinesCanvas>
    </div>
  );
}

export default App;
