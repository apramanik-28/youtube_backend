import {Router} from "express";
import {loginUser, logoutUser, registerUser,changeCurrenrPassword,updateAccountDetails, updateUserCoverImage,updateUserAvatar, getUserChannelProfile, getWatchHistory} from "../controllers/user.contoller.js";
import {upload} from "../middlewears/multer.middlewears.js"
import { verifyJWT } from "../middlewears/auth.middlewears.js";


const router = Router()



router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
   registerUser)


router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/change_password").post(verifyJWT,changeCurrenrPassword)
router.route("/updateAccount").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/coverImage").patch(verifyJWT,upload.single("/coverImage"),
updateUserCoverImage)
router.route("/c/username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)
export default router