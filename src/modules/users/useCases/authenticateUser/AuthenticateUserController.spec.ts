import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Authenticate user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app)
      .post("/api/v1/users")
      .send({
        name: "User test",
        email: "test@test.com",
        password: "1234"
      });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate user", async () => {

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "test@test.com",
        password: "1234"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("Should not be able to authenticate user with invalid email", async () => {

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "invalid_email@test.com",
        password: "1234"
      });

    expect(response.status).toBe(401);
  });

  it("Should not be able to authenticate user with invalid password", async () => {

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "test@test.com",
        password: "invalid_password"
      });

    expect(response.status).toBe(401);
  });
});
