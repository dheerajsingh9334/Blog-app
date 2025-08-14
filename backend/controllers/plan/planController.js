const asyncHandler = require("express-async-handler");
const Plan = require("../../models/Plan/Plan");

const planController = {
  //!Create plan
  createPlan: asyncHandler(async (req, res) => {
    return res.status(403).json({
      status: "error",
      message: "Static plans mode: creating plans is disabled",
    });
  }),

  //!list all plans (fallback to static plans if DB empty)
  lists: asyncHandler(async (req, res) => {
    const dbPlans = await Plan.find({ isActive: true }).sort({ price: 1 });
    const { getStaticPlans } = require("../../utils/staticPlans");
    const plans = dbPlans && dbPlans.length > 0 ? dbPlans : getStaticPlans();
    res.json({
      status: "success",
      message: "Plans fetched successfully",
      plans,
    });
  }),
  
  //! get a plan
  getPlan: asyncHandler(async (req, res) => {
    //get the plan id from params
    const planId = req.params.planId;
    //find the plan (by id, tier, or planName), fallback to static
    let planFound = await Plan.findById(planId);
    if (!planFound) {
      planFound = await Plan.findOne({
        $or: [
          { tier: planId },
          { planName: new RegExp(`^${planId}$`, "i") },
        ],
      });
    }
    if (!planFound) {
      const { resolveStaticPlanByIdOrName } = require("../../utils/staticPlans");
      const staticPlan = resolveStaticPlanByIdOrName(planId);
      if (!staticPlan) {
        throw new Error("Plan not found");
      }
      return res.json({
        status: "success",
        message: "Plan fetched successfully",
        planFound: staticPlan,
      });
    }
    res.json({
      status: "success",
      message: "Plan fetched successfully",
      planFound,
    });
  }),
  
  //! delete
  delete: asyncHandler(async (req, res) => {
    return res.status(403).json({
      status: "error",
      message: "Static plans mode: deleting plans is disabled",
    });
  }),
  
  //! update plan
  update: asyncHandler(async (req, res) => {
    return res.status(403).json({
      status: "error",
      message: "Static plans mode: updating plans is disabled",
    });
  }),
};

module.exports = planController;
