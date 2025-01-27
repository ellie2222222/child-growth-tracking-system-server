import express from "express";
import ChildHandler from "../handlers/ChildHandler";
import ChildController from "../controllers/ChildController";

const childRoutes = express.Router();
const childHandler = new ChildHandler();
const childController = new ChildController();

childRoutes.post("/", childHandler.createChild, childController.createChild);

childRoutes.put("/:childId", childHandler.updateChild, childController.updateChild);

childRoutes.delete("/:childId", childHandler.deleteChild, childController.deleteChild);

childRoutes.get("/:childId", childHandler.getChild, childController.getChildById);

childRoutes.get("/", childHandler.getChildren, childController.getChildrenByUserId);

export default childRoutes;