import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

import { v4 as uuidV4 } from "uuid";

let connection: Connection;
let token: string;

describe("Get balance controller", () => {
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

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit test 1"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 30,
        description: "Withdraw test 1"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get balance", async () => {

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.balance).toBe(70);
    expect(response.body.statement.length).toBe(2);
  });

  it("Should not be able to get balance with invalid token", async () => {

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer invalid_token`,
      });

    expect(response.status).toBe(401);
  });
});
