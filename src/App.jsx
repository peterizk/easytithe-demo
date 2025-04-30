import CampTable from "./CampTable";
import "./App.css";

export default function App() {
  return (
    <div className="app-wrapper">
      <h1>2025 Camp Events</h1>
      <p>Select a camp below to register.</p>
      <CampTable />
    </div>
  );
}
