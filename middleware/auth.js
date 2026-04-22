//Ensure user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/auth/login")
}
//Check if a logged in user is an Admin
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "Admin") {
        return next();
    }
    res.status(403).send("Access denied: You need to be an Adim to access this page.")
}
const isManager = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "Manager") {
        return next();
    }
    res.status(403).send("Access denied: You need to be a Manager to access this page.")
}
const isAttendant = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "Attendant") {
        return next();
    }
    res.status(403).send("Access denied: You need to be an Attendant to access this page..")
}
module.exports = {isAuthenticated, isAdmin, isManager, isAttendant}