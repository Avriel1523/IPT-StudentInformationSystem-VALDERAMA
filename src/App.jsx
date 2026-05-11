import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import AddStudent from "./pages/AddStudent";
import Car from "./pages/Car";
import Users from "./pages/Users";
import Login from "./pages/Login";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <div className="app">
          <Sidebar />
          <div className="content">
            <Login />
          </div>
        </div>
      } />
      <Route path="/" element={
        <div className="app">
          <Sidebar />
          <div className="content">
            <Home />
          </div>
        </div>
      } />
      <Route path="/dashboard" element={
        <div className="app">
          <Sidebar />
          <div className="content">
            <Home />
          </div>
        </div>
      } />
      <Route path="/add-student" element={
        <div className="app">
          <Sidebar />
          <div className="content">
            <AddStudent />
          </div>
        </div>
      } />
      <Route path="/car" element={
        <div className="app">
          <Sidebar />
          <div className="content">
            <Car />
          </div>
        </div>
      } />
      <Route path="/users" element={
        <div className="app">
          <Sidebar />
          <div className="content">
            <Users />
          </div>
        </div>
      } />
    </Routes>
  );
}

export default App;