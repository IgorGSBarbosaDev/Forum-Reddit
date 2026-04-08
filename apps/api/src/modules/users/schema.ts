import { userIdParamsSchema } from "../../schemas/common/id.schema";
import { paginationQuerySchema } from "../../schemas/common/pagination.schema";

export const userProfileParamsSchema = userIdParamsSchema;
export const userListQuerySchema = paginationQuerySchema;
