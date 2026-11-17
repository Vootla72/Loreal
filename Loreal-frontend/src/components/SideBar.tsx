
import { NavLink } from "react-router-dom";

export  const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2>Claims AI</h2>

      <nav>
        <NavLink to="/" end>
          Dashboard
        </NavLink>

        <NavLink to="/products">
          Product Management
        </NavLink>

        <NavLink to="/claims">
          Claims Management
        </NavLink>

        <NavLink to="/assessment">
          Scientist Testing
        </NavLink>

        <NavLink to="/evaluator">
          Evaluator Review
        </NavLink>
      </nav>
    </aside>
  );
};

