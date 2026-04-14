import type { Prisma } from "@prisma/client";

function andWhere<TWhere extends Prisma.PostWhereInput | Prisma.CommentWhereInput>(
  baseWhere: TWhere | undefined,
  extraWhere: TWhere,
) {
  if (!baseWhere) {
    return extraWhere;
  }

  return {
    AND: [baseWhere, extraWhere],
  } as TWhere;
}

export function activePostWhere(where?: Prisma.PostWhereInput) {
  return andWhere(where, {
    deletedAt: null,
  });
}

export function activeCommentWhere(where?: Prisma.CommentWhereInput) {
  return andWhere(where, {
    deletedAt: null,
  });
}
