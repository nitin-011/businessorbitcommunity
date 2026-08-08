import { Request, Response } from "express";
import { Student } from "../../models/Student";
import { Business } from "../../models/Business";
import { sendBulkEmail, sendApprovalEmail } from "../../utils/email";
import { CommunityMember } from "../../models/CommunityMember";
import { OrbitCardOrder } from "../../models/OrbitCardOrder";
import { Parser } from "json2csv";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalStudents = await Student.countDocuments();
    const pendingStudents = await Student.countDocuments({ status: "pending" });
    const approvedStudents = await Student.countDocuments({
      status: "approved",
    });
    const rejectedStudents = await Student.countDocuments({
      status: "rejected",
    });

    const totalBusiness = await Business.countDocuments();
    const pendingBusiness = await Business.countDocuments({
      status: "pending",
    });
    const approvedBusiness = await Business.countDocuments({
      status: "approved",
    });
    const rejectedBusiness = await Business.countDocuments({
      status: "rejected",
    });

    res.json({
      students: {
        total: totalStudents,
        pending: pendingStudents,
        approved: approvedStudents,
        rejected: rejectedStudents,
      },
      business: {
        total: totalBusiness,
        pending: pendingBusiness,
        approved: approvedBusiness,
        rejected: rejectedBusiness,
      },
      totalMembers: approvedStudents + approvedBusiness,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBusiness = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    const businesses = await Business.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Business.countDocuments(query);

    res.json({
      businesses: businesses.map((b) => ({
        id: b._id.toString(),
        name: b.name,
        email: b.email,
        company: b.company,
        role: b.role,
        stage: b.stage,
        status: b.status,
        createdAt: b.createdAt,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get business error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const approve = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params;

    if (type === "student") {
      const student = await Student.findById(id);
      if (!student) {
        res.status(404).json({ message: "Student not found" });
        return;
      }

      student.status = "approved";
      await student.save();

      // Create community member
      const rawPassword = crypto.randomBytes(6).toString("hex");
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      await CommunityMember.create({
        name: student.name,
        email: student.email,
        role: `${student.course} at ${student.college}`,
        password: hashedPassword,
        status: "active",
      });

      // Send email (rawPassword should be included, for now handled by logging)
      console.log(
        `Created student community member. Email: ${student.email}, Password: ${rawPassword}`,
      );
      await sendApprovalEmail(student.email, student.name, "student");

      res.json({ message: "Student approved successfully" });
    } else if (type === "business") {
      const business = await Business.findById(id);
      if (!business) {
        res.status(404).json({ message: "Business not found" });
        return;
      }

      business.status = "approved";
      await business.save();

      // Create community member
      const rawPassword = crypto.randomBytes(6).toString("hex");
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      await CommunityMember.create({
        name: business.name,
        email: business.email,
        role: `${business.role} at ${business.company}`,
        password: hashedPassword,
        status: "active",
      });

      console.log(
        `Created business community member. Email: ${business.email}, Password: ${rawPassword}`,
      );
      await sendApprovalEmail(business.email, business.name, "business");

      res.json({ message: "Business approved successfully" });
    } else {
      res.status(400).json({ message: "Invalid type" });
    }
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const reject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params;

    if (type === "student") {
      const student = await Student.findById(id);
      if (!student) {
        res.status(404).json({ message: "Student not found" });
        return;
      }

      student.status = "rejected";
      await student.save();

      res.json({ message: "Student rejected" });
    } else if (type === "business") {
      const business = await Business.findById(id);
      if (!business) {
        res.status(404).json({ message: "Business not found" });
        return;
      }

      business.status = "rejected";
      await business.save();

      res.json({ message: "Business rejected" });
    } else {
      res.status(400).json({ message: "Invalid type" });
    }
  } catch (error) {
    console.error("Reject error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendBulk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipients, subject, content } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      res.status(400).json({ message: "Recipients array is required" });
      return;
    }

    if (!subject || !content) {
      res.status(400).json({ message: "Subject and content are required" });
      return;
    }

    await sendBulkEmail(recipients, subject, content);

    res.json({ message: `Bulk email sent to ${recipients.length} recipients` });
  } catch (error) {
    console.error("Send bulk email error:", error);
    res.status(500).json({ message: "Failed to send bulk email" });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await OrbitCardOrder.find()
      .populate("memberId", "name email company")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const exportOrders = async (req: Request, res: Response) => {
  try {
    const orders = await OrbitCardOrder.find({ status: "SUCCESS" })
      .populate("memberId", "name email company")
      .lean();

    const data = orders.map((order: any) => ({
      orderId: order._id.toString(),
      transactionId: order.transactionId,
      date: order.createdAt,
      memberName: order.memberId?.name || "",
      memberEmail: order.memberId?.email || "",
      memberCompany: order.memberId?.company || "",
      shippingAddress: order.shippingAddress,
      amount: order.amount / 100,
    }));

    if (data.length === 0) {
      return res
        .status(404)
        .json({ message: "No successful orders found to export" });
    }

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment("orbit-card-orders.csv");
    return res.send(csv);
  } catch (error) {
    console.error("Export orders error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
