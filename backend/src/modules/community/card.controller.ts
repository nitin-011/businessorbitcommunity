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

/**
 * @constant {Env} phonepeEnv
 * @description The environment configuration for PhonePe SDK
 */
const phonepeEnv =
  config.phonepeEnv === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;

/**
 * @let {StandardCheckoutClient | null} client
 * @description Singleton instance of the PhonePe checkout client. Initialized at module load to prevent runtime overhead per request.
 */
let client: StandardCheckoutClient | null = null;
try {
  // 1. Initialize PhonePe SDK using env configuration
  client = StandardCheckoutClient.getInstance(
    config.phonepeClientId,
    config.phonepeClientSecret,
    parseInt(config.phonepeClientVersion) || 1,
    phonepeEnv,
  );
} catch (error: any) {
  // Gracefully degrade if SDK initialization fails (e.g., missing credentials in dev environment)
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
    // Determine if user is logged in (optional auth pattern)
    const memberId = req.member?.id || null;

    const { shippingAddress, fullName, companyAndDesignation, email, phone } =
      req.body;
      
    // 2. Validate mandatory physical shipping and contact details
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

    // 3. Generate a unique transaction ID combining a timestamp and a random integer to prevent collisions
    const transactionId = `T${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Hardcoded pricing rules: 9999 base + 18% GST = 11799. PhonePe expects amount in paise (multiply by 100).
    const amount = 1179900; 

    // 4. Persist the initial intent to the database with a PENDING status
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

    // 5. Construct the callback URL. We intercept the PhonePe redirect at our backend to securely verify order status
    // before sending the user back to the React frontend.
    const redirectUrl = `${config.apiUrl}/api/community/card/payment-status?orderId=${transactionId}`;

    if (!client) {
      return res.status(503).json({
        success: false,
        message: "Payment provider unavailable",
        error: "PhonePe SDK not initialized properly.",
      });
    }

    // 6. Build and execute the payment request payload for PhonePe Standard Checkout
    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(transactionId)
      .amount(amount)
      .redirectUrl(redirectUrl)
      .build();

    const response = await client.pay(request);

    // 7. Return the external payment URL to the client so they can redirect the browser
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
 * @desc    Handle payment provider redirect, verify order status via S2S, and update the database
 * @route   ALL /api/community/card/payment-status
 * @access  Public
 */
export const paymentRedirect = async (req: Request, res: Response) => {
  try {
    // Safely extract orderId from either GET query params or POST body (depending on webhook type)
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

    // 1. Perform a secure Server-to-Server (S2S) check with PhonePe. 
    // This prevents malicious users from spoofing a success redirect.
    const response = await client.getOrderStatus(orderId);

    // 2. Map PhonePe states to our internal domain states and update the DB
    if (response.state === "COMPLETED") {
      await OrbitCardOrder.findOneAndUpdate(
        { transactionId: orderId },
        {
          status: "SUCCESS",
          providerReferenceId: (response as any).transactionId || "",
        },
      );
      // Success: Send back to frontend with a success flag
      return res.redirect(
        `${config.frontendUrl}/orbit-card/checkout?payment=success&orderId=${orderId}`,
      );
    } else if (response.state === "PENDING") {
      // Pending: The payment is held up at the bank. User should wait.
      return res.redirect(
        `${config.frontendUrl}/orbit-card/checkout?payment=pending&orderId=${orderId}`,
      );
    } else {
      // 3. Fallback: Treat FAILED, USER_CANCELLED, or unrecognized states as failed.
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

    // Fetch the order from the database using the unique transaction string
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
