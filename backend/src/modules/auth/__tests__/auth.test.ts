import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../server";
import { Admin } from "../../../models/Admin";
import { hashPassword } from "../../../utils/password";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Admin.deleteMany({});
});

describe("Auth Module API", () => {
  describe("POST /api/auth/login", () => {
    it("should login an admin successfully", async () => {
      const password = "securepassword";
      const hashedPassword = await hashPassword(password);
      
      await Admin.create({
        name: "Admin User",
        email: "admin@test.com",
        password: hashedPassword,
        role: "super_admin",
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "admin@test.com",
        password: "securepassword"
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Login successful");

      // Check if token cookie is set
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);
    });

    it("should reject invalid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "admin@test.com",
        password: "wrongpassword"
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });
  });
});
