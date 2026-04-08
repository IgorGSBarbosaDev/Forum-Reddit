import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { useCreatePostMutation } from "../hooks/use-post-mutations";
import { applyPostFieldErrors, toPostMutationMessage } from "../lib/post-mutation-errors";
import {
  POST_CONTENT_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  postFormSchema,
  toCreatePostInput,
  type PostFormValues,
} from "../lib/post-form-schema";

export function CreatePostPage() {
  const navigate = useNavigate();
  const createPostMutation = useCreatePostMutation();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  async function onSubmit(values: PostFormValues) {
    setSubmitError(null);

    try {
      const createdPost = await createPostMutation.mutateAsync(toCreatePostInput(values));
      navigate(`/posts/${createdPost.id}`);
    } catch (error) {
      const hasFieldErrors = applyPostFieldErrors(error, form.setError);

      if (!hasFieldErrors) {
        setSubmitError(toPostMutationMessage(error, "Nao foi possivel criar o post."));
      }
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">Criar post</h1>
        <p className="page-subtitle">Publique um novo conteudo no feed com validacao alinhada ao backend.</p>
      </header>

      <div className="panel">
        <form className="stack-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <label className="control">
            <span>Titulo</span>
            <input
              className="top-bar__input"
              maxLength={POST_TITLE_MAX_LENGTH}
              placeholder="Escreva um titulo objetivo"
              {...form.register("title")}
            />
            <small className="inline-muted">
              {form.watch("title")?.length ?? 0}/{POST_TITLE_MAX_LENGTH}
            </small>
            {form.formState.errors.title ? (
              <span className="inline-error">{form.formState.errors.title.message}</span>
            ) : null}
          </label>

          <label className="control">
            <span>Conteudo</span>
            <textarea
              className="form-textarea"
              rows={8}
              maxLength={POST_CONTENT_MAX_LENGTH}
              placeholder="Compartilhe o contexto do seu post"
              {...form.register("content")}
            />
            <small className="inline-muted">
              {form.watch("content")?.length ?? 0}/{POST_CONTENT_MAX_LENGTH}
            </small>
            {form.formState.errors.content ? (
              <span className="inline-error">{form.formState.errors.content.message}</span>
            ) : null}
          </label>

          {submitError ? <p className="inline-error">{submitError}</p> : null}

          <div className="inline-actions">
            <button type="submit" className="button button--primary" disabled={createPostMutation.isPending}>
              {createPostMutation.isPending ? "Publicando..." : "Publicar post"}
            </button>
            <Link to="/" className="button button--ghost">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}