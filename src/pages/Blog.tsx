import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/home/Footer';
import { BlogPostListItem } from '@/types/blog';
import { Tag } from 'lucide-react';
import BlogCard from '@/components/blog/BlogCard';
import { supabase } from '@/integrations/supabase/client';

const Blog = () => {
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let query = supabase
          .from('blog_posts')
          .select('id, title, slug, author, publish_date, excerpt, cover_image, tags')
          .eq('status', 'published')
          .order('publish_date', { ascending: false });

        if (selectedTag) {
          query = query.contains('tags', [selectedTag]);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform the data to match our frontend types
        const transformedPosts: BlogPostListItem[] = data.map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          author: post.author,
          publishDate: post.publish_date,
          excerpt: post.excerpt,
          coverImage: post.cover_image,
          tags: post.tags || []
        }));

        setPosts(transformedPosts);

        // Extract unique tags from all posts
        const tags = Array.from(
          new Set(data.flatMap(post => post.tags || []))
        ).sort();
        setAllTags(tags);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
    window.scrollTo(0, 0);
  }, [selectedTag]);

  // Filter posts by tag if a tag is selected
  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags.includes(selectedTag))
    : posts;

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-indigo-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-indigo-950/30 transition-colors duration-500">
      {/* SEO Optimization */}
      <Helmet>
        <title>Blog | Interview Tips & Career Advice | Mockinterview4u</title>
        <meta 
          name="description" 
          content="Expert interview tips, career advice, and insights to help you prepare for job interviews and advance your career." 
        />
        <meta name="keywords" content="interview tips, career advice, job interview, interview preparation" />
        <link rel="canonical" href="https://mockinterview4u.com/blog" />
        {/* Open Graph tags */}
        <meta property="og:title" content="Interview Tips & Career Advice | Mockinterview4u Blog" />
        <meta property="og:description" content="Expert interview tips, career advice, and insights to help you prepare for job interviews and advance your career." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mockinterview4u.com/blog" />
        <meta property="og:image" content="https://mockinterview4u.com/images/og-blog.jpg" />
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Interview Tips & Career Advice | Mockinterview4u Blog" />
        <meta name="twitter:description" content="Expert interview tips, career advice, and insights to help you prepare for job interviews and advance your career." />
        <meta name="twitter:image" content="https://mockinterview4u.com/images/og-blog.jpg" />
      </Helmet>
      
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -right-40 w-[60%] h-[50%] bg-gradient-to-b from-indigo-200/20 via-purple-200/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-[60%] h-[50%] bg-gradient-to-t from-pink-200/20 via-indigo-200/10 to-transparent rounded-full blur-3xl" />
      </div>
      
      <Navbar />
      
      <main className="flex-grow pt-24 md:pt-32">
        {/* Blog Header */}
        <section className="container px-4 md:px-6 py-8 md:py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 mb-4">
              Blog & Resources
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg">
              Expert interview tips, career advice, and insights to help you succeed.
            </p>
          </div>
          
          {/* Tags filter */}
          <div className="mt-8 md:mt-10 overflow-x-auto">
            <div className="flex gap-2 py-2 min-w-full flex-nowrap md:flex-wrap md:justify-center">
              <button
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedTag === null
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-200'
                    : 'bg-white/80 text-neutral-600 hover:bg-indigo-50 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:bg-indigo-900/50'
                }`}
                onClick={() => setSelectedTag(null)}
              >
                All Posts
              </button>
              
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedTag === tag
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-200'
                      : 'bg-white/80 text-neutral-600 hover:bg-indigo-50 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:bg-indigo-900/50'
                  }`}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>
        
        {/* Blog Posts Grid */}
        <section className="container px-4 md:px-6 py-8">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <BlogCard 
                  key={post.id} 
                  post={post} 
                  formatDate={formatDate} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                No posts found
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                {selectedTag ? `No posts found with the tag "${selectedTag}".` : 'No posts available yet.'}
              </p>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  View all posts
                </button>
              )}
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
