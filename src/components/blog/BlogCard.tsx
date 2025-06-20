import React from 'react';
import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { BlogPostListItem } from '@/types/blog';

interface BlogCardProps {
  post: BlogPostListItem;
  formatDate?: (date: string) => string;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, formatDate }) => {
  // Default format date function if not provided
  const formatDateFn = formatDate || ((dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  });

  return (
    <article 
      className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
    >
      <Link to={`/blog/${post.slug}`} className="block overflow-hidden aspect-video relative">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            // Fallback for missing images
            const target = e.target as HTMLImageElement;
            target.src = '/images/blog/placeholder.jpg';
          }}
        />
      </Link>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex gap-2 flex-wrap mb-3">
          {post.tags.slice(0, 2).map(tag => (
            <span 
              key={tag} 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300"
            >
              <Tag size={12} className="mr-1" />
              {tag}
            </span>
          ))}
          {post.tags.length > 2 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
              +{post.tags.length - 2}
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold mb-2 line-clamp-2 text-neutral-900 dark:text-white">
          <Link to={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-4 flex-1">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm text-neutral-500 dark:text-neutral-500">
            {formatDateFn(post.publishDate)}
          </span>
          <Link 
            to={`/blog/${post.slug}`} 
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium inline-flex items-center"
          >
            Read more
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard; 