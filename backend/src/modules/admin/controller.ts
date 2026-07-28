import { Request, Response } from 'express';
import { Student } from '../../models/Student';
import { Business } from '../../models/Business';
import { sendBulkEmail, sendApprovalEmail } from '../../utils/email';

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalStudents = await Student.countDocuments();
    const pendingStudents = await Student.countDocuments({ status: 'pending' });
    const approvedStudents = await Student.countDocuments({ status: 'approved' });
    const rejectedStudents = await Student.countDocuments({ status: 'rejected' });

    const totalBusiness = await Business.countDocuments();
    const pendingBusiness = await Business.countDocuments({ status: 'pending' });
    const approvedBusiness = await Business.countDocuments({ status: 'approved' });
    const rejectedBusiness = await Business.countDocuments({ status: 'rejected' });

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
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('-otp -otpExpiry');

    const total = await Student.countDocuments(query);

    res.json({
      students: students.map(s => ({
        id: s._id.toString(),
        name: s.name,
        email: s.email,
        college: s.college,
        course: s.course,
        isEmailVerified: s.isEmailVerified,
        idCardLink: s.idCardLink,
        status: s.status,
        createdAt: s.createdAt,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBusiness = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const businesses = await Business.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Business.countDocuments(query);

    res.json({
      businesses: businesses.map(b => ({
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
    console.error('Get business error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const approve = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params;

    if (type === 'student') {
      const student = await Student.findById(id);
      if (!student) {
        res.status(404).json({ message: 'Student not found' });
        return;
      }

      student.status = 'approved';
      await student.save();

      await sendApprovalEmail(student.email, student.name, 'student');

      res.json({ message: 'Student approved successfully' });
    } else if (type === 'business') {
      const business = await Business.findById(id);
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      business.status = 'approved';
      await business.save();

      await sendApprovalEmail(business.email, business.name, 'business');

      res.json({ message: 'Business approved successfully' });
    } else {
      res.status(400).json({ message: 'Invalid type' });
    }
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const reject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params;

    if (type === 'student') {
      const student = await Student.findById(id);
      if (!student) {
        res.status(404).json({ message: 'Student not found' });
        return;
      }

      student.status = 'rejected';
      await student.save();

      res.json({ message: 'Student rejected' });
    } else if (type === 'business') {
      const business = await Business.findById(id);
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      business.status = 'rejected';
      await business.save();

      res.json({ message: 'Business rejected' });
    } else {
      res.status(400).json({ message: 'Invalid type' });
    }
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const sendBulk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipients, subject, content } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      res.status(400).json({ message: 'Recipients array is required' });
      return;
    }

    if (!subject || !content) {
      res.status(400).json({ message: 'Subject and content are required' });
      return;
    }

    await sendBulkEmail(recipients, subject, content);

    res.json({ message: `Bulk email sent to ${recipients.length} recipients` });
  } catch (error) {
    console.error('Send bulk email error:', error);
    res.status(500).json({ message: 'Failed to send bulk email' });
  }
};