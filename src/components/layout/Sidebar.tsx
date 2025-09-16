import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  Settings, 
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contracts', href: '/contracts', icon: FileText },
  { name: 'Query', href: '/query', icon: Search },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col w-64 bg-white/95 backdrop-blur-sm border-r border-secondary-200/50 shadow-soft">
      <div className="flex items-center h-16 px-6 border-b border-secondary-200/50">
        <div className="h-10 w-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <span className="ml-3 text-xl font-bold gradient-text">
          ContractAI
        </span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                  : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 h-5 w-5 transition-colors duration-200
                  ${isActive ? 'text-white' : 'text-secondary-500 group-hover:text-secondary-700'}
                `}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-secondary-200/50 p-4 bg-secondary-50/50">
        <div className="flex items-center p-3 rounded-xl bg-white/80 shadow-sm">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary-100 to-primary-200 flex items-center justify-center">
              <User className="h-5 w-5 text-primary-700" />
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-semibold text-secondary-900 truncate">{user?.username}</p>
            <p className="text-xs text-secondary-600 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-3 w-full flex items-center px-4 py-3 text-sm font-semibold text-secondary-700 rounded-xl hover:bg-danger-50 hover:text-danger-700 transition-all duration-200 group"
        >
          <LogOut className="mr-3 h-5 w-5 text-secondary-500 group-hover:text-danger-600 transition-colors duration-200" />
          Sign out
        </button>
      </div>
    </div>
  );
};
