const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      required: true
    }
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Review comment must be at least 10 characters'],
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: {
      values: ['general', 'servers', 'community', 'events', 'support'],
      message: '{VALUE} is not a valid review category'
    },
    default: 'general'
  },
  metadata: {
    gameMode: {
      type: String,
      trim: true,
      maxlength: [50, 'Game mode cannot exceed 50 characters']
    },
    serverName: {
      type: String,
      trim: true,
      maxlength: [100, 'Server name cannot exceed 100 characters']
    },
    platform: {
      type: String,
      enum: ['PC', 'PlayStation', 'Xbox', 'Mobile', 'Other'],
      default: 'PC'
    },
    playtime: {
      type: Number, // in hours
      min: [0, 'Playtime cannot be negative']
    }
  },
  engagement: {
    likes: {
      type: Number,
      default: 0
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    helpful: {
      type: Number,
      default: 0
    },
    helpfulBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    reports: {
      type: Number,
      default: 0
    },
    reportedBy: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: {
        type: String,
        enum: ['spam', 'inappropriate', 'fake', 'harassment', 'other']
      },
      reportedAt: {
        type: Date,
        default: Date.now
      }
    }],
    replies: [{
      user: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        username: String,
        avatar: String,
        role: String
      },
      message: {
        type: String,
        required: true,
        maxlength: [500, 'Reply cannot exceed 500 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  moderation: {
    isApproved: {
      type: Boolean,
      default: true
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    moderationReason: {
      type: String,
      maxlength: [200, 'Moderation reason cannot exceed 200 characters']
    },
    flagged: {
      type: Boolean,
      default: false
    },
    flaggedReason: String
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  edited: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    editHistory: [{
      content: String,
      rating: Number,
      editedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ReviewSchema.index({ 'user.id': 1, createdAt: -1 });
ReviewSchema.index({ rating: 1, isVisible: 1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ category: 1, rating: -1 });
ReviewSchema.index({ 'moderation.isApproved': 1, isVisible: 1 });
ReviewSchema.index({ featured: -1, rating: -1 });
ReviewSchema.index({ 'engagement.helpful': -1 });

// Virtual field for time ago
ReviewSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
  } else if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (days < 30) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else {
    return this.createdAt.toLocaleDateString();
  }
});

// Method to toggle like by user
ReviewSchema.methods.toggleLike = async function(userId) {
  const userIdStr = userId.toString();
  const likedIndex = this.engagement.likedBy.findIndex(id => id.toString() === userIdStr);
  
  if (likedIndex > -1) {
    this.engagement.likedBy.splice(likedIndex, 1);
    this.engagement.likes = Math.max(0, this.engagement.likes - 1);
  } else {
    this.engagement.likedBy.push(userId);
    this.engagement.likes += 1;
  }
  
  return await this.save();
};

// Method to toggle helpful by user
ReviewSchema.methods.toggleHelpful = async function(userId) {
  const userIdStr = userId.toString();
  const helpfulIndex = this.engagement.helpfulBy.findIndex(id => id.toString() === userIdStr);
  
  if (helpfulIndex > -1) {
    this.engagement.helpfulBy.splice(helpfulIndex, 1);
    this.engagement.helpful = Math.max(0, this.engagement.helpful - 1);
  } else {
    this.engagement.helpfulBy.push(userId);
    this.engagement.helpful += 1;
  }
  
  return await this.save();
};

// Method to add report
ReviewSchema.methods.addReport = async function(userId, reason) {
  // Check if user already reported
  const existingReport = this.engagement.reportedBy.find(
    report => report.userId.toString() === userId.toString()
  );
  
  if (!existingReport) {
    this.engagement.reportedBy.push({ userId, reason });
    this.engagement.reports += 1;
    
    // Auto-flag if reports exceed threshold
    if (this.engagement.reports >= 5) {
      this.moderation.flagged = true;
      this.moderation.flaggedReason = `Automatically flagged due to ${this.engagement.reports} reports`;
    }
    
    return await this.save();
  }
  
  return this;
};

// Method to add reply
ReviewSchema.methods.addReply = async function(user, message) {
  this.engagement.replies.push({
    user: {
      id: user._id,
      username: user.username,
      avatar: user.avatar,
      role: user.role
    },
    message
  });
  
  return await this.save();
};

// Method to edit review
ReviewSchema.methods.editReview = async function(newContent, newRating) {
  // Save edit history
  this.edited.editHistory.push({
    content: this.comment,
    rating: this.rating
  });
  
  // Update content
  this.comment = newContent;
  this.rating = newRating;
  this.edited.isEdited = true;
  this.edited.editedAt = new Date();
  
  return await this.save();
};

// Method to check if user has interacted with review
ReviewSchema.methods.getUserInteractions = function(userId) {
  const userIdStr = userId.toString();
  return {
    liked: this.engagement.likedBy.some(id => id.toString() === userIdStr),
    helpful: this.engagement.helpfulBy.some(id => id.toString() === userIdStr),
    reported: this.engagement.reportedBy.some(report => report.userId.toString() === userIdStr)
  };
};

// Method to get public review data
ReviewSchema.methods.getPublicData = function(userId = null) {
  const data = {
    id: this._id,
    user: this.user,
    rating: this.rating,
    comment: this.comment,
    category: this.category,
    metadata: this.metadata,
    engagement: {
      likes: this.engagement.likes,
      helpful: this.engagement.helpful,
      reports: this.engagement.reports,
      repliesCount: this.engagement.replies.length
    },
    timeAgo: this.timeAgo,
    featured: this.featured,
    edited: {
      isEdited: this.edited.isEdited,
      editedAt: this.edited.editedAt
    },
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };

  if (userId) {
    data.userInteractions = this.getUserInteractions(userId);
  }

  return data;
};

// Static method to get approved reviews with pagination
ReviewSchema.statics.getApproved = async function(options = {}) {
  const { 
    page = 1, 
    limit = 10, 
    category,
    rating,
    featured,
    sortBy = 'createdAt',
    sortOrder = -1,
    userId 
  } = options;

  const filter = { 
    isVisible: true,
    'moderation.isApproved': true
  };

  if (category) filter.category = category;
  if (rating) filter.rating = rating;
  if (featured !== undefined) filter.featured = featured;
  if (userId) filter['user.id'] = userId;

  const sortOptions = {};
  if (featured !== undefined) {
    sortOptions.featured = -1; // Featured reviews first
  }
  sortOptions[sortBy] = sortOrder;

  const reviews = await this.find(filter)
    .sort(sortOptions)
    .limit(limit)
    .skip((page - 1) * limit)
    .populate('user.id', 'username avatar role')
    .lean();

  const total = await this.countDocuments(filter);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Static method to get review statistics
ReviewSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $match: { 
        isVisible: true,
        'moderation.isApproved': true
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        totalLikes: { $sum: '$engagement.likes' },
        totalHelpful: { $sum: '$engagement.helpful' },
        featuredCount: { $sum: { $cond: ['$featured', 1, 0] } }
      }
    }
  ]);

  // Rating distribution
  const ratingStats = await this.aggregate([
    { 
      $match: { 
        isVisible: true,
        'moderation.isApproved': true
      }
    },
    { 
      $group: { 
        _id: '$rating', 
        count: { $sum: 1 } 
      } 
    },
    { $sort: { _id: -1 } }
  ]);

  // Category distribution
  const categoryStats = await this.aggregate([
    { 
      $match: { 
        isVisible: true,
        'moderation.isApproved': true
      }
    },
    { 
      $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      } 
    }
  ]);

  return {
    overall: stats[0] || {
      totalReviews: 0,
      avgRating: 0,
      totalLikes: 0,
      totalHelpful: 0,
      featuredCount: 0
    },
    ratingDistribution: ratingStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    categoryStats: categoryStats.reduce((acc, item) => {
      acc[item._id] = {
        count: item.count,
        avgRating: item.avgRating
      };
      return acc;
    }, {})
  };
};

// Static method to get featured reviews
ReviewSchema.statics.getFeatured = async function(limit = 5) {
  return await this.find({
    isVisible: true,
    'moderation.isApproved': true,
    featured: true
  })
    .sort({ rating: -1, 'engagement.helpful': -1 })
    .limit(limit)
    .populate('user.id', 'username avatar role');
};

module.exports = mongoose.model('Review', ReviewSchema);