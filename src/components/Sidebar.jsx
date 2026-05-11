import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">Dashboard</h2>
      <ul className="menu">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/add-student">Students</Link></li>
        <li><Link to="/car">Car</Link></li>
        <li><Link to="/users">Users</Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;