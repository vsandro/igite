import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";

import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "User test",
      email: "test@test.com",
      password: "1234"
    });

    expect(user).toHaveProperty("id");
  });

  it("Should not be able to create a user with existing email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User test",
        email: "test@test.com",
        password: "1234"
      });

      await createUserUseCase.execute({
        name: "User test",
        email: "test@test.com",
        password: "1234"
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });

});
