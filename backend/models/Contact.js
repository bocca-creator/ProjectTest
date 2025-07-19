const mongoose = require('mongoose');
const crypto = require('crypto');

const ContactSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // Optional - for registered users
    }
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['general', 'technical', 'account', 'report', 'appeal', 'suggestion', 'billing'],
      message: '{VALUE} is not a valid ticket category'
    }
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: {
      values: ['open', 'in-progress', 'waiting-response', 'resolved', 'closed'],
      message: '{VALUE} is not a valid ticket status'
    },
    default: 'open'
  },
  assignedTo: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    role: String,
    assignedAt: {
      type: Date,
      default: Date.now
    }
  },
  responses: [{
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
    message: {
      type: String,
      required: [true, 'Response message is required'],
      maxlength: [2000, 'Response cannot exceed 2000 characters']
    },
    isStaffResponse: {
      type: Boolean,
      default: false
    },
    attachments: [{
      filename: String,
      url: String,
      size: Number,
      contentType: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: {
      type: String,
      enum: ['website', 'email', 'discord', 'api'],
      default: 'website'
    },
    referrer: String,
    browserInfo: String
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  internalNotes: [{
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String,
      role: String
    },
    note: {
      type: String,
      maxlength: [1000, 'Internal note cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  escalation: {
    isEscalated: {
      type: Boolean,
      default: false
    },
    escalatedAt: Date,
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    escalationReason: String,
    escalationLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      maxlength: [500, 'Satisfaction feedback cannot exceed 500 characters']
    },
    submittedAt: Date
  },
  resolvedAt: Date,
  closedAt: Date,
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate ticket ID
ContactSchema.pre('save', function(next) {
  if (!this.ticketId) {
    // Generate ticket ID: PT-YYYYMMDD-XXXXX
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.ticketId = `PT-${date}-${random}`;
  }
  
  // Update last activity
  this.lastActivityAt = new Date();
  
  next();
});

// Indexes for better query performance
ContactSchema.index({ ticketId: 1 });
ContactSchema.index({ 'user.email': 1 });
ContactSchema.index({ 'user.userId': 1 });
ContactSchema.index({ status: 1, priority: -1 });
ContactSchema.index({ category: 1, createdAt: -1 });
ContactSchema.index({ 'assignedTo.id': 1, status: 1 });
ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ lastActivityAt: -1 });
ContactSchema.index({ 'escalation.isEscalated': 1 });

// Virtual field for response count
ContactSchema.virtual('responseCount').get(function() {
  return this.responses.length;
});

// Virtual field for time since creation
ContactSchema.virtual('timeOpen').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 24) {
    return `${hours} hours`;
  } else {
    return `${days} days`;
  }
});

// Virtual field for time since last activity
ContactSchema.virtual('timeSinceLastActivity').get(function() {
  const now = new Date();
  const diff = now - this.lastActivityAt;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
  } else if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
});

// Method to add response
ContactSchema.methods.addResponse = async function(author, message, isStaffResponse = false, attachments = []) {
  this.responses.push({
    author: {
      id: author._id,
      username: author.username,
      role: author.role
    },
    message,
    isStaffResponse,
    attachments
  });
  
  // Update status if needed
  if (isStaffResponse && this.status === 'open') {
    this.status = 'in-progress';
  } else if (!isStaffResponse && this.status === 'waiting-response') {
    this.status = 'in-progress';
  }
  
  this.lastActivityAt = new Date();
  
  return await this.save();
};

// Method to assign ticket
ContactSchema.methods.assignTo = async function(user) {
  this.assignedTo = {
    id: user._id,
    username: user.username,
    role: user.role,
    assignedAt: new Date()
  };
  
  if (this.status === 'open') {
    this.status = 'in-progress';
  }
  
  this.lastActivityAt = new Date();
  
  return await this.save();
};

