import { IconHeartbeat, IconLogout } from "./icons";

/* ============================================
   DashboardLayout.jsx — Shell compartido
   Usar en src/components/DashboardLayout.jsx
   ============================================ */

function DashboardLayout({
  roleLabel,
  navItems,
  activeId,
  onNavItemClick,
  userName,
  userSubtitle,
  onLogout,
  headerTitle,
  headerSubtitle,
  children,
}) {
  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo">
          <span className="dash-logo-badge">
            <IconHeartbeat className="dash-logo-icon" />
          </span>
          <div className="dash-logo-text">
            <span className="dash-logo-name">Portal HTA</span>
            <span className="dash-logo-role">{roleLabel}</span>
          </div>
        </div>

        <nav className="dash-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`dash-nav-item ${activeId === item.id ? "active" : ""}`}
              onClick={() => onNavItemClick(item.id)}
            >
              <span className="dash-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge ? <span className="dash-nav-badge">{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <button type="button" className="dash-logout-btn" onClick={onLogout}>
          <IconLogout />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">{headerTitle}</h1>
            {headerSubtitle ? <p className="dash-topbar-subtitle">{headerSubtitle}</p> : null}
          </div>

          <div className="dash-user-chip">
            <span className="dash-user-avatar">{userName ? userName.charAt(0).toUpperCase() : "?"}</span>
            <div className="dash-user-info">
              <span className="dash-user-name">{userName}</span>
              {userSubtitle ? <span className="dash-user-subtitle">{userSubtitle}</span> : null}
            </div>
          </div>
        </header>

        <main className="dash-content">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
