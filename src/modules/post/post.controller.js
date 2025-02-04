import { Router } from "express";
import * as postService from "./services/post.service.js";
import * as validators from "./post.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { endpoint } from "./post.authorization.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import {
  fileValidations,
  uploadCloudFile,
} from "../../utils/multer/cloud.multer.js";

const router = Router();

router.post(
  "/",
  authentication(),
  authorization(endpoint.createPost),
  uploadCloudFile(fileValidations.image).array("attachment", 2),
  postService.createPost
);

router.patch(
  "/:postId",
  authentication(),
  authorization(endpoint.updatePost),
  uploadCloudFile(fileValidations.image).array("attachment", 2),
  postService.updatePost
);

router.delete(
  "/:postId",
  authentication(),
  authorization(endpoint.freezePost),
  validation(validators.freezePost),
  postService.freezePost
);

router.patch(
  "/:postId/unfreeze",
  authentication(),
  authorization(endpoint.unfreezePost),
  validation(validators.unfreezePost),
  postService.unfreezePost
);

export default router;
