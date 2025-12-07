import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  ThumbsUp,
  Send,
  Search,
  Filter,
  User,
  Clock,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface ForumReply {
  id: string;
  author: string;
  authorEmail: string;
  content: string;
  date: string;
  likes: number;
}

interface ForumPost {
  id: string;
  author: string;
  authorEmail: string;
  title: string;
  content: string;
  date: string;
  likes: number;
  category: string;
  replies: ForumReply[];
}

const CommunityForum = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "General",
  });
  const [replyContent, setReplyContent] = useState("");
  const [activePost, setActivePost] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [likedReplies, setLikedReplies] = useState<string[]>([]);

  const categories = [
    "All",
    "General",
    "Caregiving Tips",
    "Medication",
    "Mental Health",
    "Support",
    "Resources",
  ];

  // Load posts and likes from localStorage
  useEffect(() => {
    const savedPosts = localStorage.getItem("forumPosts");
    const savedLikes = localStorage.getItem("forumLikes");
    const savedReplyLikes = localStorage.getItem("forumReplyLikes");

    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts));
      } catch (error) {
        console.error("Error loading posts:", error);
        setPosts(getDefaultPosts());
      }
    } else {
      setPosts(getDefaultPosts());
    }

    if (savedLikes) {
      try {
        setLikedPosts(JSON.parse(savedLikes));
      } catch (error) {
        console.error("Error loading likes:", error);
      }
    }

    if (savedReplyLikes) {
      try {
        setLikedReplies(JSON.parse(savedReplyLikes));
      } catch (error) {
        console.error("Error loading reply likes:", error);
      }
    }
  }, []);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem("forumPosts", JSON.stringify(posts));
    }
  }, [posts]);

  // Save likes to localStorage
  useEffect(() => {
    localStorage.setItem("forumLikes", JSON.stringify(likedPosts));
  }, [likedPosts]);

  useEffect(() => {
    localStorage.setItem("forumReplyLikes", JSON.stringify(likedReplies));
  }, [likedReplies]);

  const getDefaultPosts = (): ForumPost[] => [
    {
      id: "1",
      author: "Priya Sharma",
      authorEmail: "priya@example.com",
      title:
        "बुजुर्गों की दवाई का ध्यान कैसे रखें? | Managing Medication for Elderly",
      content:
        "मुझे अपनी मां की 5 अलग-अलग दवाइयों का ध्यान रखना पड़ता है। कभी-कभी भूल जाती हूं। क्या कोई आसान तरीका है? I need to manage 5 different medications for my mother. Sometimes I forget. Is there an easy way?",
      date: new Date().toISOString(),
      likes: 12,
      category: "Medication",
      replies: [
        {
          id: "1-1",
          author: "Rajesh Kumar",
          authorEmail: "rajesh@example.com",
          content:
            "मैं weekly pill organizer use करता हूं। बहुत helpful है! और phone पर reminder भी set कर सकते हैं।",
          date: new Date().toISOString(),
          likes: 5,
        },
        {
          id: "1-2",
          author: "Anjali Verma",
          authorEmail: "anjali@example.com",
          content:
            "Sahayata app में reminder feature है! Try करें। Very useful for medication schedules.",
          date: new Date().toISOString(),
          likes: 8,
        },
      ],
    },
    {
      id: "2",
      author: "Amit Patel",
      authorEmail: "amit@example.com",
      title: "Dealing with Caregiver Burnout - Need Advice",
      content:
        "I have been caring for my father for 2 years now. Lately, I feel exhausted all the time. How do other caregivers manage stress?",
      date: new Date(Date.now() - 86400000).toISOString(),
      likes: 18,
      category: "Mental Health",
      replies: [
        {
          id: "2-1",
          author: "Dr. Sneha Reddy",
          authorEmail: "sneha@example.com",
          content:
            "Self-care is crucial! Take breaks, even if short. Join support groups and don't hesitate to ask family for help.",
          date: new Date(Date.now() - 86400000).toISOString(),
          likes: 10,
        },
      ],
    },
    {
      id: "3",
      author: "Meena Singh",
      authorEmail: "meena@example.com",
      title: "Best Wheelchair Accessible Home Modifications",
      content:
        "Looking for suggestions on making my home more wheelchair-friendly for my mother. What modifications helped you the most?",
      date: new Date(Date.now() - 172800000).toISOString(),
      likes: 7,
      category: "Caregiving Tips",
      replies: [],
    },
  ];

  const handleAddPost = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) {
        alert("Please login to post");
        return;
      }
      if (newPost.title && newPost.content) {
        const post: ForumPost = {
          id: Date.now().toString(),
          author: user.fullName || "Anonymous User",
          authorEmail: user.email,
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          date: new Date().toISOString(),
          likes: 0,
          replies: [],
        };
        setPosts([post, ...posts]);
        setNewPost({ title: "", content: "", category: "General" });
      }
    },
    [newPost, posts, user]
  );

  const handleAddReply = useCallback(
    (postId: string) => {
      if (!user) {
        alert("Please login to reply");
        return;
      }
      if (replyContent.trim()) {
        const reply: ForumReply = {
          id: Date.now().toString(),
          author: user.fullName || "Anonymous User",
          authorEmail: user.email,
          content: replyContent,
          date: new Date().toISOString(),
          likes: 0,
        };

        setPosts(
          posts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                replies: [...post.replies, reply],
              };
            }
            return post;
          })
        );

        setReplyContent("");
      }
    },
    [replyContent, posts, user]
  );

  const handleLikePost = useCallback(
    (postId: string) => {
      if (!user) {
        alert("Please login to like posts");
        return;
      }

      if (likedPosts.includes(postId)) {
        // Unlike
        setLikedPosts(likedPosts.filter((id) => id !== postId));
        setPosts(
          posts.map((post) =>
            post.id === postId
              ? { ...post, likes: Math.max(0, post.likes - 1) }
              : post
          )
        );
      } else {
        // Like
        setLikedPosts([...likedPosts, postId]);
        setPosts(
          posts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          )
        );
      }
    },
    [likedPosts, posts, user]
  );

  const handleLikeReply = useCallback(
    (postId: string, replyId: string) => {
      if (!user) {
        alert("Please login to like replies");
        return;
      }

      const likeKey = `${postId}-${replyId}`;

      if (likedReplies.includes(likeKey)) {
        // Unlike
        setLikedReplies(likedReplies.filter((key) => key !== likeKey));
        setPosts(
          posts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                replies: post.replies.map((reply) =>
                  reply.id === replyId
                    ? { ...reply, likes: Math.max(0, reply.likes - 1) }
                    : reply
                ),
              };
            }
            return post;
          })
        );
      } else {
        // Like
        setLikedReplies([...likedReplies, likeKey]);
        setPosts(
          posts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                replies: post.replies.map((reply) =>
                  reply.id === replyId
                    ? { ...reply, likes: reply.likes + 1 }
                    : reply
                ),
              };
            }
            return post;
          })
        );
      }
    },
    [likedReplies, posts, user]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-rose-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Community Forum
            </h1>
          </div>
          <div className="text-sm text-gray-600">
            {user ? `Welcome, ${user.fullName}` : "Login to participate"}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent appearance-none bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Create New Post */}
        {user && (
          <form
            onSubmit={handleAddPost}
            className="mb-8 bg-gray-50 rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Start a Discussion</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Discussion Title"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
                <select
                  value={newPost.category}
                  onChange={(e) =>
                    setNewPost({ ...newPost, category: e.target.value })
                  }
                  className="border rounded-lg p-3 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  {categories
                    .filter((c) => c !== "All")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>
              <textarea
                placeholder="Share your thoughts, ask questions, or start a discussion..."
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                rows={4}
                required
              />
              <button
                type="submit"
                className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition-colors"
              >
                Post Discussion
              </button>
            </div>
          </form>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No discussions found. Start a new one!</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-700 mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(post.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      likedPosts.includes(post.id)
                        ? "text-rose-600 font-medium"
                        : "text-gray-500 hover:text-rose-600"
                    }`}
                  >
                    <ThumbsUp
                      className={`h-5 w-5 ${
                        likedPosts.includes(post.id) ? "fill-current" : ""
                      }`}
                    />
                    <span>{post.likes}</span>
                  </button>
                  <button
                    onClick={() =>
                      setActivePost(activePost === post.id ? null : post.id)
                    }
                    className="flex items-center gap-2 text-gray-500 hover:text-rose-600 transition-colors"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>{post.replies.length} Replies</span>
                  </button>
                </div>

                {/* Replies Section */}
                {activePost === post.id && (
                  <div className="mt-6 pl-6 border-l-2 border-gray-200 space-y-4">
                    {post.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 mb-2">{reply.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{reply.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(reply.date)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleLikeReply(post.id, reply.id)}
                            className={`flex items-center gap-1 text-sm transition-colors ${
                              likedReplies.includes(`${post.id}-${reply.id}`)
                                ? "text-rose-600 font-medium"
                                : "text-gray-500 hover:text-rose-600"
                            }`}
                          >
                            <ThumbsUp
                              className={`h-4 w-4 ${
                                likedReplies.includes(`${post.id}-${reply.id}`)
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                            <span>{reply.likes}</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {user && (
                      <div className="flex gap-2 mt-4">
                        <input
                          type="text"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddReply(post.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddReply(post.id)}
                          disabled={!replyContent.trim()}
                          className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityForum;
