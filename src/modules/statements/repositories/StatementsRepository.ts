import { getRepository, Repository } from "typeorm";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    amount,
    description,
    type,
    sender_id
  }: ICreateStatementDTO): Promise<Statement> {

    const statement = this.repository.create({
      user_id,
      amount,
      description,
      type,
      sender_id
    });

    return this.repository.save(statement);
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    let statement = await this.repository.findOne(statement_id, {
      where: { user_id }
    });

    if (statement.type === 'transfer') {
      statement = {
        ...statement, sender_id: statement.sender_id ? statement.sender_id : statement.user_id
      }
    }

    return statement;
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    > {
    const statements = await this.repository.find({
      where: { user_id }
    });

    const balance = statements.reduce((acc, operation) => {
      if (operation.type === 'deposit' || (operation.type === 'transfer' && operation.sender_id !== null)) {
        return acc + Number(operation.amount);
      } else {
        return acc - Number(operation.amount);
      }
    }, 0)

    const statementResult = statements.map(statement => {

      if (statement.type === 'transfer') {
        return {
          ...statement, sender_id: statement.sender_id ? statement.sender_id : statement.user_id
        }
      }

      return statement;
    });

    if (with_statement) {
      return {
        statement: statementResult,
        balance
      }
    }

    return { balance }
  }
}
