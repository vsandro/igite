import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";

import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

let user_id: string;
let user_id2: string;

describe("Get statement", () => {
  beforeEach(async () => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );

    // Users
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "test@test.com",
      password: "1234"
    });
    user_id = user.id;

    const user2 = await createUserUseCase.execute({
      name: "User Test 2",
      email: "test2@test.com",
      password: "12345"
    });
    user_id2 = user2.id;

    // Statements
    await createStatementUseCase.execute({
      user_id,
      type: "deposit" as any,
      amount: 100,
      description: "Deposit test 1"
    });

    await createStatementUseCase.execute({
      user_id,
      type: "deposit" as any,
      amount: 50,
      description: "Deposit test 2"
    });

    await createStatementUseCase.execute({
      user_id,
      type: "withdraw" as any,
      amount: 30,
      description: "Withdraw test"
    });

    await createStatementUseCase.execute({
      user_id: user_id2,
      type: "deposit" as any,
      amount: 30,
      description: "Deposit test user 2"
    });

    await createStatementUseCase.execute({
      user_id: user_id2,
      type: "deposit" as any,
      amount: 50,
      description: "Deposit test user 2"
    });
  });

  it("Should be able to get a balance", async () => {

    const balance = await getBalanceUseCase.execute({
      user_id
    });

    expect(balance).toHaveProperty("balance");
    expect(balance.balance).toBe(120);
    expect(balance.statement.length).toBe(3);
  });

  it("Should not be able to get a balance with invalid user", async () => {
    expect(async () => {

      await getBalanceUseCase.execute({
        user_id: "invalid_user"
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
