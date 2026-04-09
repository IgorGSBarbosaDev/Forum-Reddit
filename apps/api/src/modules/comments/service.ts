import { MAX_COMMENT_DEPTH } from "../../constants/forum";
import { BusinessRuleError } from "../../errors/business-rule-error";
import { ForbiddenError } from "../../errors/forbidden-error";
import { NotFoundError } from "../../errors/not-found-error";
import { acceptsComments } from "../../utils/content-sanitizer";
import { CurrentUserGuard } from "../users/current-user-guard";
import { buildCommentTree, mapCommentNode } from "./mapper";
import { CommentsRepository } from "./repository";
import type { CreateCommentInput, UpdateCommentInput } from "./types";

export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly currentUserGuard: CurrentUserGuard,
  ) {}

  async createRootComment(postId: string, input: CreateCommentInput, currentUserId: string) {
    await this.currentUserGuard.assertActiveUser(currentUserId);

    await this.assertPostAllowsComments(postId);

    const created = await this.commentsRepository.createComment({
      postId,
      authorId: currentUserId,
      content: input.content,
      depth: 0,
    });

    const comment = await this.commentsRepository.findCommentById(created.id, currentUserId);

    if (!comment) {
      throw new NotFoundError("Comment not found after creation.", "COMMENT_NOT_FOUND");
    }

    return mapCommentNode(comment);
  }

  async createReply(commentId: string, input: CreateCommentInput, currentUserId: string) {
    await this.currentUserGuard.assertActiveUser(currentUserId);

    const parent = await this.commentsRepository.findCommentState(commentId);

    if (!parent) {
      throw new NotFoundError("Comment not found.", "COMMENT_NOT_FOUND");
    }

    await this.assertPostAllowsComments(parent.postId);

    const nextDepth = parent.depth + 1;

    if (nextDepth > MAX_COMMENT_DEPTH) {
      throw new BusinessRuleError(`Comment depth cannot exceed ${MAX_COMMENT_DEPTH}.`, "MAX_COMMENT_DEPTH_EXCEEDED");
    }

    const created = await this.commentsRepository.createComment({
      postId: parent.postId,
      parentId: parent.id,
      authorId: currentUserId,
      content: input.content,
      depth: nextDepth,
    });

    const comment = await this.commentsRepository.findCommentById(created.id, currentUserId);

    if (!comment) {
      throw new NotFoundError("Comment not found after creation.", "COMMENT_NOT_FOUND");
    }

    return mapCommentNode(comment);
  }

  async listComments(postId: string, currentUserId?: string) {
    const post = await this.commentsRepository.findPostState(postId);

    if (!post) {
      throw new NotFoundError("Post not found.", "POST_NOT_FOUND");
    }

    const comments = await this.commentsRepository.findCommentsByPostId(postId, currentUserId);
    return buildCommentTree(comments);
  }

  async updateComment(commentId: string, input: UpdateCommentInput, currentUserId: string) {
    await this.currentUserGuard.assertActiveUser(currentUserId);

    const comment = await this.commentsRepository.findCommentState(commentId);

    if (!comment) {
      throw new NotFoundError("Comment not found.", "COMMENT_NOT_FOUND");
    }

    if (comment.deletedAt) {
      throw new BusinessRuleError("Deleted comments cannot be edited.", "COMMENT_ALREADY_DELETED");
    }

    if (comment.authorId !== currentUserId) {
      throw new ForbiddenError("Only the author can edit this comment.");
    }

    await this.commentsRepository.updateComment(commentId, input.content);

    const updated = await this.commentsRepository.findCommentById(commentId, currentUserId);

    if (!updated) {
      throw new NotFoundError("Comment not found.", "COMMENT_NOT_FOUND");
    }

    return mapCommentNode(updated);
  }

  async deleteComment(commentId: string, currentUserId: string) {
    await this.currentUserGuard.assertActiveUser(currentUserId);

    const comment = await this.commentsRepository.findCommentState(commentId);

    if (!comment) {
      throw new NotFoundError("Comment not found.", "COMMENT_NOT_FOUND");
    }

    if (comment.authorId !== currentUserId) {
      throw new ForbiddenError("Only the author can delete this comment.");
    }

    if (!comment.deletedAt) {
      await this.commentsRepository.markCommentDeleted(commentId);
    }

    const deleted = await this.commentsRepository.findCommentById(commentId, currentUserId);

    if (!deleted) {
      throw new NotFoundError("Comment not found.", "COMMENT_NOT_FOUND");
    }

    return mapCommentNode(deleted);
  }

  private async assertPostAllowsComments(postId: string) {
    const post = await this.commentsRepository.findPostState(postId);

    if (!post) {
      throw new NotFoundError("Post not found.", "POST_NOT_FOUND");
    }

    if (!acceptsComments(post.status, post.deletedAt)) {
      throw new BusinessRuleError("This post does not accept new comments.", "POST_NOT_COMMENTABLE");
    }
  }
}
