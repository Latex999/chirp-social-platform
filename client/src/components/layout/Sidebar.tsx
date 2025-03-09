'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toggleComposer, setSidebarOpen } from '@/store/slices/uiSlice';
import { useAuth } from '@/context/AuthContext';
import { useLogoutMutation } from '@/store/slices/authSlice';
import { 
  HomeIcon, 
  HashtagIcon, 
  BellIcon, 
  EnvelopeIcon, 
  BookmarkIcon, 
  UserIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  HashtagIcon as HashtagIconSolid, 
  BellIcon as BellIconSolid, 
  EnvelopeIcon as EnvelopeIconSolid, 
  BookmarkIcon as BookmarkIconSolid, 
  UserIcon as UserIconSolid, 
  Cog6ToothIcon as Cog6ToothIconSolid
} from '@heroicons/react/24/solid';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  
  const [logoutMutation] = useLogoutMutation();
  
  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
      logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logoutMutation, logout]);
  
  const handleNewPost = useCallback(() => {
    dispatch(toggleComposer());
  }, [dispatch]);
  
  const closeSidebar = useCallback(() => {
    dispatch(setSidebarOpen(false));
  }, [dispatch]);
  
  const navItems = [
    {
      name: 'Home',
      href: '/home',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      name: 'Explore',
      href: '/explore',
      icon: HashtagIcon,
      activeIcon: HashtagIconSolid,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: BellIcon,
      activeIcon: BellIconSolid,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: EnvelopeIcon,
      activeIcon: EnvelopeIconSolid,
    },
    {
      name: 'Bookmarks',
      href: '/bookmarks',
      icon: BookmarkIcon,
      activeIcon: BookmarkIconSolid,
    },
    {
      name: 'Profile',
      href: user ? `/profile/${user._id}` : '/profile',
      icon: UserIcon,
      activeIcon: UserIconSolid,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      activeIcon: Cog6ToothIconSolid,
    },
  ];
  
  const isActive = (href: string) => {
    if (href === '/home' && pathname === '/') {
      return true;
    }
    return pathname.startsWith(href);
  };
  
  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo and close button */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/home" className="text-2xl font-bold text-primary-500">
              Chirp
            </Link>
            <button 
              onClick={closeSidebar}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = active ? item.activeIcon : item.icon;
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-full transition-colors ${
                        active
                          ? 'font-semibold text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-6 w-6 mr-4" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
              
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6 mr-4" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
          
          {/* New Post Button */}
          <button
            onClick={handleNewPost}
            className="mt-6 w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-full transition-colors flex items-center justify-center"
          >
            <PencilSquareIcon className="h-5 w-5 mr-2" />
            <span>New Chirp</span>
          </button>
          
          {/* User Profile */}
          {user && (
            <div className="mt-6 flex items-center p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <Image
                src={user.avatar || 'https://via.placeholder.com/40'}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full mr-3"
              />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}