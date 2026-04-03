import { z } from "zod";

import { paginationQuerySchema } from "../../schemas/common/pagination.schema";
import { createSortQuerySchema } from "../../schemas/common/sort.schema";

const feedSortQuerySchema = createSortQuerySchema(["createdAt", "updatedAt", "title"]);

export const listPostsQuerySchema = paginationQuerySchema.merge(feedSortQuerySchema);
