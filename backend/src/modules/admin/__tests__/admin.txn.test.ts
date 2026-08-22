import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import adminRoutes from "../routes";
import { Business } from "../../../models/Business";
import { CommunityMember } from "../../../models/CommunityMember";

const app = express();
app.use(express.json());

// Mock auth middleware for admin
jest.mock("../../../middleware/auth", () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.admin = { id: "admin123", email: "admin@boc.com", role: "admin" };
    next();
  },
}));

jest.mock("../../../utils/email", () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendApprovalEmail: jest.fn().mockResolvedValue(true),
  sendRejectionEmail: jest.fn().mockResolvedValue(true),
}));

app.use("/api/admin", adminRoutes);

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

afterEach(async () => {
  await Business.deleteMany({});
  await CommunityMember.deleteMany({});
  jest.restoreAllMocks();
});

describe("Admin Routes - Transactions", () => {
  it("should rollback business approval if community member creation fails", async () => {
    const business = await Business.create({
      name: "Test Biz",
      email: "txn@test.com",
      company: "Txn Co",
      role: "CEO",
      stage: "Idea",
      phone: "1234567890",
      status: "pending"
    });

    // Mock CommunityMember.create to throw an error
    jest.spyOn(CommunityMember, "create").mockImplementationOnce(() => {
      throw new Error("Simulated DB Error");
    });

    const res = await request(app).patch(`/api/admin/approve/business/${business._id}`);

    expect(res.status).toBe(500);

    // Verify rollback
    const updatedBusiness = await Business.findById(business._id);
    expect(updatedBusiness?.status).toBe("pending"); // Should NOT be approved
    
    const membersCount = await CommunityMember.countDocuments();
    expect(membersCount).toBe(0);
  });
});
