const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  type: {
    type: String,
    required: [true, 'Announcement type is required'],
    enum: {
      values: ['maintenance', 'tournament', 'update', 'event', 'security', 'general'],
      message: '{VALUE} is not a valid announcement type'
    },
    default: 'general'
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    }
  },
  pinned: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  metadata: {
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'critical'],
      default: 'normal'
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters']
    },
    readTime: {
      type: Number, // in minutes
      default: function() {
        // Estimate reading time: ~200 words per minute
        const wordCount = this.content.split(/\s+/).length;
        return Math.max(1, Math.ceil(wordCount / 200));
      }
    }
  },
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    comments: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  scheduledFor: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  lastModifiedBy: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    modifiedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
AnnouncementSchema.index({ publishDate: -1, isPublished: 1 });
AnnouncementSchema.index({ type: 1, pinned: -1 });
AnnouncementSchema.index({ createdAt: -1 });
AnnouncementSchema.index({ 'author.id': 1 });
AnnouncementSchema.index({ pinned: -1, publishDate: -1 });
AnnouncementSchema.index({ tags: 1 });
AnnouncementSchema.index({ 'metadata.priority': 1 });

// Virtual field for formatted publish date
AnnouncementSchema.virtual('formattedPublishDate').get(function() {
  return this.publishDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual field for time ago
AnnouncementSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.publishDate;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
  } else if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (days < 7) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else {
    return this.publishDate.toLocaleDateString();
  }
});

// Method to increment view count
AnnouncementSchema.methods.incrementViews = function() {
  this.engagement.views += 1;
  return this.save();
};

// Method to toggle like by user
AnnouncementSchema.methods.toggleLike = async function(userId) {
  const userIdStr = userId.toString();
  const likedIndex = this.engagement.likedBy.findIndex(id => id.toString() === userIdStr);
  
  if (likedIndex > -1) {
    // User already liked, remove like
    this.engagement.likedBy.splice(likedIndex, 1);
    this.engagement.likes = Math.max(0, this.engagement.likes - 1);
  } else {
    // User hasn't liked, add like
    this.engagement.likedBy.push(userId);
    this.engagement.likes += 1;
  }
  
  return await this.save();
};

// Method to check if user has liked this announcement
AnnouncementSchema.methods.isLikedByUser = function(userId) {
  return this.engagement.likedBy.some(id => id.toString() === userId.toString());
};

// Method to get public announcement data
AnnouncementSchema.methods.getPublicData = function(userId = null) {
  const data = {
    id: this._id,
    title: this.title,
    content: this.content,
    type: this.type,
    author: this.author,
    pinned: this.pinned,
    tags: this.tags,
    metadata: this.metadata,
    engagement: {
      views: this.engagement.views,
      likes: this.engagement.likes,
      comments: this.engagement.comments,
      shares: this.engagement.shares
    },
    publishDate: this.publishDate,
    formattedPublishDate: this.formattedPublishDate,
    timeAgo: this.timeAgo,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };

  if (userId) {
    data.isLikedByUser = this.isLikedByUser(userId);
  }

  return data;
};

// Static method to get published announcements with pagination
AnnouncementSchema.statics.getPublished = async function(options = {}) {
  const { 
    page = 1, 
    limit = 10, 
    type, 
    pinned, 
    tags,
    priority,
    sortBy = 'publishDate',
    sortOrder = -1 
  } = options;

  const filter = { 
    isPublished: true,
    publishDate: { $lte: new Date() }
  };

  // Add optional filters
  if (type) filter.type = type;
  if (pinned !== undefined) filter.pinned = pinned;
  if (tags && tags.length) filter.tags = { $in: tags };
  if (priority) filter['metadata.priority'] = priority;

  // Handle expiry date
  filter.$or = [
    { expiryDate: { $exists: false } },
    { expiryDate: null },
    { expiryDate: { $gt: new Date() } }
  ];

  const sortOptions = {};
  if (pinned !== undefined) {
    sortOptions.pinned = -1; // Pinned items first
  }
  sortOptions[sortBy] = sortOrder;

  const announcements = await this.find(filter)
    .sort(sortOptions)
    .limit(limit)
    .skip((page - 1) * limit)
    .populate('author.id', 'username role avatar')
    .lean();

  const total = await this.countDocuments(filter);

  return {
    announcements,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Static method to get pinned announcements
AnnouncementSchema.statics.getPinned = async function() {
  return await this.find({ 
    isPublished: true, 
    pinned: true,
    publishDate: { $lte: new Date() },
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    ]
  })
    .sort({ publishDate: -1 })
    .populate('author.id', 'username role avatar');
};

// Static method to get announcement statistics
AnnouncementSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $match: { isPublished: true }
    },
    {
      $group: {
        _id: null,
        totalAnnouncements: { $sum: 1 },
        totalViews: { $sum: '$engagement.views' },
        totalLikes: { $sum: '$engagement.likes' },
        totalComments: { $sum: '$engagement.comments' },
        avgViewsPerAnnouncement: { $avg: '$engagement.views' },
        pinnedCount: { $sum: { $cond: ['$pinned', 1, 0] } }
      }
    }
  ]);

  const typeStats = await this.aggregate([
    { $match: { isPublished: true } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  return {
    overall: stats[0] || {
      totalAnnouncements: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      avgViewsPerAnnouncement: 0,
      pinnedCount: 0
    },
    byType: typeStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };
};

// Static method to search announcements
AnnouncementSchema.statics.searchAnnouncements = async function(query, options = {}) {
  const { page = 1, limit = 10, type, tags } = options;
  
  const searchFilter = {
    isPublished: true,
    publishDate: { $lte: new Date() },
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } }
    ]
  };

  if (type) searchFilter.type = type;
  if (tags && tags.length) searchFilter.tags = { $in: tags };

  const announcements = await this.find(searchFilter)
    .sort({ pinned: -1, publishDate: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .populate('author.id', 'username role avatar');

  const total = await this.countDocuments(searchFilter);

  return {
    announcements,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = mongoose.model('Announcement', AnnouncementSchema);