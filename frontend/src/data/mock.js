export const mockData = {
  announcements: [
    {
      id: 1,
      title: "Server Maintenance Complete",
      content: "All servers have been successfully updated with the latest security patches and performance improvements. Downtime was minimal and all systems are now operational.",
      timestamp: "2025-01-14T10:30:00Z",
      type: "maintenance",
      author: "Admin Team",
      pinned: true
    },
    {
      id: 2,
      title: "Monthly Tournament Results",
      content: "Congratulations to all participants in our January tournament! Winners will receive their rewards within 24 hours. Check the leaderboard for final standings.",
      timestamp: "2025-01-13T18:45:00Z",
      type: "tournament",
      author: "Tournament Manager",
      pinned: false
    },
    {
      id: 3,
      title: "New Map Release: Cyber District",
      content: "Experience the latest battleground in our cyberpunk universe. Features include dynamic weather, destructible environments, and new tactical opportunities.",
      timestamp: "2025-01-12T14:20:00Z",
      type: "update",
      author: "Development Team",
      pinned: false
    },
    {
      id: 4,
      title: "Community Event: Double XP Weekend",
      content: "This weekend enjoy double experience points across all game modes. Perfect time to level up your characters and unlock new equipment!",
      timestamp: "2025-01-11T09:15:00Z",
      type: "event",
      author: "Community Team",
      pinned: false
    },
    {
      id: 5,
      title: "Anti-Cheat System Update",
      content: "We've deployed enhanced anti-cheat measures to ensure fair gameplay for everyone. Report any suspicious activity through our support system.",
      timestamp: "2025-01-10T16:00:00Z",
      type: "security",
      author: "Security Team",
      pinned: false
    }
  ],

  reviews: [
    {
      id: 1,
      username: "CyberWarrior_X",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CyberWarrior_X",
      rating: 5,
      comment: "Best gaming community I've ever joined! Great servers, active moderation, and amazing events.",
      timestamp: "2025-01-13T20:30:00Z",
      likes: 23
    },
    {
      id: 2,
      username: "NeonGhost",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NeonGhost",
      rating: 4,
      comment: "Love the cyberpunk theme and the community is very welcoming. Could use more European servers though.",
      timestamp: "2025-01-13T15:45:00Z",
      likes: 18
    },
    {
      id: 3,
      username: "PixelHunter",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PixelHunter",
      rating: 5,
      comment: "Incredible tournaments and prizes! The anti-cheat system works perfectly. Highly recommend!",
      timestamp: "2025-01-12T22:10:00Z",
      likes: 31
    },
    {
      id: 4,
      username: "RetroRunner",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=RetroRunner",
      rating: 4,
      comment: "Solid gaming experience with good community management. The new maps are fantastic!",
      timestamp: "2025-01-12T11:20:00Z",
      likes: 12
    }
  ],

  discord: {
    serverName: "ProjectTest Official",
    onlineMembers: 156,
    totalMembers: 2847,
    channels: [
      { name: "general-chat", memberCount: 45, active: true },
      { name: "game-discussion", memberCount: 32, active: true },
      { name: "tournaments", memberCount: 18, active: false },
      { name: "tech-support", memberCount: 7, active: false },
      { name: "announcements", memberCount: 89, active: false }
    ],
    recentMessages: [
      {
        username: "GameMaster",
        message: "Tournament signups are now open!",
        timestamp: "2 minutes ago"
      },
      {
        username: "TechNinja",
        message: "Anyone else experiencing lag on Server 3?",
        timestamp: "5 minutes ago"
      },
      {
        username: "CyberPunk_2077",
        message: "GG everyone, great match!",
        timestamp: "8 minutes ago"
      }
    ]
  },

  socialMedia: [
    { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com/projecttest', followers: '1.2K' },
    { name: 'Telegram', icon: 'send', url: 'https://t.me/projecttest', followers: '856' },
    { name: 'TikTok', icon: 'music', url: 'https://tiktok.com/@projecttest', followers: '3.4K' }
  ]
};