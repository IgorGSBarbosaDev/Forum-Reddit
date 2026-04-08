import type { CreatePostInput } from "@forum-reddit/shared-types";
import { z } from "zod";

export const POST_TITLE_MAX_LENGTH = 160;
export const POST_CONTENT_MAX_LENGTH = 10_000;

export const postFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Titulo obrigatorio.")
    .max(POST_TITLE_MAX_LENGTH, `Titulo deve ter ate ${POST_TITLE_MAX_LENGTH} caracteres.`),
  content: z
    .string()
    .max(POST_CONTENT_MAX_LENGTH, `Conteudo deve ter ate ${POST_CONTENT_MAX_LENGTH} caracteres.`),
});

export type PostFormValues = z.infer<typeof postFormSchema>;

export function toCreatePostInput(values: PostFormValues): CreatePostInput {
  const normalizedContent = values.content.trim();

  return {
    title: values.title.trim(),
    content: normalizedContent.length > 0 ? normalizedContent : null,
  };
}