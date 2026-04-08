export type CommentAuthorDto = {
  id: string;
  username: string;
  displayName: string;
} | null;

export type CommentNodeDto = {
  id: string;
  postId: string;
  parentId: string | null;
  depth: number;
  content: string;
  author: CommentAuthorDto;
  wasEdited: boolean;
  editCount: number;
  lastEditedAt: Date | null;
  deletedAt: Date | null;
  likesCount: number;
  likedByMe: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies: CommentNodeDto[];
};

export type CreateCommentInput = {
  content: string;
};

export type UpdateCommentInput = {
  content: string;
};
