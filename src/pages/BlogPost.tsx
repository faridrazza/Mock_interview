import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/home/Footer';
import { BlogPost as BlogPostType } from '@/types/blog';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getImagePath } from '@/utils/imageUtils';
import { supabase } from '@/integrations/supabase/client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        const { data: postData, error: postError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (postError) {
          console.error('Error fetching post:', postError);
          toast.error("Failed to load blog post");
          throw postError;
        }
        
        if (!postData) {
          setIsLoading(false);
          return;
        }

        const transformedPost: BlogPostType = {
          id: postData.id,
          title: postData.title,
          slug: postData.slug,
          author: postData.author,
          publishDate: postData.publish_date,
          lastUpdated: postData.last_updated,
          excerpt: postData.excerpt,
          content: postData.content || 'No content available',
          coverImage: postData.cover_image,
          tags: postData.tags || [],
          metaTitle: postData.meta_title,
          metaDescription: postData.meta_description,
          isPublished: postData.status === 'published'
        };

        setPost(transformedPost);

        const { data: relatedData, error: relatedError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .contains('tags', postData.tags)
          .neq('id', postData.id)
          .limit(3);

        if (relatedError) {
          console.error('Error fetching related posts:', relatedError);
          throw relatedError;
        }

        const transformedRelated: BlogPostType[] = (relatedData || []).map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          author: post.author,
          publishDate: post.publish_date,
          excerpt: post.excerpt,
          content: post.content || 'No content available',
          coverImage: post.cover_image,
          tags: post.tags || [],
          isPublished: post.status === 'published'
        }));

        setRelatedPosts(transformedRelated);
      } catch (error) {
        console.error('Error in fetchPost:', error);
        toast.error('Failed to load blog post details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (!isLoading && !post) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-indigo-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-indigo-950/30">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-24 md:pt-32">
          <div className="text-center px-4">
            <h1 className="text-4xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">Post Not Found</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              to="/blog" 
              className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-indigo-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-indigo-950/30 transition-colors duration-500">
      {post && (
        <Helmet>
          <title>{post.metaTitle || `${post.title} | Mockinterview4u Blog`}</title>
          <meta 
            name="description" 
            content={post.metaDescription || post.excerpt} 
          />
          <meta 
            name="keywords" 
            content={post.tags.join(', ') + ', job interview, career advice'} 
          />
          <link rel="canonical" href={`https://mockinterview4u.com/blog/${post.slug}`} />
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={post.excerpt} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={`https://mockinterview4u.com/blog/${post.slug}`} />
          <meta property="og:image" content={post.coverImage} />
          <meta property="article:published_time" content={post.publishDate} />
          <meta property="article:tag" content={post.tags.join(', ')} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={post.title} />
          <meta name="twitter:description" content={post.excerpt} />
          <meta name="twitter:image" content={post.coverImage} />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "image": post.coverImage,
              "datePublished": post.publishDate,
              "dateModified": post.lastUpdated || post.publishDate,
              "author": {
                "@type": "Organization",
                "name": post.author
              },
              "publisher": {
                "@type": "Organization",
                "name": "Mockinterview4u",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://mockinterview4u.com/logo.png"
                }
              },
              "description": post.excerpt
            })}
          </script>
        </Helmet>
      )}
      
      <Navbar />
      
      <main className="flex-grow pt-24 md:pt-32">
        {isLoading ? (
          <div className="container px-4 md:px-6 py-12 flex justify-center">
            <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
          </div>
        ) : post && (
          <>
            <article className="container px-4 md:px-6 py-4">
              <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-lg overflow-hidden">
                <div className="w-full h-auto aspect-[21/9] relative">
                  <img
                    src={getImagePath(post.coverImage)}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/blog/placeholder.jpg';
                    }}
                  />
                  
                  <div className="absolute top-4 left-4">
                    <Link 
                      to="/blog" 
                      className="inline-flex items-center px-3 py-1.5 bg-white/80 backdrop-blur-sm hover:bg-white text-indigo-700 dark:bg-neutral-900/70 dark:text-indigo-300 dark:hover:bg-neutral-900 rounded-full text-sm font-medium transition-colors shadow-sm"
                    >
                      <ArrowLeft size={16} className="mr-1.5" />
                      Back to Blog
                    </Link>
                  </div>
                </div>
                
                <div className="p-6 md:p-10">
                  <header className="mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
                      {post.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-6 text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center">
                        <User size={18} className="mr-2 text-indigo-500" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={18} className="mr-2 text-indigo-500" />
                        <span>{formatDate(post.publishDate)}</span>
                      </div>
                    </div>
                  </header>
                  
                  <div className="prose prose-lg prose-indigo dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h2 {...props} className="text-2xl md:text-3xl font-bold mt-8 mb-4" />,
                        h2: ({node, ...props}) => <h3 {...props} className="text-xl md:text-2xl font-bold mt-6 mb-3" />,
                        h3: ({node, ...props}) => <h4 {...props} className="text-lg md:text-xl font-bold mt-5 mb-2" />,
                        p: ({node, ...props}) => <p {...props} className="my-4 leading-relaxed" />,
                        ul: ({node, ...props}) => <ul {...props} className="my-4 pl-6 list-disc" />,
                        ol: ({node, ...props}) => <ol {...props} className="my-4 pl-6 list-decimal" />,
                        li: ({node, ...props}) => <li {...props} className="my-1" />,
                        a: ({node, ...props}) => <a {...props} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline" />,
                        blockquote: ({node, ...props}) => <blockquote {...props} className="border-l-4 border-indigo-300 dark:border-indigo-700 pl-4 my-4 italic text-neutral-700 dark:text-neutral-300" />,
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <div className="my-6 rounded-lg overflow-hidden">
                              <SyntaxHighlighter
                                style={vscDarkPlus as any}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                                customStyle={{
                                  borderRadius: '0.5rem',
                                  fontSize: '0.9rem',
                                  margin: '0'
                                }}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {post.content}
                    </ReactMarkdown>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800 justify-center">
                    <h3 className="w-full text-center text-neutral-700 dark:text-neutral-300 text-sm mb-2">Tags:</h3>
                    {post.tags.map(tag => (
                      <Link 
                        key={tag} 
                        to={`/blog?tag=${tag}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/60 dark:text-indigo-300 dark:hover:bg-indigo-800/80 transition-colors"
                      >
                        <Tag size={14} className="mr-1.5" />
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </article>
            
            {relatedPosts.length > 0 && (
              <section className="container px-4 md:px-6 py-12">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold mb-8 text-neutral-900 dark:text-white text-center">Related Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {relatedPosts.map(relatedPost => (
                      <div 
                        key={relatedPost.id} 
                        className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                      >
                        <Link to={`/blog/${relatedPost.slug}`} className="block overflow-hidden aspect-video relative">
                          <img
                            src={getImagePath(relatedPost.coverImage)}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/blog/placeholder.jpg';
                            }}
                          />
                        </Link>
                        <div className="p-5">
                          <h3 className="font-bold text-lg mb-2 line-clamp-2 text-neutral-900 dark:text-white">
                            <Link to={`/blog/${relatedPost.slug}`}>
                              {relatedPost.title}
                            </Link>
                          </h3>
                          <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2 mb-3">
                            {relatedPost.excerpt}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-neutral-500">
                              {formatDate(relatedPost.publishDate)}
                            </span>
                            <Link 
                              to={`/blog/${relatedPost.slug}`}
                              className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
                            >
                              Read more
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
