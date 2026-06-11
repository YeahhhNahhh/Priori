import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Moon, Sun, Menu, X, LayoutDashboard, Stethoscope,
  Hospital, Users, FileText, Bell, MessageSquare, User,
  LogOut, ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SOSModal from '../SOSModal';

const navItems = [
  { path: '/patient/dashboard',  label: 'Dashboard',           icon: LayoutDashboard },
  { path: '/patient/symptoms',   label: 'Symptom Check',       icon: Stethoscope },
  { path: '/patient/hospitals',  label: 'Hospital Suggestions', icon: Hospital },
  { path: '/patient/family',     label: 'Family Profiles',     icon: Users },
  { path: '/patient/history',    label: 'Medical History',     icon: FileText },
  { path: '/patient/alerts',     label: 'Alerts',              icon: Bell },
  { path: '/patient/feedback',   label: 'Feedback',            icon: MessageSquare },
  { path: '/patient/profile',    label: 'Profile',             icon: User },
];

export default function PatientLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);

  const sidebarW = collapsed ? 72 : 248;

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: 'rgb(var(--bg-primary))', color: 'rgb(var(--text-primary))' }}
    >
      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        style={{
          width: sidebarW,
          minWidth: sidebarW,
          backgroundColor: 'rgb(var(--bg-sidebar))',
          borderRight: '1px solid rgb(var(--border-color))',
          transition: 'width 0.25s ease, min-width 0.25s ease',
        }}
        className={`
          fixed top-0 left-0 h-screen z-50 flex flex-col overflow-hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:sticky
        `}
      >
        {/* Logo row */}
        <div className="flex items-center justify-between px-4 py-5 shrink-0">
          {!collapsed && (
            <span style={{ color: 'rgb(var(--accent))' }} className="font-black text-2xl tracking-tight select-none">
              PRIORI
            </span>
          )}
          {collapsed && (
            <span style={{ color: 'rgb(var(--accent))' }} className="font-black text-2xl tracking-tight mx-auto select-none">
              P
            </span>
          )}
          {/* Collapse toggle – desktop only */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-[rgb(var(--bg-hover))]"
            style={{ color: 'rgb(var(--text-secondary))' }}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ color: 'rgb(var(--text-secondary))' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 overflow-y-auto scrollbar-hidden space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
              }
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* ── Mobile-only sidebar footer: theme + user + logout ── */}
        <div
          className="md:hidden shrink-0 px-2 py-3 space-y-1"
          style={{ borderTop: '1px solid rgb(var(--border-color))' }}
        >
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="nav-item w-full"
          >
            {theme === 'dark'
              ? <Sun size={20} style={{ flexShrink: 0 }} />
              : <Moon size={20} style={{ flexShrink: 0 }} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="flex items-center gap-3 px-3 py-2 rounded-lg overflow-hidden">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white"
              style={{ backgroundColor: 'rgb(var(--accent))' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">{user?.name}</span>
              <span className="text-xs truncate" style={{ color: 'rgb(var(--text-secondary))' }}>{user?.email}</span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="nav-item w-full"
            style={{ color: 'rgb(var(--color-red))' }}
          >
            <LogOut size={20} style={{ flexShrink: 0 }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">

        {/* ── Desktop Top Header ── */}
        <header
          className="hidden md:flex items-center justify-between px-6 py-3.5 shrink-0 sticky top-0 z-30"
          style={{
            backgroundColor: 'rgb(var(--bg-sidebar))',
            borderBottom: '1px solid rgb(var(--border-color))',
          }}
        >
          {/* Left – breadcrumb placeholder */}
          <div />

          {/* Right – profile + theme + logout */}
          <div className="flex items-center gap-2">
            {/* Profile link */}
            <Link
              to="/patient/profile"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors"
              style={{ backgroundColor: 'rgb(var(--bg-hover))' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white"
                style={{ backgroundColor: 'rgb(var(--accent))' }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">{user?.name}</span>
                <span className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>Patient</span>
              </div>
            </Link>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors hover:bg-[rgb(var(--bg-hover))]"
              style={{ color: 'rgb(var(--text-secondary))' }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              title="Logout"
              className="flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm transition-colors hover:bg-[rgb(var(--bg-hover))]"
              style={{ color: 'rgb(var(--color-red))' }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* ── Mobile top bar ── */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 shrink-0 sticky top-0 z-30"
          style={{
            backgroundColor: 'rgb(var(--bg-sidebar))',
            borderBottom: '1px solid rgb(var(--border-color))',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg"
              style={{ color: 'rgb(var(--text-secondary))' }}
            >
              <Menu size={24} />
            </button>
            <span style={{ color: 'rgb(var(--accent))' }} className="font-black text-xl tracking-tight">PRIORI</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-lg"
              style={{ color: 'rgb(var(--text-secondary))' }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white ml-1"
              style={{ backgroundColor: 'rgb(var(--accent))' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* ── SOS Button ── */}
      <button
        onClick={() => setSosOpen(true)}
        className="sos-btn animate-pulse-soft"
        aria-label="Emergency SOS"
      >
        SOS
      </button>

      <SOSModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
    </div>
  );
}
