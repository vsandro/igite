import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
let token: string;

describe("Create statement controller", () => {
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

    const tokenResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "test@test.com",
        password: "1234"
      });

    token = tokenResponse.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a deposit statement", async () => {

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit test 1"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.description).toBe("Deposit test 1");
    expect(response.body.amount).toBe(100);
    expect(response.body.type).toBe("deposit");
  });

  it("Should be able to create a withdraw statement", async () => {

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 30,
        description: "Withdraw test 1"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.description).toBe("Withdraw test 1");
    expect(response.body.amount).toBe(30);
    expect(response.body.type).toBe("withdraw");
  });

  it("Should not be able to create a withdraw statement with insuficient funds", async () => {

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 200,
        description: "Withdraw test 2"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });

  it("Should not be able to create a statement with invalid token", async () => {

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 50,
        description: "Deposit test 2"
      })
      .set({
        Authorization: `Bearer invalid_token`,
      });

    expect(response.status).toBe(401);
  });
});
