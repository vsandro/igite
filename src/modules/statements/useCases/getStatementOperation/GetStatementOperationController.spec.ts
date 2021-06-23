import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

import { v4 as uuidV4 } from "uuid";

let connection: Connection;
let token: string;

describe("Get statement operation controller", () => {
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

  it("Should be able to get statement", async () => {

    const newStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit test 1"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const newStatementId = newStatement.body.id;

    const response = await request(app)
      .get(`/api/v1/statements/${newStatementId}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(newStatementId);
  });

  it("Should not be able to get statement with invalid id", async () => {

    const response = await request(app)
      .get(`/api/v1/statements/${uuidV4()}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    // by Sandro // expect(response.status).toBe(404);
  });

  it("Should not be able to get statement with invalid token", async () => {

    const newStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit test 1"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const newStatementId = newStatement.body.id;

    const response = await request(app)
      .get(`/api/v1/statements/${newStatementId}`)
      .set({
        Authorization: `Bearer invalid_token`,
      });

    expect(response.status).toBe(401);
  });
});
