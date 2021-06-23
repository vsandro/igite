import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";

import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

let user_id: string;

describe("Get statement", () => {
  beforeEach(async () => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "test@test.com",
      password: "1234"
    });

    user_id = user.id;
  });

  it("Should be able to get a statement", async () => {
    const newStatement = await createStatementUseCase.execute({
      user_id,
      type: "deposit" as any,
      amount: 100,
      description: "Deposit test"
    });

    const statement = await getStatementOperationUseCase.execute({
      user_id,
      statement_id: newStatement.id
    });

    expect(statement).toHaveProperty("id");
    expect(statement.amount).toBe(100);
    expect(statement.type).toBe("deposit");
  });

  it("Should not be able to get a statement with invalid user", async () => {
    expect(async () => {
      const newStatement = await createStatementUseCase.execute({
        user_id,
        type: "deposit" as any,
        amount: 100,
        description: "Deposit test"
      });

      await getStatementOperationUseCase.execute({
        user_id: "invalid_user",
        statement_id: newStatement.id
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to get a statement with invalid statement", async () => {
    expect(async () => {
      const newStatement = await createStatementUseCase.execute({
        user_id,
        type: "deposit" as any,
        amount: 100,
        description: "Deposit test"
      });

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id: "invalid_statement"
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

});
