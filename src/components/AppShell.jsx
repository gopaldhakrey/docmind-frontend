import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FileText,
  MessageSquare,
  Search,
  LayoutDashboard,
  UserRound,
  LogOut,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  ["/dashboard", LayoutDashboard, "Overview"],
  ["/documents", FileText, "Documents"],
  ["/chat", MessageSquare, "Ask documents"],
  ["/search", Search, "Semantic search"],
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app">
      {sidebarOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close menu"
          onClick={closeSidebar}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">D</div>

          <div>
            <strong>DocMind</strong>
            <span>document intelligence</span>
          </div>

          <button
            className="mobile-close"
            type="button"
            aria-label="Close menu"
            onClick={closeSidebar}
          >
            <X size={20} />
          </button>
        </div>

        <button
          className="new-chat"
          onClick={() => {
            navigate("/chat");
            closeSidebar();
          }}
        >
          <Plus size={17} />
          New question
        </button>

        <nav>
          <p className="nav-label">Workspace</p>

          {links.map(([to, Icon, label]) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink
            to="/profile"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <UserRound size={18} />
            Profile
          </NavLink>

          <button
            className="nav-link logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button
            className="mobile-menu"
            type="button"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={21} />
          </button>

          <div className="topbar-title">Your workspace</div>

          <div className="user-chip">
            <span className="avatar">
              {(user?.username || "U").slice(0, 1).toUpperCase()}
            </span>

            <span>{user?.username || "User"}</span>
          </div>
        </header>

        <div className="content">{children}</div>
      </main>
    </div>
  );
}
