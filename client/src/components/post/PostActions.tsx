'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrashIcon, 
  PencilIcon, 
  FlagIcon, 
  BookmarkIcon, 
  LinkIcon, 
  EyeSlashIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { useDeletePostMutation } from '@/store/slices/postsSlice';
import { useAuth } from '@/context/AuthContext';
import { useDispatch } from 'react-redux';
import { openModal } from '@/store/slices/uiSlice';
import { toast } from 'react-hot-toast';

interface PostActionsProps {
  postId: string;
  authorId: string;
  onClose: () => void;
}

export default function PostActions({ postId, authorId, onClose }: PostActionsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  
  const isAuthor = user?._id === authorId;
  
  const handleDeletePost = async () => {
    if (!isAuthor) return;
    
    try {
      await deletePost(postId).unwrap();
      toast.success('Post deleted successfully');
      onClose();
      router.push('/home');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };
  
  const handleEditPost = () => {
    dispatch(openModal({ type: 'EDIT_POST', data: { postId } }));
    onClose();
  };
  
  const handleReportPost = () => {
    dispatch(openModal({ type: 'REPORT_POST', data: { postId } }));
    onClose();
  };
  
  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    onClose();
  };
  
  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
    onClose();
  };
  
  const handleMuteUser = () => {
    toast.success(`User muted`);
    onClose();
  };
  
  const handleBlockUser = () => {
    dispatch(openModal({ type: 'BLOCK_USER', data: { userId: authorId } }));
    onClose();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden w-72">
      <div className="py-1">
        {isAuthor ? (
          <>
            {/* Author actions */}
            <button
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="w-full px-4 py-2 text-left flex items-center text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <TrashIcon className="h-5 w-5 mr-3" />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
            
            <button
              onClick={handleEditPost}
              className="w-full px-4 py-2 text-left flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <PencilIcon className="h-5 w-5 mr-3" />
              <span>Edit</span>
            </button>
          </>
        ) : (
          <>
            {/* Non-author actions */}
            <button
              onClick={handleReportPost}
              className="w-full px-4 py-2 text-left flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FlagIcon className="h-5 w-5 mr-3" />
              <span>Report</span>
            </button>
            
            <button
              onClick={handleMuteUser}
              className="w-full px-4 py-2 text-left flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <EyeSlashIcon className="h-5 w-5 mr-3" />
              <span>Mute @username</span>
            </button>
            
            <button
              onClick={handleBlockUser}
              className="w-full px-4 py-2 text-left flex items-center text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <UserMinusIcon className="h-5 w-5 mr-3" />
              <span>Block @username</span>
            </button>
          </>
        )}
        
        {/* Common actions */}
        <button
          onClick={handleBookmarkToggle}
          className="w-full px-4 py-2 text-left flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isBookmarked ? (
            <BookmarkIconSolid className="h-5 w-5 mr-3 text-primary-500" />
          ) : (
            <BookmarkIcon className="h-5 w-5 mr-3" />
          )}
          <span>{isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}</span>
        </button>
        
        <button
          onClick={handleCopyLink}
          className="w-full px-4 py-2 text-left flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <LinkIcon className="h-5 w-5 mr-3" />
          <span>Copy link</span>
        </button>
      </div>
    </div>
  );
}