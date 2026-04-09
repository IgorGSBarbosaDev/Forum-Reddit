import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

import type { UpdatePostInput } from "@forum-reddit/shared-types";

import { useAuthSession } from "../../auth-context/auth-context";
import { ErrorState, LoadingState } from "../../../shared/ui/view-states";
import { usePostDetail } from "../hooks/use-post-detail";
import { useUpdatePostMutation } from "../hooks/use-post-mutations";
import { applyPostFieldErrors, toPostMutationMessage } from "../lib/post-mutation-errors";
import {
  POST_CONTENT_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  postFormSchema,
  toCreatePostInput,
  type PostFormValues,
} from "../lib/post-form-schema";

export function EditPostPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { hasActiveSession, isAuthenticated, isSessionLoading, sessionError } = useAuthSession();

  const postId = params.postId;
  const detailQuery = usePostDetail(postId);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const updateMutation = useUpdatePostMutation(postId ?? "");

  useEffect(() => {
    if (!detailQuery.data) {
      return;
    }

    form.reset({
      title: detailQuery.data.title,
      content: detailQuery.data.content ?? "",
    });
  }, [detailQuery.data, form]);

  if (!postId) {
    return <ErrorState title="Post invalido" description="O identificador do post nao foi informado." />;
  }

  if (!isAuthenticated) {
    return (
      <ErrorState
        title="Sessao de autenticacao necessaria"
        description="Informe um x-user-id valido no topo para editar posts."
      />
    );
  }

  if (isSessionLoading) {
    return <LoadingState title="Validando sessao" description="Checando se o usuario informado pode editar posts." />;
  }

  if (!hasActiveSession) {
    return (
      <ErrorState
        title="Sessao invalida"
        description={sessionError ?? "O usuario informado nao existe ou nao esta ativo."}
      />
    );
  }

  if (detailQuery.isLoading) {
    return <LoadingState title="Carregando post para edicao" />;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <ErrorState
        title="Falha ao carregar post"
        description={detailQuery.error?.message ?? "Post nao encontrado para edicao."}
        action={
          <button type="button" className="button button--primary" onClick={() => detailQuery.refetch()}>
            Tentar novamente
          </button>
        }
      />
    );
  }

  async function onSubmit(values: PostFormValues) {
    setSubmitError(null);

    const currentPost = detailQuery.data;
    if (!currentPost) {
      setSubmitError("Post indisponivel para edicao no momento.");
      return;
    }

    const normalizedInput = toCreatePostInput(values);
    const currentContent = currentPost.content ?? null;

    const updateInput: UpdatePostInput = {};
    if (normalizedInput.title !== currentPost.title) {
      updateInput.title = normalizedInput.title;
    }

    if (normalizedInput.content !== currentContent) {
      updateInput.content = normalizedInput.content;
    }

    if (!updateInput.title && updateInput.content === undefined) {
      setSubmitError("Nenhuma alteracao detectada para salvar.");
      return;
    }

    try {
      await updateMutation.mutateAsync(updateInput);
      navigate(`/posts/${postId}`);
    } catch (error) {
      const hasFieldErrors = applyPostFieldErrors(error, form.setError);
      if (!hasFieldErrors) {
        setSubmitError(toPostMutationMessage(error, "Nao foi possivel salvar as alteracoes."));
      }
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">Editar post</h1>
        <p className="page-subtitle">Revise o conteudo e salve as alteracoes do post.</p>
      </header>

      <div className="panel">
        <form className="stack-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <label className="control">
            <span>Titulo</span>
            <input className="top-bar__input" maxLength={POST_TITLE_MAX_LENGTH} {...form.register("title")} />
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
            <button type="submit" className="button button--primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Salvando..." : "Salvar alteracoes"}
            </button>

            <Link to={`/posts/${postId}`} className="button button--ghost">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
