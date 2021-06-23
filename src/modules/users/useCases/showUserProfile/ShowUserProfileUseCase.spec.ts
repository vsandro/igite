import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";

import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

let user_id: string;

describe("Show user profile", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);

    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "test@test.com",
      password: "1234"
    });

    user_id = user.id;
  });

  it("Should be able to show user profile", async () => {
    const userProfile = await showUserProfileUseCase.execute(user_id);

    expect(userProfile).toHaveProperty("id");
  });

  it("Should not be able to show not existent user profile", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("invalid_id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
