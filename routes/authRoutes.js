// 1. Dependencies
const express = require("express");
const router = express.Router();
const passport = require("passport");

// 2. Import registration file model
const Registration = require("../models/Registration");

router.get("/Signup", (req, res) => {
  res.render("userPage");
});

router.post("/Signup", async (req, res) => {
  try {
    const { firstName, surname, email, password, telephone, role } = req.body;

    // Validation: First Name
    if (!firstName || firstName.trim().length === 0) {
      return res.status(400).render("userPage", { error: "First Name is required." });
    }
    const namePattern = /^[A-Z][a-zA-Z\s]*$/;
    if (!namePattern.test(firstName.trim())) {
      return res.status(400).render("userPage", { error: "First Name must start with a capital letter and contain no numbers." });
    }

    // Validation: Surname
    if (!surname || surname.trim().length === 0) {
      return res.status(400).render("userPage", { error: "Surname is required." });
    }
    if (!namePattern.test(surname.trim())) {
      return res.status(400).render("userPage", { error: "Surname must start with a capital letter and contain no numbers." });
    }

    // Validation: Email
    if (!email || email.trim().length === 0) {
      return res.status(400).render("userPage", { error: "Email is required." });
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      return res.status(400).render("userPage", { error: "Email must be valid." });
    }

    // Validation: Password
    if (!password || password.length < 6) {
      return res.status(400).render("userPage", { error: "Password must be at least 6 characters." });
    }

    // Validation: Role
    if (!role || role.trim().length === 0) {
      return res.status(400).render("userPage", { error: "Role must be selected." });
    }

    // Check if email already exists
    const existingUser = await Registration.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(400).render("userPage", { error: "Email already in use. Please use a different email address." });
    }

    // Create new user
    const newUser = new Registration({
      firstName: firstName.trim(),
      surname: surname.trim(),
      email: email.trim(),
      telephone: telephone || "",
      role: role.trim()
    });

    await Registration.register(newUser, password);
    res.redirect("/admin");
  } catch (error) {
    console.error(error);
    res.status(500).render("userPage", { error: "Unable to create user. Please try again." });
  }
});
 

router.get("/login", (req, res) => {
  const error = req.query.error || "";
  res.render("logIn", { error });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error(err);
      return res.status(500).render("logIn", { error: "An error occurred during login." });
    }

    if (!user) {
      // User not found or password incorrect  
      const errorMessage = info?.message || "Invalid email or password.";
      return res.status(401).render("logIn", { error: errorMessage });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return res.status(500).render("logIn", { error: "Unable to log in. Please try again." });
      }

      if (user.role === "Admin") {
        res.redirect("/admin");
      } else if (user.role === "Manager") {
        res.redirect("/manager");
      } else if (user.role === "Attendant") {
        res.redirect("/attendant");
      } else {
        res.redirect("/");
      }
    });
  })(req, res, next);
});

router.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if(err) { return next(err); }
    res.redirect("/")
  })
})

module.exports = router;
