import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
describe("Create category controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new user", async () => {

    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "User test",
        email: "test@test.com",
        password: "1234"
      });

    expect(response.status).toBe(201);
  });

  it("Should not be able to create user with existing email", async () => {

    await request(app)
      .post("/api/v1/users")
      .send({
        name: "User test",
        email: "test@test.com",
        password: "1234"
      });

    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "User test 2",
        email: "test@test.com",
        password: "12345"
      });

    expect(response.status).toBe(400);
  });
});
