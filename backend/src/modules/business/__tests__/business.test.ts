import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../server";
import { Business } from "../../../models/Business";
import { CommunityMember } from "../../../models/CommunityMember";
import { Admin } from "../../../models/Admin";
import { hashPassword } from "../../../utils/password";
import { generateAccessToken } from "../../../utils/jwt";

jest.mock("../../../utils/email", () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendApprovalEmail: jest.fn().mockResolvedValue(true),
}));

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
  await Business.deleteMany({});
  await CommunityMember.deleteMany({});
  await Admin.deleteMany({});
});

describe("Business Module API", () => {
  describe("POST /api/business/apply", () => {
    it("should successfully submit a business application", async () => {
      const payload = {
        name: "Test User",
        company: "Test Co",
        role: "CEO",
        stage: "Startup",
        email: "test@testco.com",
        phone: "1234567890",
      };

      const res = await request(app).post("/api/business/apply").send(payload);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Application submitted successfully");
      
      const saved = await Business.findOne({ email: "test@testco.com" });
      expect(saved).toBeTruthy();
      expect(saved?.status).toBe("pending");
    });
  });
});
