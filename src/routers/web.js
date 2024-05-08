const express = require("express");
const router = express.Router();

const SiteRoute = require("../routers/siteRoute")
const AuthRoute = require("../routers/AuthRouter")
const ProductRoute = require("../routers/productRoute")
const UserRoute = require("../routers/usersRoute")
const CategoryRoute = require("../routers/categoriesRoute")
const CommentRoute = require("../routers/commentsRoute")
const OrderRoute = require("../routers/orderRoute")
const ConfigRoute = require("../routers/configRoute")
const SliderRoute = require("../routers/slidersRoute")
const BannerRoute = require("../routers/bannerRoute")
const RootRoute = require("../routers/RootRoute")
const RecycleBinRoute = require("../routers/recycleBinRoute")
const CustomerRoute = require("../routers/customerRoute")
const SocialRoute = require("../routers/socialRoute")
const SocialCusRoute = require("../routers/socialCusRoute")

router.use("",SiteRoute);
router.use("",AuthRoute);
router.use("",ProductRoute);
router.use("",UserRoute);
router.use("",CategoryRoute);
router.use("",CommentRoute);
router.use("",OrderRoute);
router.use("",ConfigRoute);
router.use("",SliderRoute);
router.use("",BannerRoute);
router.use("",RootRoute);
router.use("",RecycleBinRoute)
router.use("",CustomerRoute)
router.use("",SocialRoute)
router.use("",SocialCusRoute)



module.exports = router;
