const express = require("express");
const planController = require("../../controllers/plan/planController");
const isAuthenticated = require("../../middlewares/isAuthenticated");

const planRouter = express.Router();

//----create plan----
planRouter.post("/create", isAuthenticated, planController.createPlan);

//----list all plans----
planRouter.get("/", planController.lists);

//----get a plan----
planRouter.get("/:planId", planController.getPlan);

//----update plan----
planRouter.put("/:planId", isAuthenticated, planController.update);

//----delete plan----
planRouter.delete("/:planId", isAuthenticated, planController.delete);

module.exports = planRouter;



