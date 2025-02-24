import { ObjectId } from "mongoose";
import PostRepository from "../repositories/PostRepository";
import CustomException from "../exceptions/CustomException";
import StatusCodeEnum from "../enums/StatusCodeEnum";
import Database from "../utils/database";
import { IQuery } from "../interfaces/IQuery";
import {
  cleanUpFile,
  cleanUpFileArray,
  extractAndReplaceImages,
} from "../utils/fileUtils";
import UserRepository from "../repositories/UserRepository";
import UserEnum from "../enums/UserEnum";
import TierRepository from "../repositories/TierRepository";
import MembershipPackageRepository from "../repositories/MembershipPackageRepository";
import { PostStatus } from "../interfaces/IPost";
class PostService {
  private postRepository: PostRepository;
  private database: Database;
  private userRepository: UserRepository;
  private tierRepository: TierRepository;
  private membershipPackageRepository: MembershipPackageRepository;

  constructor() {
    this.postRepository = new PostRepository();
    this.database = Database.getInstance();
    this.userRepository = new UserRepository();
    this.tierRepository = new TierRepository();
    this.membershipPackageRepository = new MembershipPackageRepository();
  }
  createPost = async (
    userId: string | ObjectId,
    title: string,
    content: string,
    attachments: Array<string>,
    thumbnailUrl?: string
  ) => {
    const session = await this.database.startTransaction();

    try {
      // await this.checkTierPostLimit(userId);

      const checkPost = await this.postRepository.getPostByTitle(title);

      if (checkPost) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Post title already been taken"
        );
      }

      const formatedContent = extractAndReplaceImages(content, attachments);

      const post = await this.postRepository.createPost(
        {
          userId,
          title,
          content: formatedContent,
          attachments,
          thumbnailUrl,
        },
        session
      );

