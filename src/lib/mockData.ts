export const trendingPosts = [
  {
    id: "1",
    title: "I replaced my entire content team with AI writing tools - here's what happened after 6 months",
    subreddit: "r/Entrepreneur",
    upvotes: 2847,
    comments: 412,
    link: "#",
    timestamp: "2h ago",
    growth: "+340%",
  },
  {
    id: "2",
    title: "Why are all Shopify apps so expensive now? $50/mo for basic features is insane",
    subreddit: "r/shopify",
    upvotes: 1923,
    comments: 287,
    link: "#",
    timestamp: "4h ago",
    growth: "+180%",
  },
  {
    id: "3",
    title: "Best protein supplements that don't taste like chalk? Budget friendly options",
    subreddit: "r/fitness",
    upvotes: 1456,
    comments: 523,
    link: "#",
    timestamp: "6h ago",
    growth: "+95%",
  },
  {
    id: "4",
    title: "Remote jobs are drying up - anyone else noticing this trend in tech?",
    subreddit: "r/cscareerquestions",
    upvotes: 3201,
    comments: 891,
    link: "#",
    timestamp: "1h ago",
    growth: "+520%",
  },
  {
    id: "5",
    title: "I built a side project that makes $5K/mo - AMA about finding product-market fit on Reddit",
    subreddit: "r/SideProject",
    upvotes: 1102,
    comments: 198,
    link: "#",
    timestamp: "8h ago",
    growth: "+67%",
  },
];

export const aiInsights = [
  "Growing frustration with AI writing tool pricing — users want pay-per-use models instead of subscriptions",
  "Shopify merchants increasingly looking for open-source or self-hosted alternatives",
  "Remote work discussions shifting from 'how to find' to 'how to keep' remote positions",
  "Clean label and transparency are top priorities for supplement buyers in 2026",
  "Founders are using Reddit itself as a primary customer discovery channel",
];

export const painPoints = [
  { text: "AI tools are too expensive for solopreneurs", mentions: 342, sentiment: "negative" },
  { text: "Shopify app ecosystem has too many low-quality apps", mentions: 218, sentiment: "negative" },
  { text: "Hard to find truly remote-first companies", mentions: 456, sentiment: "negative" },
  { text: "Protein supplements have too many artificial ingredients", mentions: 189, sentiment: "negative" },
  { text: "No good tools to monitor Reddit discussions at scale", mentions: 127, sentiment: "negative" },
];

export const opportunities = [
  { text: "Build an affordable AI writing tool with usage-based pricing", score: 92 },
  { text: "Create a Shopify app marketplace with verified reviews", score: 87 },
  { text: "Remote job board focused on async-first companies", score: 84 },
  { text: "Clean protein brand with full ingredient transparency", score: 78 },
  { text: "Reddit monitoring SaaS for market research", score: 95 },
];

export const subredditData = [
  { name: "r/Entrepreneur", posts: 1240, relevance: 95 },
  { name: "r/SideProject", posts: 890, relevance: 88 },
  { name: "r/shopify", posts: 756, relevance: 82 },
  { name: "r/startups", posts: 634, relevance: 79 },
  { name: "r/cscareerquestions", posts: 521, relevance: 74 },
  { name: "r/fitness", posts: 445, relevance: 68 },
];

export const keywords = [
  { id: "1", keyword: "AI writing tools", posts: 2340, trend: "up" as const },
  { id: "2", keyword: "Shopify apps", posts: 1560, trend: "up" as const },
  { id: "3", keyword: "protein supplements", posts: 890, trend: "stable" as const },
  { id: "4", keyword: "remote jobs", posts: 3100, trend: "down" as const },
];
