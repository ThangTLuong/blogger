const {
  models: { User, Post, Text, Media, Like, Comment, Repost },
  sequelize,
} = require("../models");
const status = require("../status");

module.exports = {
  newPost: (req, res) => {
    const { original_post_id, text } = req.body;
    const { user_id } = req.session;
    const media = req.files;
    let newPostInstance;

    const basePost = {
      user_id: 1,
      date_time: new Date(),
    };

    const post = original_post_id
      ? { ...basePost, original_post_id }
      : basePost;

    Post.create(post)
      .then((newPost) => {
        newPostInstance = newPost;

        return Text.create({
          post_id: newPost.post_id,
          text,
        });
      })
      .then(() => {
        const mediaPromises = media.map((mediaContent) => {
          return Media.create({
            post_id: newPostInstance.post_id,
            media: mediaContent.buffer,
          });
        });

        return Promise.all(mediaPromises);
      })
      .then(() => {
        const like = Like.create({ post_id: newPostInstance.post_id });
        const comment = Comment.create({ post_id: newPostInstance.post_id });
        const repost = Repost.create({ post_id: newPostInstance.post_id });

        return Promise.all([like, comment, repost]);
      })
      .then(() => {
        status.Created(req, res, "Post created successfully.");
      })
      .catch((err) => {
        status.InternalServerError(req, res, err);
        console.log(err.message);
      });
  },

  loadPost: (req, res) => {
    const { user_id, limit } = req.body;

    const baseQuery = {
      order: [["date_time", "DESC"]],
      limit: limit || 3,
      include: [
        { model: Text },
        { model: Media },
        {
          model: User,
          attributes: ["user_id", "username", "user_handle"],
        },
      ],
      distinct: true,
    };

    Post.findAll(baseQuery)
      .then((posts) => {
        const postIds = posts.map((post) => post.post_id);

        return Promise.all([
          Like.findAll({
            attributes: [
              "post_id",
              [sequelize.fn("COUNT", sequelize.col("like_id")), "likeCount"],
            ],
            where: { post_id: postIds },
            group: ["post_id"],
          }),
          Comment.findAll({
            attributes: [
              "post_id",
              [
                sequelize.fn("COUNT", sequelize.col("comment_id")),
                "commentCount",
              ],
            ],
            where: { post_id: postIds },
            group: ["post_id"],
          }),
          Repost.findAll({
            attributes: [
              "post_id",
              [
                sequelize.fn("COUNT", sequelize.col("repost_id")),
                "repostCount",
              ],
            ],
            where: { post_id: postIds },
            group: ["post_id"],
          }),
        ]).then(([likes, comments, reposts]) => {
          const mergedPosts = posts.map((post) => {
            const likeCount =
              likes.find((like) => like.post_id === post.post_id)?.likeCount ||
              0;
            const commentCount =
              comments.find((comment) => comment.post_id === post.post_id)
                ?.commentCount || 0;
            const repostCount =
              reposts.find((repost) => repost.post_id === post.post_id)
                ?.repostCount || 0;

            return {
              ...post.toJSON(),
              likeCount,
              commentCount,
              repostCount,
            };
          });

          return mergedPosts;
        });
      })
      .then((posts) => {
        status.Ok(req, res, posts);
      })
      .catch((err) => {
        console.log(err);
        status.InternalServerError(req, res, err);
      });
  },
};