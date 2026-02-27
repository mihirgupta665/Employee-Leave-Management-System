import jwt from "jsonwebtoken";
import { modelByRole } from "../utils/roleModels.js";

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const UserModel = modelByRole[decoded.role];
    if (!UserModel) {
      return res.status(401).json({ message: "Invalid token role" });
    }
    const user = await UserModel.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }
    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

export default protect;
