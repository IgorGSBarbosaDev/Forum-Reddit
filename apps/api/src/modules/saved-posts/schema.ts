import { postIdParamsSchema } from "../../schemas/common/id.schema";
import { paginationQuerySchema } from "../../schemas/common/pagination.schema";

export const savedPostParamsSchema = postIdParamsSchema;
export const listSavedPostsQuerySchema = paginationQuerySchema;
