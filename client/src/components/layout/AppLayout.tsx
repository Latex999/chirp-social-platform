'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import PostComposer from '../post/PostComposer';
import ModalContainer from '../common/ModalContainer';
import { useAuth } from '@/context/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { sidebarOpen, isComposerOpen, modal } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  const pathname = usePathname();
  
  // Close sidebar on mobile when navigating
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        dispatch(setSidebarOpen(false));
      } else {
        dispatch(setSidebarOpen(true));
      }
    };
    
    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch]);
  
  // Close sidebar on navigation on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false));
    }
  }, [pathname, dispatch]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex">
            {/* Content */}
            <div className="flex-1 min-w-0 border-x border-gray-200 dark:border-gray-800 min-h-screen">
              {children}
            </div>
            
            {/* Right Sidebar */}
            <RightSidebar />
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Post Composer */}
      {isComposerOpen && <PostComposer />}
      
      {/* Modal Container */}
      {modal.isOpen && <ModalContainer />}
    </div>
  );
}