import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Authenticate user", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    await createUserUseCase.execute({
      name: "User Test",
      email: "test@test.com",
      password: "1234"
    })
  });

  it("Should be able to authenticate user", async () => {
    const token = await authenticateUserUseCase.execute({
      email: "test@test.com",
      password: "1234"
    });

    expect(token).toHaveProperty("token");
  });

  it("Should not be able to authenticate user with invalid email", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "invalid_email@test.com",
        password: "1234"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate user with invalid password", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "test@test.com",
        password: "invalid_password"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
