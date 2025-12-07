import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, X, Heart, FileText, Calendar, DollarSign,
  BookOpen, MessageSquare, LogOut, User, ChevronDown,
  Settings, UserCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { path: '/resources', label: 'Resources', icon: FileText },
    { path: '/support', label: 'Support', icon: Heart },
    { path: '/medical-records', label: 'Records', icon: FileText },
    { path: '/emergency-plan', label: 'Emergency', icon: Heart },
    { path: '/care-schedule', label: 'Schedule', icon: Calendar },
    { path: '/financial-resources', label: 'Financial', icon: DollarSign },
    { path: '/community', label: 'Community', icon: MessageSquare },
    { path: '/training', label: 'Training', icon: BookOpen },
  ];

  const publicLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('token');
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Heart className="h-8 w-8 text-rose-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Sahayata</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Public Links */}
            {publicLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-rose-600 px-3 py-2 rounded-md"
              >
                {link.label}
              </Link>
            ))}

            {/* Protected Links - Only shown when authenticated */}
            {user && (
              <>
                <div className="h-6 w-px bg-gray-200 mx-2" />
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-rose-600 px-3 py-2 rounded-md flex items-center"
                >
                  <User className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>

                {/* Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="text-gray-700 hover:text-rose-600 px-3 py-2 rounded-md flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Menu
                    <ChevronDown className={`h-4 w-4 ml-1 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1" role="menu">
                        {menuItems.map(item => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <item.icon className="h-4 w-4 mr-2" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <NotificationDropdown />

                {/* Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="text-gray-700 hover:text-rose-600 px-3 py-2 rounded-md flex items-center"
                  >
                    <UserCircle className="h-4 w-4 mr-1" />
                    Profile
                    <ChevronDown className={`h-4 w-4 ml-1 transform transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1" role="menu">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            handleSignOut();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Auth Button */}
            {!user && (
              <Link
                to="/auth"
                className="ml-4 bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-rose-600 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute w-full bg-white z-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Public Links */}
            {publicLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-rose-600 block px-3 py-2 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Protected Links - Only shown when authenticated */}
            {user && (
              <>
                <div className="border-t border-gray-200 my-2" />
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-rose-600 block px-3 py-2 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </div>
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-rose-600 block px-3 py-2 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Profile Settings
                  </div>
                </Link>
                {menuItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-gray-700 hover:text-rose-600 block px-3 py-2 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </div>
                  </Link>
                ))}
              </>
            )}

            {/* Auth Button */}
            <div className="border-t border-gray-200 my-2" />
            {user ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="w-full text-left text-gray-700 hover:text-rose-600 block px-3 py-2 rounded-md"
              >
                <div className="flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </div>
              </button>
            ) : (
              <Link
                to="/auth"
                className="block bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 text-center"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;