const express = require("express");
const { createBanner, getBanner, getAdminBanner, deleteBanner} = require("../controllers/bannerController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();


router.route("/banners").get(getBanner);

router.route("/admin/banners").get(isAuthenticatedUser, authorizeRoles("admin"), getAdminBanner);

router.route("/admin/banner/new").post(isAuthenticatedUser, authorizeRoles("admin"), createBanner);

router.route("/admin/banners/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteBanner);


module.exports = router;