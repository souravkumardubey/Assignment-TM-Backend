const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

const jwtSecret = process.env.TOKEN_SECRET;

/**
 * auth middleware
 */
// const auth = (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token) return res.status(401).json({ message: "Unauthorized" });

//   try {
//     const decoded = jwt.verify(token, jwtSecret);
//     req.userId = decoded.userId;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "Unauthorized" });
//   }
// };

/**
 * POST
 * Admin - Login Step
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username,password)
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(404).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, {
      httpOnly: true,
    });
    res.status(200).json({ message: "Successful login!" });
  } catch (err) {
    return res.status(404).json({ message: "Invalid credentials" });
  }
});

/**
 * POST
 * Admin - Register
 */
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({
        username,
        password: hashedPassword,
      });
      return res
        .status(200)
        .json({ message: "User register successfully!", user });
    } catch (err) {
      if (err.code === 11000)
        return res
          .status(409)
          .json({ message: "User with this username already exists" });
      return res.status(409).json("Internal server error");
    }
  } catch (err) {
    return res.status(409).json("Internal server error");
  }
});

/**
 * GET
 * Admin - Logout
 */
router.get("/logout", (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET
 * Admin - Dashboard
 */
router.get("/dashboard", auth, async (req, res) => {
  try {
    console.log(req.headers['user'])
    const decodedToken = jwt.verify(
      req.headers["user"],
      process.env.TOKEN_SECRET
    );
    const adminId = decodedToken.userId;
    const tasks = await Task.find({ userId: adminId });
    return res.status(200).json({ tasks: tasks });
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong!" });
  }
});



/**
 * POST
 * Admin - Add New Blog
 */
router.post("/add-post", auth, async (req, res) => {
  try {
    const decodedToken = jwt.verify(
      req.headers["user"],
      process.env.TOKEN_SECRET
    );
    const adminId = decodedToken.userId;
    const newBlog = new Task({
      title: req.body.title,
      description: req.body.description,
      status: req.status,
      dueDate: new Date(),
      userId: adminId,
    });

    await Task.create(newBlog);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET
 * Admin - Edit blog
 */
router.get("/edit-post/:id", auth, async (req, res) => {
  try {
    const tasks = await Task.findById({ _id: req.params.id });
    return res.status(200).json({ tasks: tasks });
  } catch (error) {
    console.log(error);
  }
});

/**
 * PUT
 * Admin - Edit blog
 */
router.put("/edit-post/:id", auth, async (req, res) => {
  try {
    await Task.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
    });
    return res.status(200).json({ message: "Task updated." });
  } catch (error) {
    console.log(error);
  }
});

/**
 * DELETE
 * Admin = Delete Blog
 */
router.delete("/delete-post/:id", auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
