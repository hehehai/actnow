export interface FeedItem {
  post: {
    id: string;
    prompt?: string | null;
    comment: string | null;
    media: string[] | null;
    likes: number;
    visits: number;
    createdAt: Date;
  };
  tags: Array<{
    id: string;
    name: string;
    type: string;
    value: string;
  }>;
  author: {
    id: string | null;
    name: string | null;
    image: string | null;
  } | null;
  liked: boolean;
}
