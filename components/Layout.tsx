import React from 'react';
import { UserRole } from '../types';
import { DashboardIcon, BriefcaseIcon, RoadmapIcon, DocumentTextIcon, LogoutIcon, UserGroupIcon, PencilSquareIcon, QuestionMarkCircleIcon } from './icons';

interface LayoutProps {
  userRole: UserRole;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const studentNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'drives', label: 'Current Drives', icon: BriefcaseIcon },
  { id: 'roadmaps', label: 'Roadmaps', icon: RoadmapIcon },
  { id: 'resume', label: 'Resume Analyzer', icon: DocumentTextIcon },
  { id: 'mock-tests', label: 'Mock Tests', icon: PencilSquareIcon },
  { id: 'interview-prep', label: 'Interview Prep', icon: QuestionMarkCircleIcon },
];

const adminNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'manage-drives', label: 'Manage Drives', icon: BriefcaseIcon },
];

const NavItem: React.FC<{
  item: { id: string; label: string; icon: React.FC<{ className?: string }> };
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
      isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-indigo-800 hover:text-white'
    }`}
  >
    <item.icon className="w-6 h-6 mr-4" />
    <span className="font-medium">{item.label}</span>
  </li>
);

const Layout: React.FC<LayoutProps> = ({ userRole, activeView, setActiveView, onLogout, children }) => {
  const navItems = userRole === UserRole.STUDENT ? studentNavItems : adminNavItems;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="h-20 flex items-center justify-center border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white tracking-wider">CampusPrep</h1>
        </div>
        <nav className="flex-1 px-4 py-4">
          <ul>
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeView === item.id}
                onClick={() => setActiveView(item.id)}
              />
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div
            onClick={onLogout}
            className="flex items-center p-3 rounded-lg cursor-pointer text-gray-300 hover:bg-red-600 hover:text-white transition-colors duration-200"
          >
            <LogoutIcon className="w-6 h-6 mr-4" />
            <span className="font-medium">Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8">
          <h2 className="text-2xl font-semibold text-gray-700 capitalize">{activeView.replace('-', ' ')}</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-gray-800 font-semibold">{userRole === UserRole.STUDENT ? "Student" : "Administrator"}</p>
              <p className="text-sm text-gray-500">{userRole === UserRole.STUDENT ? "student@campus.edu" : "admin@campus.edu"}</p>
            </div>
            <img className="w-12 h-12 rounded-full object-cover" src={`https://i.pravatar.cc/150?u=${userRole}`} alt="User Avatar" />
          </div>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
