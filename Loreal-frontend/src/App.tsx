import { ClaimAssessment } from "./components/ClaimAssessment";

import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Claims Intelligence Engine</h1>
        <p>Check whether a clinical study justifies a product claim.</p>
      </header>

      <main>
        <ClaimAssessment />
      </main>
    </div>
  );
}

export default App;
