
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  publishDate: string;
  lastUpdated?: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
}

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  author: string;
  publishDate: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
}
