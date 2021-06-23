import { Statement } from "../../entities/Statement";

export type ICreateStatementDTO =
  Pick<
    Statement,
    'user_id' |
    'description' |
    'amount' |
    'type' |
    'user_destination_id' |
    'sender_id'
  >
