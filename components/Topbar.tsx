"use client"

import { Search, Bell, HelpCircle, Menu, User, Settings, LogOut } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import LogoutButton from "./LogoutButton"

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownLogout = () => {
    logout();
    router.push('/auth/login');
    router.refresh();
    setDropdownOpen(false); // Close dropdown after logout
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-2 py-0.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded">
                ⌘
              </kbd>
              <kbd className="px-2 py-0.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded">
                K
              </kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button>
          <div className="relative" ref={dropdownRef}>
            <button 
              className="w-9 h-9 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="text-white text-sm font-semibold">JD</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <a href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User className="w-4 h-4" />
                  Profile
                </a>
                <a href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Settings className="w-4 h-4" />
                  Settings
                </a>
                <button 
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleDropdownLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
