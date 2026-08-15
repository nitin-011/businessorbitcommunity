/**
 * @file card.controller.ts
 * @description Controller for Orbit Card purchase flow, handling checkout initiation and payment verification.
 * @architecture Integrates with PhonePe SDK for payment processing and manages OrbitCardOrder state transitions based on webhook/redirect callbacks.
 */
import { Request, Response } from "express";
import { OrbitCardOrder } from "../../models/OrbitCardOrder";
import { config } from "../../config/env";
import { AuthRequest } from "../../middleware/auth";
import {
  StandardCheckoutClient,
  Env,
  StandardCheckoutPayRequest,
} from "@phonepe-pg/pg-sdk-node";

const phonepeEnv =
  config.phonepeEnv === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;

let client: StandardCheckoutClient | null = null;
try {
  client = StandardCheckoutClient.getInstance(
    config.phonepeClientId,
    config.phonepeClientSecret,
    parseInt(config.phonepeClientVersion) || 1,
    phonepeEnv,
  );
} catch (error: any) {
  console.warn(
    "⚠️ PhonePe SDK Initialization Failed. Payments will be unavailable.",
  );
  console.warn("Reason:", error?.message || String(error));
}

/**
 * @desc    Initialize checkout for an Orbit Card and get the payment redirect URL
 * @route   POST /api/community/card/checkout
 * @access  Optional (Community Member)
 */
export const checkoutCard = async (req: AuthRequest, res: Response) => {
  try {
    const memberId = req.member?.id || null;

    const { shippingAddress, fullName, companyAndDesignation, email, phone } =
      req.body;
    if (
      !shippingAddress ||
      !fullName ||
      !companyAndDesignation ||
      !email ||
      !phone
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const transactionId = `T${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const amount = 1179900; // 11799 INR in paise (9999 + 18% GST)

    const order = await OrbitCardOrder.create({
      memberId,
      shippingAddress,
      fullName,
      email,
      phone,
      companyAndDesignation,
      amount,
      transactionId,
      status: "PENDING",
    });

    // Instead of redirecting directly to frontend, we intercept the redirect at our backend to check order status
    const redirectUrl = `${config.apiUrl}/api/community/card/payment-status?orderId=${transactionId}`;

    if (!client) {
      return res.status(503).json({
        success: false,
        message: "Payment provider unavailable",
        error: "PhonePe SDK not initialized properly.",
      });
    }

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(transactionId)
      .amount(amount)
      .redirectUrl(redirectUrl)
      .build();

    const response = await client.pay(request);

    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        paymentUrl: response.redirectUrl,
      },
    });
  } catch (error: any) {
    console.error("Checkout error:", error?.response?.data || error);
    return res.status(500).json({
      success: false,
      message: "Payment initiation failed",
      error: error?.response?.data || error?.message || String(error),
    });
  }
};

/**
 * @desc    Handle payment provider redirect, verify order status, and update the database
 * @route   ALL /api/community/card/payment-status
 * @access  Public
 */
export const paymentRedirect = async (req: Request, res: Response) => {
  try {
    const orderId =
      (req.query.orderId as string) || (req.body.transactionId as string);

    if (!orderId) {
      return res.redirect(
        `${config.frontendUrl}/orbit-card/checkout?payment=error_missing_order_id`,
      );
    }

    if (!client) {
      return res.redirect(
        `${config.frontendUrl}/orbit-card/checkout?payment=error_provider_unavailable`,
      );
    }

    const response = await client.getOrderStatus(orderId);

    if (response.state === "COMPLETED") {
      await OrbitCardOrder.findOneAndUpdate(
        { transactionId: orderId },
        {
          status: "SUCCESS",
          providerReferenceId: (response as any).transactionId || "",
        },
      );
      return res.redirect(
        `${config.frontendUrl}/orbit-card/checkout?payment=success&orderId=${orderId}`,
      );
    } else if (response.state === "PENDING") {
      return res.redirect(
        `${config.frontendUrl}/orbit-card/checkout?payment=pending&orderId=${orderId}`,
      );
    } else {
      // For FAILED, USER_CANCELLED, etc.
      await OrbitCardOrder.findOneAndUpdate(
        { transactionId: orderId },
        { status: "FAILED" },
      );
      return res.redirect(
        `${config.frontendUrl}/orbit-card/checkout?payment=failed&orderId=${orderId}`,
      );
    }
  } catch (error) {
    console.error("Payment Redirect Error:", error);
    return res.redirect(
      `${config.frontendUrl}/orbit-card/checkout?payment=error`,
    );
  }
};

/**
 * @desc    Fetch details of a specific Orbit Card order by transaction ID
 * @route   GET /api/community/card/order/:orderId
 * @access  Public
 */
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    const order = await OrbitCardOrder.findOne({ transactionId: orderId });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Get Order Details Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
