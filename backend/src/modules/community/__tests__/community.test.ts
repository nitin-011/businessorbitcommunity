import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

jest.mock("@phonepe-pg/pg-sdk-node", () => ({
  Env: { PRODUCTION: "PRODUCTION", SANDBOX: "SANDBOX" },
  StandardCheckoutPayRequest: {
    builder: jest.fn().mockReturnThis(),
    merchantOrderId: jest.fn().mockReturnThis(),
    amount: jest.fn().mockReturnThis(),
    redirectUrl: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  },
  StandardCheckoutClient: {
    getInstance: jest.fn().mockReturnValue({
      pay: jest.fn().mockResolvedValue({ redirectUrl: "https://phonepe.com/pay" }),
      getOrderStatus: jest.fn().mockResolvedValue({
        state: "COMPLETED",
        transactionId: "P12345",
      }),
    }),
  },
}));

import communityRoutes from "../routes";
import { CommunityMember } from "../../../models/CommunityMember";
import { OrbitCardOrder } from "../../../models/OrbitCardOrder";
import axios from "axios";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/community", communityRoutes);

describe("Community Routes", () => {
  beforeAll(async () => {
    // Assuming connectDatabase is handled outside or we mock it.
    // For simplicity, we just mock the Mongoose methods.
    jest.spyOn(CommunityMember, "findById").mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      email: "test@example.com",
      status: "active",
      role: "community",
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch paginated community members", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      {
        id: "507f1f77bcf86cd799439011",
        email: "test@example.com",
        role: "community",
      },
      process.env.JWT_SECRET || "secret",
    );

    const mockMembers = [
      { name: "John Doe", role: "Developer", status: "active" },
      { name: "Jane Smith", role: "Designer", status: "active" },
    ];

    jest.spyOn(CommunityMember, "find").mockImplementation(
      () =>
        ({
          select: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue(mockMembers),
        }) as any,
    );

    jest.spyOn(CommunityMember, "countDocuments").mockResolvedValue(2);

    const res = await request(app)
      .get("/api/community/members?page=1&limit=10")
      .set("Cookie", [`token=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.members.length).toBe(2);
    expect(res.body.data.pagination.total).toBe(2);
  });

  it("should login successfully with valid credentials", async () => {
    const mockMember = {
      _id: new mongoose.Types.ObjectId(),
      email: "test@example.com",
      password: "hashedpassword",
      status: "active",
      name: "Test Member",
      role: "Role",
    };

    jest.spyOn(CommunityMember, "findOne").mockReturnValue({ select: jest.fn().mockResolvedValue(mockMember) } as any);
    // Note: bcrypt.compare would ideally be mocked, but since we are running npx jest,
    // we can mock verifyPassword here.
    const passwordUtils = require("../../../utils/password");
    jest.spyOn(passwordUtils, "verifyPassword").mockResolvedValue(true as any);

    const res = await request(app).post("/api/community/login").send({
      email: "test@example.com",
      password: "rawpassword",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("test@example.com");
  });

  it("should fail login with invalid credentials", async () => {
    jest.spyOn(CommunityMember, "findOne").mockReturnValue({ select: jest.fn().mockResolvedValue(null) } as any);

    const res = await request(app).post("/api/community/login").send({
      email: "wrong@example.com",
      password: "rawpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  describe("Profile Updates", () => {
    it("should fail update profile if unauthenticated", async () => {
      const res = await request(app)
        .put("/api/community/profile")
        .send({ bio: "Test" });
      expect(res.status).toBe(401);
    });

    it("should update profile if authenticated", async () => {
      // Mock auth middleware to pass by generating a valid JWT token
      const jwt = require("jsonwebtoken");
      const token = jwt.sign(
        {
          id: "507f1f77bcf86cd799439011",
          email: "test@example.com",
          role: "community",
        },
        process.env.JWT_SECRET || "secret",
      );

      jest.spyOn(CommunityMember, "findByIdAndUpdate").mockImplementation(
        () =>
          ({
            select: jest.fn().mockResolvedValue({
              _id: "507f1f77bcf86cd799439011",
              email: "test@example.com",
              bio: "Updated bio",
            }),
          }) as any,
      );

      // Using the cookie-parser and auth middleware in the app
      const res = await request(app)
        .put("/api/community/profile")
        .set("Cookie", [`token=${token}`])
        .send({ bio: "Updated bio" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bio).toBe("Updated bio");
    });
  });

  describe("Orbit Card Checkout & Webhook", () => {
    it("should initialize payment if authenticated", async () => {
      const jwt = require("jsonwebtoken");
      const token = jwt.sign(
        {
          id: "507f1f77bcf86cd799439011",
          email: "test@example.com",
          role: "community",
        },
        process.env.JWT_SECRET || "secret",
      );

      jest.spyOn(OrbitCardOrder, "create").mockResolvedValue({
        _id: "12345",
        memberId: "507f1f77bcf86cd799439011",
        shippingAddress: "123 Test St",
        amount: 49900,
        transactionId: "T12345",
        status: "PENDING",
      } as any);

      const res = await request(app)
        .post("/api/community/card/checkout")
        .set("Cookie", [`token=${token}`])
        .send({
          shippingAddress: "123 Test St",
          fullName: "John Doe",
          companyAndDesignation: "CEO at ACME",
          email: "test@example.com",
          phone: "1234567890"
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentUrl).toMatch(/phonepe\.com/);
    });

    it("should handle successful payment redirect", async () => {
      jest
        .spyOn(OrbitCardOrder, "findOneAndUpdate")
        .mockResolvedValue({} as any);

      const res = await request(app)
        .post("/api/community/card/payment-status")
        .send({ transactionId: "T12345" });

      expect(res.status).toBe(302);
      expect(OrbitCardOrder.findOneAndUpdate).toHaveBeenCalledWith(
        { transactionId: "T12345" },
        { status: "SUCCESS", providerReferenceId: "P12345" },
      );
    });
  });
});
