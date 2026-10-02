import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, Pin, FolderKanban, Clock, LogOut } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth); // Get logged-in user

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Students', path: '/admin/students' },
    { icon: BookOpen, label: 'Teachers', path: '/admin/teachers' },
    { icon: Pin, label: 'Assign Panel', path: '/admin/assign-panel' },
    { icon: FolderKanban, label: 'Projects', path: '/admin/projects' },
    { icon: Clock, label: 'Deadlines', path: '/admin/deadlines' },
  ];

  return (
    <div className="flex flex-col h-screen bg-white border-r w-60 border-slate-200">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-600 rounded-lg">
            <span className="text-lg font-semibold">E</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">EduTrack</h2> 
            <p className="text-xs text-slate-500">{user?.name || 'Admin Panel'}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-200">
        <button className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 transition-colors rounded-lg hover:bg-red-50">
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;