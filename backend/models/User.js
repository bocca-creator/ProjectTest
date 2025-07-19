const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: function() {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.username}`;
    }
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  profile: {
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    steamId: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\d{17}$/.test(v);
        },
        message: 'Steam ID must be 17 digits'
      }
    },
    discordId: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\d{17,19}$/.test(v);
        },
        message: 'Discord ID must be 17-19 digits'
      }
    },
    preferences: {
      theme: {
        type: String,
        enum: ['darkNeon', 'retroPixel', 'minimalistLight', 'cyberRed'],
        default: 'darkNeon'
      },
      notifications: {
        type: Boolean,
        default: true
      },
      language: {
        type: String,
        enum: ['en', 'uk'],
        default: 'en'
      }
    }
  },
  stats: {
    commentsCount: {
      type: Number,
      default: 0
    },
    reviewsCount: {
      type: Number,
      default: 0
    },
    reputation: {
      type: Number,
      default: 0
    },
    totalLogins: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Indexes for better query performance
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastActive: -1 });
UserSchema.index({ 'stats.reputation': -1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to update last active timestamp
UserSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Method to increment login count
UserSchema.methods.incrementLoginCount = function() {
  this.stats.totalLogins += 1;
  this.lastActive = new Date();
  return this.save();
};

// Method to get public profile data (excluding sensitive information)
UserSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    avatar: this.avatar,
    role: this.role,
    joinDate: this.joinDate,
    lastActive: this.lastActive,
    profile: {
      bio: this.profile.bio,
      steamId: this.profile.steamId,
      discordId: this.profile.discordId
    },
    stats: this.stats,
    isActive: this.isActive
  };
};

// Method to get safe user data for JWT payload
UserSchema.methods.getJWTPayload = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    preferences: this.profile.preferences
  };
};

// Static method to get user statistics
UserSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        totalAdmins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        totalModerators: { $sum: { $cond: [{ $eq: ['$role', 'moderator'] }, 1, 0] } },
        totalRegularUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } },
        avgReputation: { $avg: '$stats.reputation' },
        totalReviews: { $sum: '$stats.reviewsCount' },
        totalComments: { $sum: '$stats.commentsCount' }
      }
    }
  ]);

  return stats[0] || {
    totalUsers: 0,
    totalAdmins: 0,
    totalModerators: 0,
    totalRegularUsers: 0,
    avgReputation: 0,
    totalReviews: 0,
    totalComments: 0
  };
};

// Static method to get recently active users
UserSchema.statics.getRecentlyActive = async function(limit = 10) {
  return await this.find({ isActive: true })
    .select('username avatar role lastActive')
    .sort({ lastActive: -1 })
    .limit(limit);
};

// Static method to search users
UserSchema.statics.searchUsers = async function(query, options = {}) {
  const { page = 1, limit = 20, role, isActive = true } = options;
  
  const searchFilter = {
    isActive,
    $or: [
      { username: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  };

  if (role) {
    searchFilter.role = role;
  }

  const users = await this.find(searchFilter)
    .select('username email avatar role joinDate lastActive stats')
    .sort({ reputation: -1, createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await this.countDocuments(searchFilter);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = mongoose.model('User', UserSchema);