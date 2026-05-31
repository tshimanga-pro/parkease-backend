const express = require("express");
const router = express.Router();
const {isAuthenticated, isAdmin, isManager, isAttendant} = require("../middleware/auth")

// import models
const Registration = require('../models/Registration')
const VehicleRegistration = require('../models/VehicleRegistration')
const TyreTransaction = require('../models/TyreTransaction')
const BatteryTransaction = require('../models/BatteryTransaction')

router.get("/manager", isManager, (req, res) => {
  res.render("manager");
});

router.get("/admin", async (req, res) => {
  try {
    const users = await Registration.find().sort({ surname: 1, firstName: 1 });
    const tyreTotalResult = await TyreTransaction.aggregate([
      {
        $group: {
          _id: null,
          totalServicesAmount: { $sum: "$servicesTotal" },
        },
      },
    ]);
    const tyreServicesTotal = tyreTotalResult.length > 0 ? tyreTotalResult[0].totalServicesAmount : 0;
    const formattedTyreServiceTotal = `UGX ${tyreServicesTotal.toLocaleString('en-UG')}`;

    const batteryTotalResult = await BatteryTransaction.aggregate([
      {
        $group: {
          _id: null,
          totalAmountPaid: { $sum: "$amountPaid" },
        },
      },
    ]);
    const batteryServicesTotal = batteryTotalResult.length > 0 ? batteryTotalResult[0].totalAmountPaid : 0;
    const formattedBatteryServiceTotal = `UGX ${batteryServicesTotal.toLocaleString('en-UG')}`;

    const message = req.query.msg || null;
    res.render("admin", { users, message, formattedTyreServiceTotal, formattedBatteryServiceTotal });
  } catch (error) {
    console.error(error);
    res.render("admin", { users: [], message: null, formattedTyreServiceTotal: 'UGX 0', formattedBatteryServiceTotal: 'UGX 0' });
  }
});

// Edit user
router.get('/admin/edit/:id', isAdmin, async (req, res) => {
  try {
    const user = await Registration.findById(req.params.id).lean();
    if (!user) return res.status(404).send('User not found');
    res.render('editUser', { user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to load user for editing');
  }
});

router.post('/admin/edit/:id', isAdmin, async (req, res) => {
  try {
    const { firstName, surname, email, telephone, role } = req.body;

    // Prevent duplicate email
    const existing = await Registration.findOne({ email: email.trim().toLowerCase(), _id: { $ne: req.params.id } });
    if (existing) {
      const user = await Registration.findById(req.params.id).lean();
      return res.status(400).render('editUser', { user, errorMessage: 'Email already in use by another account.' });
    }

    await Registration.findByIdAndUpdate(req.params.id, {
      firstName: firstName?.trim(),
      surname: surname?.trim(),
      email: email?.trim().toLowerCase(),
      telephone: telephone || '',
      role: role?.trim(),
    }, { runValidators: true });

    res.redirect('/admin?msg=User%20updated');
  } catch (error) {
    console.error(error);
    const user = await Registration.findById(req.params.id).lean();
    res.status(500).render('editUser', { user, errorMessage: 'Unable to update user. Please check your input.' });
  }
});

// Delete user
router.post('/admin/delete/:id', isAdmin, async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.redirect('/admin?msg=User%20deleted');
  } catch (error) {
    console.error(error);
    res.redirect('/admin?msg=Unable%20to%20delete%20user');
  }
});

router.get("/signout", isAttendant, (req, res, next) => {
  next();
});

router.get("/attendant", isAttendant, async (req, res) => {
  try {
    // Fetch all parked vehicles
    const parkedVehicles = await VehicleRegistration.find({ status: "Parked" }).sort({ arrivalTime: -1 });
    // Calculate total vehicles packed
    const totalVehiclesPacked = parkedVehicles.length;
    
    res.render("attendant", { 
      parkedVehicles, 
      totalVehiclesPacked 
    });
  } catch (error) {
    console.error(error);
    res.render("attendant", { 
      parkedVehicles: [], 
      totalVehiclesPacked: 0 
    });
  }
});

router.get("/usersList", isAdmin, async (req, res) => {
  try {
    let users = await Registration.find().sort({$natural: -1})
    res.render("usersList", {users});
  } catch (error) {
    res.status(400).send("Unable to find users in the Database.")
  }
})

module.exports = router;