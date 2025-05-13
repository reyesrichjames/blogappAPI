const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { errorHandler } = require('../auth');

// Add a comment to a post
exports.addComment = (req, res) => {
    const postId = req.params.postId;
    const content = req.body.content;
    let author;
    if (req.user && req.user.username) {
        author = req.user.username;
    } else if (req.body.username) {
        author = req.body.username;
    } else {
        author = 'Anonymous';
    }

    const newComment = new Comment({
        content,
        author,
        post: postId
    });

    newComment.save()
        .then(comment => {
            return Post.findByIdAndUpdate(
                postId,
                { $push: { comments: comment._id } },
                { new: true }
            ).then(() => comment);
        })
        .then(comment => res.status(201).send(comment))
        .catch(err => errorHandler(err, req, res));
};

// Get all comments for a post
exports.getComments = (req, res) => {
    const postId = req.params.postId;
    Comment.find({ post: postId }).sort({ createdAt: -1 })
        .then(comments => res.status(200).send(comments))
        .catch(err => errorHandler(err, req, res));
};

// Delete a comment (admin only)
exports.deleteComment = (req, res) => {
    const commentId = req.params.commentId;
    if (!req.user.isAdmin) {
        return res.status(403).send({ message: 'Only admin can delete comments' });
    }
    Comment.findByIdAndDelete(commentId)
        .then(() => res.status(200).send({ message: 'Comment deleted successfully' }))
        .catch(err => errorHandler(err, req, res));
};

// For guests
exports.addGuestComment = (req, res) => {
    const postId = req.params.postId;
    const content = req.body.content;
    const author = req.body.username || 'Anonymous';

    const newComment = new Comment({
        content,
        author,
        post: postId
    });

    newComment.save()
        .then(comment => {
            return Post.findByIdAndUpdate(
                postId,
                { $push: { comments: comment._id } },
                { new: true }
            ).then(() => comment);
        })
        .then(comment => res.status(201).send(comment))
        .catch(err => errorHandler(err, req, res));
}; 