const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Plan = require("../../models/Plan/Plan");
const User = require("../../models/User/User");
const Payment = require("../../models/Payment/Payment");
//-----Stripe Payment-----
const stripePaymentController = {
  //----- payment
  payment: asyncHandler(async (req, res) => {
    //!. Get the plan ID
    const { subscriptionPlanId } = req.body;
    // Resolve plan by ObjectId, tier or planName (fallback to static)
    let plan = null;
    if (mongoose.isValidObjectId(subscriptionPlanId)) {
      plan = await Plan.findById(subscriptionPlanId);
    }
    if (!plan) {
      plan = await Plan.findOne({
        $or: [
          { tier: subscriptionPlanId },
          { planName: new RegExp(`^${subscriptionPlanId}$`, 'i') },
        ],
      });
    }
    if (!plan) {
      const { resolveStaticPlanByIdOrName } = require("../../utils/staticPlans");
      const staticPlan = resolveStaticPlanByIdOrName(subscriptionPlanId);
      if (!staticPlan) {
        return res.json({ message: "Plan not found" });
      }
      // Mimic plan doc shape for price
      plan = { price: staticPlan.price, _id: staticPlan._id, tier: staticPlan.tier };
    }
    //! get the user
    const user = req.user;
    //! Create payment intent/making the payment
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: plan.price * 100,
        currency: "usd",
        // add some metadata
        metadata: {
          userId: user?.toString(),
          subscriptionPlanId,
        },
      });
      //! Send the response
      res.json({
        clientSecret: paymentIntent.client_secret,
        subscriptionPlanId,
        paymentIntent,
      });
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to create payment intent',
        details: error
      });
    }
  }),
  //verifying the payment
  verify: asyncHandler(async (req, res) => {
    try {
      //! Get the paymentId
      const { paymentId } = req.params;
      if (!paymentId) {
        return res.status(400).json({ message: "Payment ID is required" });
      }
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
      console.log('Payment Intent:', paymentIntent);
    //! confirm the payment status
    if (paymentIntent.status === "succeeded") {
      //!get the data from the metadata
      const metadata = paymentIntent?.metadata;
      const subscriptionPlanId = metadata?.subscriptionPlanId;
      const userId = metadata.userId;
      
      //! Find the user
      const userFound = await User.findById(userId);
      if (!userFound) {
        return res.json({ message: "User not found" });
      }

      //! Resolve the plan by ObjectId, tier or planName (fallback to static)
      let plan = null;
      if (mongoose.isValidObjectId(subscriptionPlanId)) {
        plan = await Plan.findById(subscriptionPlanId);
      }
      if (!plan) {
        plan = await Plan.findOne({
          $or: [
            { tier: subscriptionPlanId },
            { planName: new RegExp(`^${subscriptionPlanId}$`, 'i') },
          ],
        });
      }
      
      if (!plan) {
        const { resolveStaticPlanByIdOrName } = require("../../utils/staticPlans");
        const staticPlan = resolveStaticPlanByIdOrName(subscriptionPlanId);
        if (!staticPlan) {
          return res.status(400).json({ message: "Invalid subscription plan" });
        }
        // Try to find a corresponding DB plan by tier
        const dbPlan = await Plan.findOne({ tier: staticPlan.tier });
        if (!dbPlan) {
          return res.status(500).json({ message: "Plan not configured in database. Please contact support." });
        }
        plan = dbPlan;
      }

      //! Get the payment details
      const amount = paymentIntent?.amount / 100;
      const currency = paymentIntent?.currency;
      
      // ! Create payment History
      const newPayment = await Payment.create({
        user: userId,
        subscriptionPlan: plan._id,
        status: "success",
        amount,
        currency,
        reference: paymentId,
      });

      if (newPayment) {
        //!  Update the user profile
        userFound.hasSelectedPlan = true;
        userFound.plan = plan._id; // Use the actual plan ObjectId
        //resave
        await userFound.save();
      }
      
      //! Fetch the updated user with populated plan
      const updatedUser = await User.findById(userId).populate('plan');
      
      //! Send the response
      res.json({
        status: true,
        message: "Payment verified, user updated",
        userFound: updatedUser
      });
    } else {
      // Payment not succeeded
      res.json({
        status: false,
        message: `Payment status: ${paymentIntent.status}`,
        paymentIntent
      });
    }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to verify payment',
        details: error
      });
    }
  }),
  //Free plan
  free: asyncHandler(async (req, res) => {
    //check for the user
    const user = await User.findById(req.user);
    if (!user) {
      throw new Error("User not found");
    }
    //update the user field
    user.hasSelectedPlan = true;
    await user.save();
    //send the response
    res.json({
      status: true,
      message: "Payment verified, user updated",
    });
  }),
};

module.exports = stripePaymentController;
