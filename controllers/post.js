const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { errorHandler } = require('../auth');

// Create a new blog post
exports.addPost = (req, res) => {
    const { title, content, imageUrl } = req.body;
    const author = req.user.id;
    const newPost = new Post({ title, content, author, imageUrl });
    newPost.save()
        .then(post => Post.findById(post._id).populate('author', 'username'))
        .then(populatedPost => res.status(201).send(populatedPost))
        .catch(err => errorHandler(err, req, res));
};

// Get all blog posts
exports.getPosts = (req, res) => {
    Post.find()
        .populate('author', 'username profilePic')
        .sort({ createdAt: -1 })
        .then(posts => {
            if (!posts) {
                return res.status(404).send({ message: 'No posts found' });
            }
            return res.status(200).send(posts);
        })
        .catch(err => errorHandler(err, req, res));
};

// Get a single blog post by ID
exports.getPost = (req, res) => {
    Post.findById(req.params.postId)
        .populate('author', 'username profilePic')
        .then(post => {
            if (!post) return res.status(404).send({ message: 'Post not found' });
            res.status(200).send(post);
        })
        .catch(err => errorHandler(err, req, res));
};

// Update a blog post (only by author or admin)
exports.updatePost = (req, res) => {
    Post.findById(req.params.postId)
        .then(post => {
            if (!post) return res.status(404).send({ message: 'Post not found' });
            if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
                return res.status(403).send({ message: 'Unauthorized' });
            }
            post.title = req.body.title || post.title;
            post.content = req.body.content || post.content;
            post.imageUrl = req.body.imageUrl || post.imageUrl;
            return post.save();
        })
        .then(updatedPost => Post.findById(updatedPost._id).populate('author', 'username'))
        .then(populatedPost => res.status(200).send(populatedPost))
        .catch(err => errorHandler(err, req, res));
};

// Delete a blog post (only by author or admin)
exports.deletePost = (req, res) => {
    Post.findById(req.params.postId)
        .then(post => {
            if (!post) {
                console.log('DeletePost: Post not found');
                return res.status(404).send({ message: 'Post not found' });
            }
            // Robust author ID comparison
            let authorId = post.author && post.author._id ? post.author._id.toString() : post.author.toString();
            console.log('DeletePost: req.user.id =', req.user.id);
            console.log('DeletePost: authorId =', authorId);
            console.log('DeletePost: req.user.isAdmin =', req.user.isAdmin);
            if (authorId !== req.user.id && !req.user.isAdmin) {
                console.log('DeletePost: Unauthorized - Forbidden');
                return res.status(403).send({ message: 'Unauthorized' });
            }
            console.log('DeletePost: Authorized - Deleting post');
            return Post.findByIdAndDelete(req.params.postId);
        })
        .then(() => res.status(200).send({ message: 'Post deleted successfully' }))
        .catch(err => {
            console.log('DeletePost: Error', err);
            errorHandler(err, req, res);
        });
};

// Get popular blog posts based on the number of comments
exports.getPopularPosts = (req, res) => {
    Post.aggregate([
        {
            $lookup: {
                from: 'comments', // Assuming your comments collection is named 'comments'
                localField: '_id',
                foreignField: 'post', // Assuming the comment model has a field 'post' that references the post
                as: 'comments'
            }
        },
        {
            $addFields: {
                commentCount: { $size: '$comments' } // Add a field for the number of comments
            }
        },
        {
            $lookup: {
                from: 'users', // Assuming your users collection is named 'users'
                localField: 'author',
                foreignField: '_id',
                as: 'authorDetails'
            }
        },
        {
            $unwind: {
                path: '$authorDetails',
                preserveNullAndEmptyArrays: true // Optional: if you want to keep posts without authors
            }
        },
        {
            $addFields: {
                authorUsername: '$authorDetails.username',
                authorProfilePic: '$authorDetails.profilePic'
            }
        },
        {
            $sort: { commentCount: -1 } // Sort by comment count in descending order
        },
        {
            $limit: 10 // Limit to top 10 popular posts, adjust as needed
        },
        {
            $project: {
                title: 1,
                content: 1,
                createdAt: 1,
                imageUrl: 1,
                commentCount: 1,
                authorUsername: 1,
                authorProfilePic: 1 // Include the author's profile picture
            }
        }
    ])
    .then(posts => res.status(200).send(posts))
    .catch(err => errorHandler(err, req, res));
}; 