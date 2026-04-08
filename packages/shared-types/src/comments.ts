export type CommentAuthor = {
  id: string;
  username: string | null;
  displayName: string | null;
} | null;

export type CommentNode = {
  id: string;
  postId: string;
  parentId: string | null;
  depth: number;
  content: string;
  author: CommentAuthor;
  wasEdited: boolean;
  editCount: number;
  lastEditedAt: string | null;
  deletedAt: string | null;
  likesCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
  replies: CommentNode[];
};

export type CreateCommentInput = {
  content: string;
};

export type UpdateCommentInput = {
  content: string;
};