      await this.database.commitTransaction(session);
      return post;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };

  getPost = async (id: string | ObjectId, requesterId: string) => {
    try {
      let ignoreDeleted = false;
      const checkRequester = await this.userRepository.getUserById(
        requesterId,
        ignoreDeleted
      );
      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }
      if (
        [UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(checkRequester?.role)
      ) {
        ignoreDeleted = true;
      }

      const post = await this.postRepository.getPost(id, ignoreDeleted);

      if (
        (![UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(
          checkRequester.role
        ) ||
          requesterId.toString() !== post.userId.toString()) &&
        post.status !== PostStatus.PUBLISHED
      ) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Post not found"
        );
      }
      return post;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  getPosts = async (query: IQuery, requesterId: string, status: string) => {
    try {
      let ignoreDeleted = false;
      const checkRequester = await this.userRepository.getUserById(
        requesterId,
        ignoreDeleted
      );
      if (!checkRequester) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "Requester not found"
        );
      }
      if (
        [UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(checkRequester?.role)
      ) {
        ignoreDeleted = true;
      }

      let formatedStatus;
      if ([UserEnum.DOCTOR, UserEnum.MEMBER].includes(checkRequester.role)) {
        formatedStatus = "PUBLISHED";
      } else {
        formatedStatus = status;
      }
      const posts = await this.postRepository.getPosts(
        query,
        ignoreDeleted,
        formatedStatus
      );
      return posts;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  };

  updatePost = async (
    id: string | ObjectId,
    title: string,
    content: string,
    attachments: Array<string>,
    thumbnailUrl: string,
    requesterId: string
  ) => {
    const session = await this.database.startTransaction();
    try {
      const oldPost = await this.postRepository.getPost(id, true);

      if (requesterId.toString() !== oldPost.userId.toString()) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You are not allowed to update this post"
        );
      }

      const checkPost = await this.postRepository.getPostByTitle(title);

      if (checkPost) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Post title already been taken"
        );
      }

      type data = {
        title?: string;
        content?: string;
        attachments?: Array<string>;
        thumbnailUrl?: string;
      };

      const data: data = {};

      if (title && oldPost.title !== title) {
        data.title = title;
      }
      const formatedContent = extractAndReplaceImages(content, attachments);
      if (content && oldPost.content !== formatedContent) {
        data.content = formatedContent;
      }

      if (attachments && oldPost.attachments !== attachments) {
        data.attachments = attachments;
      }
      if (thumbnailUrl && oldPost.thumbnailUrl !== thumbnailUrl) {
        data.thumbnailUrl = thumbnailUrl;
      }
      const post = await this.postRepository.updatePost(id, data, session);

      await this.database.commitTransaction(session);

      if (oldPost.attachments.length > 0) {
        await cleanUpFileArray(oldPost.attachments, "update");
      }
      if (oldPost.thumbnailUrl !== "") {
        await cleanUpFile(oldPost.thumbnailUrl as string, "update");
      }

      return post;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };

  updatePostStatus = async (
    id: string | ObjectId,
    status: PostStatus,
    requesterId: string
  ) => {
    const session = await this.database.startTransaction();
    try {
      const user = await this.userRepository.getUserById(requesterId, false);

      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      const checkPost = await this.postRepository.getPost(id, false);
      if (
        checkPost.userId.toString() !== requesterId &&
        ![UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(user.role)
      ) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "You do not have access to perform this action"
        );
      }

      const data =
        status === PostStatus.DELETED
          ? { status, isDeleted: true }
          : { status };

      switch (status as PostStatus) {
        case PostStatus.REJECTED:
          // console.log("REJECTED");
          if (![UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(user.role)) {
            throw new CustomException(
              StatusCodeEnum.Forbidden_403,
              "Forbidden"
            );
          }
          break;

        case PostStatus.PUBLISHED:
          // console.log("PUBLISHED");
          if (![UserEnum.ADMIN, UserEnum.SUPER_ADMIN].includes(user.role)) {
            throw new CustomException(
              StatusCodeEnum.Forbidden_403,
              "Forbidden"
            );
          }
          break;

        default:
          break;
      }
      const post = await this.postRepository.updatePost(id, data, session);

      await this.database.commitTransaction(session);

      return post;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };

  deletePost = async (id: string | ObjectId, requesterId: string) => {
    const session = await this.database.startTransaction();

    try {
      const oldPost = await this.postRepository.getPost(id, true);

      if (requesterId.toString() !== oldPost.userId.toString()) {
        throw new CustomException(
          StatusCodeEnum.Forbidden_403,
          "You are not allowed to update this post"
        );
      }

      const post = await this.postRepository.deletePost(id, session);

      await cleanUpFile(oldPost.thumbnailUrl as string, "update");
      await cleanUpFileArray(oldPost.attachments, "update");

      await this.database.commitTransaction(session);

      return post;
    } catch (error) {
      await this.database.abortTransaction(session);
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    } finally {
      await session.endSession();
    }
  };

  async getPostsByUserId(requesterId: string, userId: string, query: IQuery) {
    try {
      let status;
      if (requesterId !== userId) {
        status = PostStatus.PUBLISHED;
      }
      const posts = await this.postRepository.getPostsByUserId(
        userId,
        query,
        status as string
      );

      return posts;
    } catch (error) {
      if (error as Error | CustomException) {
        throw error;
      }
      throw new CustomException(
        StatusCodeEnum.InternalServerError_500,
        "Internal Server Error"
      );
    }
  }

  // checkTierPostLimit = async (userId: string | ObjectId) => {
  //   try {
  //     const user = await this.userRepository.getUserById(
  //       userId as string,
  //       false
  //     );

  //     if (!user) {
  //       throw new CustomException(
  //         StatusCodeEnum.NotFound_404,
  //         "User not found"
  //       );
  //     }
  //     if ([UserEnum.MEMBER].includes(user.role)) {
  //       const tierData = await this.tierRepository.getCurrentTierData(
  //         user.subscription.tier as number
  //       );

  //       if (user.subscription.tier !== 0) {
  //         const currentPlanId = user?.subscription?.currentPlan;

  //         if (!currentPlanId || !isValidObjectId(currentPlanId)) {
  //           throw new CustomException(
  //             StatusCodeEnum.Forbidden_403,
  //             "Invalid user's current membership plan"
  //           );
  //         }

  //         //else {
  //         //console.log("currentPlan not null");
  //         //}

  //         const CheckPack =
  //           await this.membershipPackageRepository.getMembershipPackage(
  //             currentPlanId.toString(),
  //             false
  //           );

  //         if (!CheckPack) {
  //           throw new CustomException(
  //             StatusCodeEnum.Forbidden_403,
  //             "User's current membership package not found"
  //           );
  //         }

  //         //else {
  //         //   console.log("currentPlan found");
  //         // }

  //         if (!user.subscription.endDate) {
  //           throw new CustomException(
  //             StatusCodeEnum.Forbidden_403,
  //             "Your membership expiration date not found"
  //           );
  //         }

  //         const endDate = new Date(
  //           (user.subscription.startDate as Date).getTime() +
  //             3600 * 24 * CheckPack.duration.value * 1000
  //         );

  //         const timeMargin = 5 * 60 * 1000;
  //         if (
  //           Math.abs(endDate.getTime() - user.subscription.endDate?.getTime()) >
  //           timeMargin
  //         ) {
  //           throw new CustomException(
  //             StatusCodeEnum.Forbidden_403,
  //             "Invalid user's membership expiration date "
  //           );
  //         }
  //         //  else {
  //         //   console.log("valid end date");
  //         // }

  //         //cron job late?(run each mins so late seconds?)
  //         if (user.subscription.endDate?.getTime() < Date.now()) {
  //           throw new CustomException(
  //             StatusCodeEnum.Forbidden_403,
  //             "Current pack has expires, please wait for the system to handle"
  //           );
  //         }
  //       } else {
  //         if (
  //           user.subscription.currentPlan ||
  //           user.subscription.startDate ||
  //           user.subscription.endDate
  //         ) {
  //           throw new CustomException(
  //             StatusCodeEnum.Forbidden_403,
  //             "Tier 0 cannot have subscription details"
  //           );
  //         }
  //       }

  //       const PostsCount = await this.postRepository.countPosts(userId);

  //       if (PostsCount >= tierData.postsLimit) {
  //         throw new CustomException(
  //           StatusCodeEnum.Forbidden_403,
  //           "You have exceeded your current tier post limit"
  //         );
  //       }
  //     }
  //   } catch (error) {
  //     if (error as Error | CustomException) {
  //       throw error;
  //     }
  //     throw new CustomException(
  //       StatusCodeEnum.InternalServerError_500,
  //       "Internal Server Error"
  //     );
  //   }
  // };
}

export default PostService;
