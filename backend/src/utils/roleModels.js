import Admin from "../models/Admin.js";
import Manager from "../models/Manager.js";
import Employee from "../models/Employee.js";

const modelByRole = {
  admin: Admin,
  manager: Manager,
  employee: Employee
};

const roleOrder = ["admin", "manager", "employee"];

export { modelByRole, roleOrder };
