import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api';
import { User } from './authSlice';

export interface Comment {
  _id: string;
  content: string;
  author: User;
  post: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  content: string;
  author: User;
  media?: string[];
  likes: string[];
  comments: Comment[] | string[];
  commentsCount: number;
  likesCount: number;
  repostsCount: number;
  isRepost?: boolean;
  originalPost?: Post;
  hashtags: string[];
  mentions: string[];
  createdAt: string;
  updatedAt: string;
}

interface PostsState {
  feed: Post[];
  userPosts: Record<string, Post[]>;
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

const initialState: PostsState = {
  feed: [],
  userPosts: {},
  currentPost: null,
  isLoading: false,
  error: null,
  hasMore: true,
  page: 1,
};

// Create the posts API endpoints
const postsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query<{ posts: Post[]; hasMore: boolean }, { page: number; limit?: number }>({
      query: ({ page, limit = 10 }) => `/posts/feed?page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result
          ? [
              ...result.posts.map(({ _id }) => ({ type: 'Post' as const, id: _id })),
              { type: 'Post', id: 'FEED' },
            ]
          : [{ type: 'Post', id: 'FEED' }],
    }),
    getPost: builder.query<Post, string>({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    getUserPosts: builder.query<{ posts: Post[]; hasMore: boolean }, { userId: string; page: number; limit?: number }>({
      query: ({ userId, page, limit = 10 }) => `/posts/user/${userId}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { userId }) =>
        result
          ? [
              ...result.posts.map(({ _id }) => ({ type: 'Post' as const, id: _id })),
              { type: 'Post', id: `USER_${userId}` },
            ]
          : [{ type: 'Post', id: `USER_${userId}` }],
    }),
    createPost: builder.mutation<Post, { content: string; media?: File[] }>({
      query: (postData) => {
        const formData = new FormData();
        formData.append('content', postData.content);
        
        if (postData.media) {
          postData.media.forEach((file) => {
            formData.append('media', file);
          });
        }
        
        return {
          url: '/posts',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: [{ type: 'Post', id: 'FEED' }],
    }),
    likePost: builder.mutation<{ success: boolean }, string>({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),
    unlikePost: builder.mutation<{ success: boolean }, string>({
      query: (postId) => ({
        url: `/posts/${postId}/unlike`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),
    repost: builder.mutation<Post, string>({
      query: (postId) => ({
        url: `/posts/${postId}/repost`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Post', id: 'FEED' }],
    }),
    deletePost: builder.mutation<{ success: boolean }, string>({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, postId) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'FEED' },
      ],
    }),
    addComment: builder.mutation<Comment, { postId: string; content: string }>({
      query: ({ postId, content }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }],
    }),
    getComments: builder.query<Comment[], string>({
      query: (postId) => `/posts/${postId}/comments`,
      providesTags: (result, error, postId) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Comment' as const, id: _id })),
              { type: 'Post', id: postId },
            ]
          : [{ type: 'Post', id: postId }],
    }),
  }),
});

export const {
  useGetFeedQuery,
  useGetPostQuery,
  useGetUserPostsQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useRepostMutation,
  useDeletePostMutation,
  useAddCommentMutation,
  useGetCommentsQuery,
} = postsApi;

// Create the posts slice
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setFeed: (state, action: PayloadAction<Post[]>) => {
      state.feed = action.payload;
    },
    addToFeed: (state, action: PayloadAction<Post[]>) => {
      state.feed = [...state.feed, ...action.payload];
    },
    setCurrentPost: (state, action: PayloadAction<Post | null>) => {
      state.currentPost = action.payload;
    },
    setUserPosts: (state, action: PayloadAction<{ userId: string; posts: Post[] }>) => {
      state.userPosts[action.payload.userId] = action.payload.posts;
    },
    addToUserPosts: (state, action: PayloadAction<{ userId: string; posts: Post[] }>) => {
      const { userId, posts } = action.payload;
      state.userPosts[userId] = [...(state.userPosts[userId] || []), ...posts];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    incrementPage: (state) => {
      state.page += 1;
    },
    resetPagination: (state) => {
      state.page = 1;
      state.hasMore = true;
    },
  },
});

export const {
  setFeed,
  addToFeed,
  setCurrentPost,
  setUserPosts,
  addToUserPosts,
  setLoading,
  setError,
  setHasMore,
  setPage,
  incrementPage,
  resetPagination,
} = postsSlice.actions;

export default postsSlice.reducer;