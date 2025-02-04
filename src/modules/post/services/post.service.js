import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { postModel } from "../../../db/models/Post.model.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../db/db.service.js";
import { roleTypes } from "../../../db/models/User.model.js";
import mongoose from "mongoose";

export const getPosts = asyncHandler(async (req, res, next) => {
  const posts = await dbService.find({
    model: postModel,
    filter: { isDeleted: { $exists: false } },
    populate: [
      {
        path: "createdBy",
        select: "username image",
      },
      {
        path: "likes",
        select: "username image",
      },
    ],
  });

  if (!posts.length) {
    return next(new Error("There are no posts", { cause: 404 }));
  }

  return successResponse({
    res,
    status: 200,
    message: "Posts retrieved successfully",
    data: { posts },
  });
});

export const getPost = asyncHandler(async (req, res, next) => {
  const post = await dbService.findOne({
    model: postModel,
    filter: { _id: req.params.postId, isDeleted: { $exists: false } },
    populate: [
      {
        path: "createdBy",
        select: "username image",
      },
      {
        path: "likes",
        select: "username image",
      },
    ],
  });

  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }

  return successResponse({
    res,
    status: 200,
    message: "Post retrieved successfully",
    data: { post },
  });
});

export const createPost = asyncHandler(async (req, res, next) => {
  const { content } = req.body;

  let attachments = [];

  for (const file of req.files) {
    const { secure_url, public_id } = await cloud.uploader.upload(file.path, {
      folder: `${process.env.APP_NAME}/user/${req.user._id}/posts`,
    });
    attachments.push({ secure_url, public_id });
  }

  const post = await dbService.create({
    model: postModel,
    data: { content, attachments, createdBy: req.user._id },
  });

  return successResponse({
    res,
    status: 201,
    message: "Post created successfully",
    data: post,
  });
});

export const updatePost = asyncHandler(async (req, res, next) => {
  let attachments = [];

  if (req.files.length) {
    for (const file of req.files) {
      const { secure_url, public_id } = await cloud.uploader.upload(file.path, {
        folder: `${process.env.APP_NAME}/user/${req.user._id}/posts`,
      });
      attachments.push({ secure_url, public_id });
    }
    req.body.attachments = attachments;
  }

  const post = await dbService.findOneAndUpdate({
    filter: {
      _id: req.params.postId,
      isDeleted: { $exists: false },
      createdBy: req.user._id,
    },
    model: postModel,
    data: { ...req.body, updatedBy: req.user._id },
    options: { new: true },
  });

  return post
    ? successResponse({
        res,
        status: 200,
        message: "Post updated successfully",
        data: post,
      })
    : next(new Error("Post not found", { cause: 404 }));
});

export const freezePost = asyncHandler(async (req, res, next) => {
  const owner =
    req.user.role === roleTypes.user ? {} : { createdBy: req.user._id };

  const post = await dbService.findOneAndUpdate({
    filter: {
      _id: req.params.postId,
      isDeleted: { $exists: false },
      ...owner,
    },
    model: postModel,
    data: { isDeleted: true, updatedBy: req.user._id, deletedBy: req.user._id },
    options: { new: true },
  });

  return post
    ? successResponse({
        res,
        status: 200,
        message: "Post freezed successfully",
        data: post,
      })
    : next(new Error("Post not found", { cause: 404 }));
});

export const unfreezePost = asyncHandler(async (req, res, next) => {
  const post = await dbService.findOneAndUpdate({
    filter: {
      _id: req.params.postId,
      isDeleted: { $exists: true },
      deletedBy: req.user._id,
    },
    model: postModel,
    data: {
      $unset: {
        deletedBy: 1,
        isDeleted: 1,
      },
      updatedBy: req.user._id,
    },
    options: { new: true },
  });

  return post
    ? successResponse({
        res,
        status: 200,
        message: "Post unfreezed successfully",
        data: post,
      })
    : next(new Error("Post not found", { cause: 404 }));
});

export const likePost = asyncHandler(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const post = await postModel.findOne({
    _id: req.params.postId,
    isDeleted: { $exists: false },
    likes: { $in: [userId] },
  });

  if (post) {
    return next(new Error("Post already liked", { cause: 409 }));
  }

  const updatedPost = await dbService.findOneAndUpdate({
    filter: {
      _id: req.params.postId,
      isDeleted: { $exists: false },
    },
    model: postModel,
    data: {
      $addToSet: { likes: userId },
    },
    options: { new: true },
  });

  if (!updatedPost) {
    return next(new Error("Post not found", { cause: 404 }));
  }

  return successResponse({
    res,
    status: 200,
    message: "Post liked successfully",
    data: updatedPost,
  });
});

export const unlikePost = asyncHandler(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const post = await dbService.findOneAndUpdate({
    filter: {
      _id: req.params.postId,
      isDeleted: { $exists: false },
    },
    model: postModel,
    data: {
      $pull: { likes: userId },
    },
    options: { new: true },
  });

  return post
    ? successResponse({
        res,
        status: 200,
        message: "Post unliked successfully",
        data: post,
      })
    : next(new Error("Post not found", { cause: 404 }));
});
