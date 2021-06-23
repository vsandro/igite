import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";

import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";


let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

let user_id: string;

describe("Create statement", () => {
  beforeEach(async () => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
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

  it("Should be able to create a new statement", async () => {
    const statement = await createStatementUseCase.execute({
      user_id,
      type: "deposit" as any,
      amount: 100,
      description: "Deposit test"
    });

    expect(statement).toHaveProperty("id");
  });

  it("Should not be able to create a statement with invalid user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "invalid_user",
        type: "deposit" as any,
        amount: 100,
        description: "Deposit test"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to withdraw more than user have", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id,
        type: "deposit" as any,
        amount: 100,
        description: "Deposit test"
      });

      await createStatementUseCase.execute({
        user_id,
        type: "withdraw" as any,
        amount: 200,
        description: "Withdraw test"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

});
