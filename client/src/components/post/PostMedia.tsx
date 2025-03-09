'use client';

import { useState } from 'react';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface PostMediaProps {
  media: string[];
}

export default function PostMedia({ media }: PostMediaProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg)$/i);
  };
  
  const getMediaLayout = () => {
    switch (media.length) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-2';
      default:
        return 'grid-cols-2';
    }
  };
  
  const renderMedia = (url: string, index: number) => {
    if (isVideo(url)) {
      return (
        <div 
          key={index}
          className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video"
        >
          <video 
            src={url} 
            controls 
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else {
      return (
        <div 
          key={index}
          className={`relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 ${
            media.length === 3 && index === 0 ? 'row-span-2' : ''
          } ${
            media.length === 1 ? 'aspect-auto max-h-[500px]' : 'aspect-square'
          }`}
          onClick={() => setSelectedImage(url)}
        >
          <Image
            src={url}
            alt="Post media"
            fill
            className="object-cover cursor-pointer hover:opacity-95 transition-opacity"
          />
          {media.length > 4 && index === 3 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">+{media.length - 4}</span>
            </div>
          )}
        </div>
      );
    }
  };
  
  return (
    <>
      <div className={`grid ${getMediaLayout()} gap-2 rounded-xl overflow-hidden`}>
        {media.slice(0, 4).map((url, index) => renderMedia(url, index))}
      </div>
      
      {/* Lightbox for images */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedImage}
              alt="Post media"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}