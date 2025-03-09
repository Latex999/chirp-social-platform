'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { HeartIcon, ChatBubbleLeftIcon, ArrowPathRoundedSquareIcon, ShareIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Post, useLikePostMutation, useUnlikePostMutation } from '@/store/slices/postsSlice';
import { useAuth } from '@/context/AuthContext';
import PostMedia from './PostMedia';
import PostActions from './PostActions';

interface PostItemProps {
  post: Post;
  showActions?: boolean;
  isDetail?: boolean;
}

export default function PostItem({ post, showActions = true, isDetail = false }: PostItemProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(user ? post.likes.includes(user._id) : false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  
  const handleLikeToggle = async () => {
    if (!user) return;
    
    try {
      if (isLiked) {
        await unlikePost(post._id).unwrap();
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await likePost(post._id).unwrap();
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };
  
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  
  return (
    <article className={`chirp-card hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${isDetail ? 'border-0 shadow-none' : 'border-b'}`}>
      {post.isRepost && post.originalPost && (
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <ArrowPathRoundedSquareIcon className="h-4 w-4 mr-2" />
          <span>{post.author.name} reposted</span>
        </div>
      )}
      
      <div className="flex">
        {/* Author Avatar */}
        <div className="mr-3 flex-shrink-0">
          <Link href={`/profile/${post.author._id}`}>
            <Image
              src={post.author.avatar || 'https://via.placeholder.com/40'}
              alt={post.author.name}
              width={48}
              height={48}
              className="chirp-avatar"
            />
          </Link>
        </div>
        
        {/* Post Content */}
        <div className="flex-1 min-w-0">
          {/* Author Info */}
          <div className="flex items-center mb-1">
            <Link href={`/profile/${post.author._id}`} className="font-semibold text-gray-900 dark:text-white hover:underline mr-2">
              {post.author.name}
            </Link>
            
            {post.author.isVerified && (
              <span className="text-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            
            <Link href={`/profile/${post.author._id}`} className="text-gray-500 dark:text-gray-400 hover:underline ml-2">
              @{post.author.username}
            </Link>
            
            <span className="mx-2 text-gray-500 dark:text-gray-400">·</span>
            
            <Link href={`/post/${post._id}`} className="text-gray-500 dark:text-gray-400 hover:underline">
              {formattedDate}
            </Link>
          </div>
          
          {/* Post Text */}
          <div className="mb-3 text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
            {post.content}
          </div>
          
          {/* Post Media */}
          {post.media && post.media.length > 0 && (
            <div className="mb-3">
              <PostMedia media={post.media} />
            </div>
          )}
          
          {/* Post Actions */}
          {showActions && (
            <div className="flex justify-between text-gray-500 dark:text-gray-400 pt-2">
              {/* Comment Button */}
              <Link href={`/post/${post._id}`} className="flex items-center hover:text-primary-500 transition-colors">
                <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                <span>{post.commentsCount}</span>
              </Link>
              
              {/* Repost Button */}
              <button className="flex items-center hover:text-green-500 transition-colors">
                <ArrowPathRoundedSquareIcon className="h-5 w-5 mr-1" />
                <span>{post.repostsCount}</span>
              </button>
              
              {/* Like Button */}
              <button 
                onClick={handleLikeToggle}
                className={`flex items-center transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
              >
                {isLiked ? (
                  <HeartIconSolid className="h-5 w-5 mr-1" />
                ) : (
                  <HeartIcon className="h-5 w-5 mr-1" />
                )}
                <span>{likesCount}</span>
              </button>
              
              {/* Share Button */}
              <button className="flex items-center hover:text-primary-500 transition-colors">
                <ShareIcon className="h-5 w-5" />
              </button>
              
              {/* More Options */}
              <button className="flex items-center hover:text-primary-500 transition-colors">
                <EllipsisHorizontalIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}