// Method to update status
ContactSchema.methods.updateStatus = async function(newStatus, userId) {
  const oldStatus = this.status;
  this.status = newStatus;
  this.lastActivityAt = new Date();
  
  if (newStatus === 'resolved' && oldStatus !== 'resolved') {
    this.resolvedAt = new Date();
  } else if (newStatus === 'closed' && oldStatus !== 'closed') {
    this.closedAt = new Date();
  }
  
  return await this.save();
};

// Method to escalate ticket
ContactSchema.methods.escalate = async function(escalatedBy, reason, level = 1) {
  this.escalation = {
    isEscalated: true,
    escalatedAt: new Date(),
    escalatedBy,
    escalationReason: reason,
    escalationLevel: level
  };
  
  // Increase priority if not already urgent
  if (this.priority !== 'urgent') {
    const priorityLevels = ['low', 'normal', 'high', 'urgent'];
    const currentIndex = priorityLevels.indexOf(this.priority);
    this.priority = priorityLevels[Math.min(currentIndex + 1, 3)];
  }
  
  this.lastActivityAt = new Date();
  
  return await this.save();
};

// Method to add internal note
ContactSchema.methods.addInternalNote = async function(author, note) {
  this.internalNotes.push({
    author: {
      id: author._id,
      username: author.username,
      role: author.role
    },
    note
  });
  
  this.lastActivityAt = new Date();
  
  return await this.save();
};

// Method to add satisfaction rating
ContactSchema.methods.addSatisfactionRating = async function(rating, feedback = '') {
  this.satisfaction = {
    rating,
    feedback,
    submittedAt: new Date()
  };
  
  return await this.save();
};

// Method to get expected response time
ContactSchema.methods.getExpectedResponseTime = function() {
  const responseTimeMap = {
    urgent: '2-6 hours',
    high: '12-24 hours',
    normal: '1-2 days',
    low: '3-5 days'
  };
  
  return responseTimeMap[this.priority] || '1-2 days';
};

// Method to get public ticket data (for user)
ContactSchema.methods.getPublicData = function() {
  return {
    ticketId: this.ticketId,
    subject: this.subject,
    message: this.message,
    category: this.category,
    priority: this.priority,
    status: this.status,
    responses: this.responses.filter(response => !response.isStaffResponse || response.author.role !== 'internal'),
    expectedResponseTime: this.getExpectedResponseTime(),
    timeOpen: this.timeOpen,
    timeSinceLastActivity: this.timeSinceLastActivity,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    resolvedAt: this.resolvedAt
  };
};

// Static method to get tickets with pagination
ContactSchema.statics.getTickets = async function(options = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    category,
    priority,
    assignedTo,
    userId,
    email,
    escalated,
    sortBy = 'lastActivityAt',
    sortOrder = -1
  } = options;

  const filter = {};
  
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (assignedTo) filter['assignedTo.id'] = assignedTo;
  if (userId) filter['user.userId'] = userId;
  if (email) filter['user.email'] = email;
  if (escalated !== undefined) filter['escalation.isEscalated'] = escalated;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder;

  const tickets = await this.find(filter)
    .sort(sortOptions)
    .limit(limit)
    .skip((page - 1) * limit)
    .populate('user.userId', 'username avatar')
    .populate('assignedTo.id', 'username role')
    .select('-internalNotes'); // Exclude internal notes from general queries

  const total = await this.countDocuments(filter);

  return {
    tickets,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Static method to get ticket statistics
ContactSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalTickets: { $sum: 1 },
        openTickets: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        inProgressTickets: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        resolvedTickets: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        closedTickets: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        urgentTickets: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
        escalatedTickets: { $sum: { $cond: ['$escalation.isEscalated', 1, 0] } }
      }
    }
  ]);

  const categoryStats = await this.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  return {
    overall: stats[0] || {
      totalTickets: 0,
      openTickets: 0,
      inProgressTickets: 0,
      resolvedTickets: 0,
      closedTickets: 0,
      urgentTickets: 0,
      escalatedTickets: 0
    },
    byCategory: categoryStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };
};

module.exports = mongoose.model('Contact', ContactSchema);