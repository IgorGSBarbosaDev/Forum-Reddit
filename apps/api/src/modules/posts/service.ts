import type { PrismaClient } from "@prisma/client";

import { ConflictError } from "../../errors/conflict-error";
import { ForbiddenError } from "../../errors/forbidden-error";
import { NotFoundError } from "../../errors/not-found-error";
import { createPaginationMeta } from "../../utils/pagination";
import { NotificationEventsRepository } from "../notifications/repository";
import { mapPostDetail, mapPostListItem } from "./mapper";
import { PostsRepository } from "./repository";
import type {
  CreatePostInput,
  ListPostsQuery,
  PaginatedPostsResponse,
  PostDetailDto,
  UpdatePostInput,
  UpdatePostPinInput,
  UpdatePostStatusInput,
} from "./types";

export class PostsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly postsRepository: PostsRepository,
    private readonly notificationEventsRepository: NotificationEventsRepository,
  ) {}

  async listPosts(query: ListPostsQuery, currentUserId?: string): Promise<PaginatedPostsResponse> {
    const [posts, total] = await Promise.all([
      this.postsRepository.findFeedPosts(query, currentUserId),
      this.postsRepository.countFeedPosts(),
    ]);

    return {
      data: posts.map(mapPostListItem),
      meta: createPaginationMeta(query.page, query.limit, total),
    };
  }

  async getPost(postId: string, currentUserId?: string): Promise<PostDetailDto> {
    const post = await this.postsRepository.findPostById(postId, currentUserId);

    if (!post) {
      throw new NotFoundError("Post not found.", "POST_NOT_FOUND");
    }

    return mapPostDetail(post);
  }

  async createPost(input: CreatePostInput, currentUserId: string) {
    const created = await this.prisma.$transaction(async (tx) => {
      const post = await this.postsRepository.createPost(
        {
          authorId: currentUserId,
          title: input.title,
          content: input.content ?? null,
        },
        tx,
      );

      await this.notificationEventsRepository.createPostPublishedEvent(currentUserId, post.id, tx);
      return post;
    });

    return this.getPost(created.id, currentUserId);
  }

  async updatePost(postId: string, input: UpdatePostInput, currentUserId: string) {
    const post = await this.postsRepository.findPostStateById(postId);

    if (!post) {
      throw new NotFoundError("Post not found.", "POST_NOT_FOUND");
    }

    if (post.deletedAt) {
      throw new ConflictError("Deleted posts cannot be edited.");
    }

    if (post.authorId !== currentUserId) {
      throw new ForbiddenError("Only the author can edit this post.");
    }

    await this.postsRepository.updatePostContent(postId, input);
    return this.getPost(postId, currentUserId);
  }

  async deletePost(postId: string, currentUserId: string) {
    const post = await this.postsRepository.findPostStateById(postId);

    if (!post) {
      throw new NotFoundError("Post not found.", "POST_NOT_FOUND");
    }

    if (post.authorId !== currentUserId) {
      throw new ForbiddenError("Only the author can delete this post.");
    }

    if (!post.deletedAt) {
      await this.postsRepository.markPostDeleted(postId);
    }

    return this.getPost(postId, currentUserId);
  }

  async updateStatus(postId: string, input: UpdatePostStatusInput, currentUserId?: string) {
    const post = await this.postsRepository.findPostStateById(postId);

    if (!post) {
      throw new NotFoundError("Post not found.", "POST_NOT_FOUND");
    }

    await this.postsRepository.updatePostStatus(postId, input.status);
    return this.getPost(postId, currentUserId);
  }

  async updatePinnedState(postId: string, input: UpdatePostPinInput, currentUserId?: string) {
    const post = await this.postsRepository.findPostStateById(postId);

    if (!post) {
      throw new NotFoundError("Post not found.", "POST_NOT_FOUND");
    }

    await this.postsRepository.updatePinnedState(postId, input.isPinned);
    return this.getPost(postId, currentUserId);
  }
}
