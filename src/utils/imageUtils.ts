/**
 * Base64 encoded placeholder image for blog posts
 * This is a simple gray gradient that works as a fallback when images fail to load
 */
/**
 * Utility function to check if an image URL exists
 * @param url URL of the image to check
 * @param fallbackUrl Fallback URL to use if the image doesn't exist
 * @returns A promise that resolves to the original URL if it exists, or the fallback URL if it doesn't
 */
export const checkImageUrl = (url: string, fallbackUrl: string = '/images/blog/placeholder.jpg'): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(fallbackUrl);
    img.src = url;
  });
};

/**
 * Utility function to generate a proper image path
 * @param path Relative path to the image
 * @returns Absolute path to the image
 */
export const getImagePath = (path: string): string => {
  // If the path is already an absolute URL, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If the path doesn't exist or has issues, return a default placeholder
  if (!path || path === '') {
    return '/images/blog/placeholder.jpg';
  }
  
  // If the path is a relative URL, make sure it starts with a slash
  return path.startsWith('/') ? path : `/${path}`;
}; 