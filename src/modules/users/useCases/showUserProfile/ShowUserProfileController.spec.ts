import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;
let token: string;

describe("Show user profile controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app)
      .post("/api/v1/users")
      .send({
        name: "User test",
        email: "user_profile@test.com",
        password: "1234"
      });

    const tokenResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user_profile@test.com",
        password: "1234"
      });

    token = tokenResponse.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to show user profile", async () => {

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.email).toBe("user_profile@test.com");
  });

  it("Should not be able to show user profile with invalid token", async () => {

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer invalid_token`,
      });

    expect(response.status).toBe(401);
  });
});
