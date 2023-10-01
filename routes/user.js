const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

const jwtSecret = process.env.JWT_SECRET;

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
 * GET
 * Admin - Login
 */
router.get("/admin", async (req, res) => {
  try {
    const details = {
      title: "Admin",
      description: "My personal blogging website!",
    };
    const token = req.cookies.token;
    if (token) return res.redirect("/dashboard");
    res.render("admin/index", {
      details,
      layout: adminLayout,
    });
  } catch (err) {
    console.log(err);
  }
});

/**
 * POST
 * Admin - Login Step
 */
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!user) return res.status(404).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, {
      httpOnly: true,
    });
    res.redirect("/dashboard");
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
      res.status(200).json({ message: "User register successfully!", user });
    } catch (err) {
      if (err.code === 11000)
        return res
          .status(409)
          .json({ message: "User with this username already exists" });
      return res.status(409).json("Internal server error");
    }
  } catch (err) {
    console.log(err);
  }
});

/**
 * GET
 * Admin - Logout
 */
router.get("/logout", (req, res) => {
  try {
    const details = {
      title: "Souav Dubey Blogs",
      description: "My personal blogging website!",
    };
    res.clearCookie("token");
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET
 * Admin - Dashboard
 */
router.get("/dashboard", auth, async (req, res) => {
  const details = {
    title: "Dashboard",
    description: "My personal blog page.",
  };
  try {
    const blogs = await Post.find();
    res.render("admin/dashboard", { details, blogs, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET
 * ADD NEW BLOG
 */
router.get("/add-post", auth, async (req, res) => {
  const details = {
    title: "Add Post",
    description: "My personal blog page.",
  };
  try {
    const blogs = await Post.find();
    res.render("admin/add-post", { details, blogs, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

// /**
//  * GET
//  * ADD NEW BLOG
//  */
// router.get("/add-post", auth, async (req, res) => {
//   const details = {
//     title: "Add Post",
//     description: "My personal blog page.",
//   };
//   try {
//     const blogs = await Post.find();
//     res.render("admin/add-post", { details, blogs, layout: adminLayout });
//   } catch (error) {
//     console.log(error);
//   }
// });

/**
 * POST
 * Admin - Add New Blog
 */
router.post("/add-post", auth, async (req, res) => {
  try {
    const newBlog = new Post({
      title: req.body.title,
      body: req.body.content,
    });

    await Post.create(newBlog);
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
    const details = {
      title: "Edit Blog",
      description: "My personal blog page.",
    };
    const blog = await Post.findById({ _id: req.params.id });
    res.render(`admin/edit-post`, { details, blog, layout: adminLayout });
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
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.content,
      updatedOn: Date.now(),
    });
    res.redirect("/dashboard");
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
    await Post.findByIdAndDelete(req.params.id);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
