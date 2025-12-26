"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getAuthHeaders } from "@/lib/token-storage";
import { usePolling } from "@/hooks/usePolling";
import { Button, Input, IconButton, Arrow } from "../../../../packages/ui";
import { CompleteProfileModal, useProfileGating } from "@/components/CompleteProfileModal";

interface Question {
  _id: string;
  title: string;
  body: string;
  tags: string[];
  askedBy: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    isOnboardingComplete?: boolean;
    profileCompletionPercentage?: number;
  } | null;
  answers: Answer[];
  upvotes: number;
  upvotedBy?: string[]; // Array of user IDs who upvoted
  createdAt: string;
  views?: number;
}

interface Answer {
  _id?: string;
  content: string; // Comment/answer text content
  text?: string; // Legacy field name (for backward compatibility)
  userId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    isOnboardingComplete?: boolean;
    profileCompletionPercentage?: number;
  };
  upvotes: number;
  downvotes?: number;
  createdAt: string;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
    tags: [] as string[],
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState("All");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  
  // Profile gating for posting/commenting
  const { isProfileComplete, showModal, setShowModal, blockedAction, checkAndGate } = useProfileGating();
  
  // Helper to check if a user profile is verified
  const isUserVerified = (userData: { isOnboardingComplete?: boolean; profileCompletionPercentage?: number } | null | undefined): boolean => {
    if (!userData) return false;
    return userData.isOnboardingComplete === true || (userData.profileCompletionPercentage ?? 0) >= 100;
  };

  const availableTags = [
    "React",
    "JavaScript",
    "Python",
    "Node.js",
    "CSS",
    "HTML",
    "TypeScript",
    "Next.js",
    "Database",
    "API",
    "Git",
    "Deployment",
    "MongoDB",
    "Express",
    "Vue",
    "Angular",
    "Docker",
    "AWS",
  ];

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/community-questions", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch questions");

      const data = await response.json();
      const newQuestions = data.questions || [];

      // Only update state if data actually changed (compare by IDs and counts)
      setQuestions((prevQuestions) => {
        // Quick check: if counts or IDs are different, data changed
        if (
          prevQuestions.length !== newQuestions.length ||
          prevQuestions.some((q, idx) => {
            const newQ = newQuestions[idx];
            return (
              !newQ ||
              q._id !== newQ._id ||
              (q.answers?.length || 0) !== (newQ.answers?.length || 0) ||
              (q.upvotes || 0) !== (newQ.upvotes || 0)
            );
          })
        ) {
          return newQuestions;
        }
        return prevQuestions; // No change, keep previous state
      });

      return newQuestions;
    } catch (error) {
      console.error("Failed to load questions:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadQuestions();
  }, [user, router, loadQuestions]);

  // Auto-refetch every 30 seconds (reduced frequency to avoid unnecessary calls)
  usePolling(loadQuestions, {
    enabled: !!user,
    interval: 30000, // 30 seconds instead of 5
  });

  const handlePostQuestion = async () => {
    if (!user || !newPost.title.trim() || !newPost.body.trim()) {
      alert("Please fill in title and body");
      return;
    }

    try {
      const response = await fetch("/api/community-questions", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify({
          title: newPost.title,
          body: newPost.body,
          tags: selectedTags,
          askedBy: user._id,
        }),
      });

      if (!response.ok) throw new Error("Failed to post question");

      const data = await response.json();

      // Optimistically add new question to the top of the list
      if (data.success && data.question) {
        setQuestions((prevQuestions) => [data.question, ...prevQuestions]);
      }

      setNewPost({ title: "", body: "", tags: [] });
      setSelectedTags([]);
      setShowPostForm(false);
    } catch (error) {
      console.error("Failed to post question:", error);
      alert("Failed to post question. Please try again.");
    }
  };

  const handleUpvote = async (questionId: string) => {
    if (!user) return;

    // Optimistically update UI
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q._id === questionId
          ? {
              ...q,
              upvotes: (q.upvotes || 0) + 1,
              upvotedBy: [...(q.upvotedBy || []), user._id],
            }
          : q
      )
    );

    try {
      const response = await fetch(
        `/api/community-questions/${questionId}/upvote`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        // Revert optimistic update on error
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) =>
            q._id === questionId
              ? {
                  ...q,
                  upvotes: Math.max(0, (q.upvotes || 0) - 1),
                  upvotedBy: (q.upvotedBy || []).filter(
                    (id) => id !== user._id
                  ),
                }
              : q
          )
        );

        if (errorData.error?.includes("already upvoted")) {
          alert("You have already upvoted this question");
        } else {
          throw new Error("Failed to upvote");
        }
        return;
      }

      // Update with server response to ensure consistency
      const data = await response.json();
      if (data.success && data.question) {
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) => (q._id === questionId ? data.question : q))
        );
      }
    } catch (error) {
      console.error("Failed to upvote:", error);
      alert("Failed to upvote. Please try again.");
    }
  };

  const hasUserUpvoted = (question: Question): boolean => {
    if (!user || !question.upvotedBy) return false;
    return question.upvotedBy.includes(user._id);
  };

  const handleComment = async (questionId: string) => {
    const content = commentText[questionId]?.trim();
    if (!content || !user) {
      console.log("Comment validation failed:", { content, user });
      return;
    }
    
    // Gate commenting action - require complete profile
    if (!checkAndGate("post a comment")) {
      return;
    }

    // Optimistically add comment to UI immediately
    const optimisticComment: Answer = {
      content,
      userId: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email || "",
      },
      upvotes: 0,
      createdAt: new Date().toISOString(),
    };

    // Update the specific question's answers array without reloading all questions
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q._id === questionId
          ? {
              ...q,
              answers: [...(q.answers || []), optimisticComment],
            }
          : q
      )
    );

    // Clear the comment input immediately
    setCommentText({ ...commentText, [questionId]: "" });

    try {
      const response = await fetch(
        `/api/community-questions/${questionId}/comment`,
        {
          method: "POST",
          headers: getAuthHeaders({ "Content-Type": "application/json" }),
          credentials: "include",
          body: JSON.stringify({
            content,
            userId: user._id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Comment failed:", errorData);

        // Revert optimistic update on error
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) =>
            q._id === questionId
              ? {
                  ...q,
                  answers: q.answers.filter(
                    (a, idx) =>
                      idx !== q.answers.length - 1 || a.content !== content
                  ),
                }
              : q
          )
        );

        // Restore comment text
        setCommentText({ ...commentText, [questionId]: content });

        throw new Error("Failed to comment");
      }

      // On success, refetch only this question to get the actual comment with all fields
      const data = await response.json();
      if (data.success && data.question) {
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) => (q._id === questionId ? data.question : q))
        );
      }
    } catch (error) {
      console.error("Failed to comment:", error);
      alert("Failed to post comment. Please try again.");
    }
  };

  const handleCommentUpvote = async (questionId: string, answerId: string) => {
    console.log("Upvoting comment:", { questionId, answerId });
    // Placeholder for comment upvote - you can implement this later
    alert("Comment upvote feature coming soon!");
  };

  const toggleComments = (questionId: string) => {
    console.log("Toggling comments for question:", questionId);
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getUserDisplay = (
    userData:
      | { firstName?: string; lastName?: string; email?: string }
      | null
      | undefined
  ) => {
    if (!userData) return "Unknown User";
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    return userData.email?.split("@")[0] || "User";
  };

  const getUserInitial = (
    userData: { firstName?: string; email?: string } | null | undefined
  ) => {
    if (!userData) return "U";
    if (userData.firstName) return userData.firstName.charAt(0).toUpperCase();
    if (userData.email) return userData.email.charAt(0).toUpperCase();
    return "U";
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return past.toLocaleDateString();
  };

  const filteredQuestions = questions.filter((q) => {
    if (filterTag !== "All" && !q.tags.includes(filterTag)) return false;
    return true;
  });

  if (!user) return null;

  return (
    <DashboardLayout>
      {/* Profile Completion Modal */}
      <CompleteProfileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        blockedAction={blockedAction}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="w-full mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              CodeCommunity
            </h1>

            {/* Tag Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Button
                variant="text"
                onClick={() => setFilterTag("All")}
                className={`!px-4 !py-1.5 !rounded-full !text-sm !font-medium !transition-all !whitespace-nowrap ${
                  filterTag === "All"
                    ? "!bg-blue-600 !text-white"
                    : "!bg-gray-100 !text-gray-700 !hover:bg-gray-200"
                }`}
              >
                All
              </Button>
              {availableTags.slice(0, 8).map((tag) => (
                <Button
                  variant={filterTag === tag ? "contained" : "outlined"}
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    filterTag === tag
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full mx-auto px-4 py-6">
          {/* Post Question Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            {/* Profile completion notice */}
            {!isProfileComplete && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-700">
                <span>⚠️</span>
                <span>Complete your profile to post questions and comments</span>
              </div>
            )}
            
            {!showPostForm ? (
              <Button
                variant="text"
                onClick={() => {
                  // Gate posting action - require complete profile
                  if (checkAndGate("post a question")) {
                    setShowPostForm(true);
                  }
                }}
                className="!w-full !text-left !px-4 !py-3 !bg-gray-50 !hover:bg-gray-100 !rounded-lg !text-black !transition-colors"
              >
                What&apos;s your coding question?
              </Button>
            ) : (
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Question title..."
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  className="w-full px-4 py-3 text-lg font-semibold border-0 focus:ring-0 focus:outline-none"
                />

                <Input
                  placeholder="Describe your question in detail..."
                  value={newPost.body}
                  onChange={(e) =>
                    setNewPost({ ...newPost, body: e.target.value })
                  }
                  className="w-full px-4 py-3 border-0 focus:ring-0 focus:outline-none resize-none"
                  rows={4}
                />

                {/* Tag Selection */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Add tags:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Button
                        variant="text"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`!px-3 !py-1 !rounded-full !text-sm !font-medium !transition-all ${
                          selectedTags.includes(tag)
                            ? "!bg-blue-600 !text-white"
                            : "!bg-gray-100 !text-gray-700 !hover:bg-gray-200"
                        }`}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowPostForm(false);
                      setNewPost({ title: "", body: "", tags: [] });
                      setSelectedTags([]);
                    }}
                    className="!px-4 !py-2 !text-gray-600 !hover:text-gray-800 !font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handlePostQuestion}
                    disabled={!newPost.title.trim() || !newPost.body.trim()}
                    className="!px-6 !py-2  !bg-gradient-to-r !from-blue-600 !to-purple-600 !text-white !font-medium !hover:from-blue-700 !hover:to-purple-700 !disabled:opacity-50 !disabled:cursor-not-allowed !transition-all"
                  >
                    Post Question
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Questions Feed */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No questions yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to ask a question!
              </p>
              <Button
                variant="contained"
                onClick={() => setShowPostForm(true)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700"
              >
                Ask Question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => {
                const isExpanded = expandedQuestion === question._id;
                console.log("Rendering question:", {
                  id: question._id,
                  title: question.title,
                  isExpanded,
                  expandedQuestion,
                });

                return (
                  <div
                    key={question._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    {/* Question Header */}
                    <div className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {getUserInitial(question.askedBy)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">
                              {getUserDisplay(question.askedBy)}
                            </span>
                            {/* Unverified chip for incomplete profiles */}
                            {!isUserVerified(question.askedBy) && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                                unverified
                              </span>
                            )}
                            <span className="text-gray-500 text-sm">•</span>
                            <span className="text-gray-500 text-sm">
                              {getTimeAgo(question.createdAt)}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mt-2 mb-2">
                            {question.title}
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            {question.body}
                          </p>
                        </div>
                      </div>

                      {/* Tags */}
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {question.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                        <IconButton
                          onClick={() => handleUpvote(question._id)}
                          disabled={hasUserUpvoted(question)}
                          className={`!flex items-center gap-2 transition-colors group ${
                            hasUserUpvoted(question)
                              ? "!text-blue-600 cursor-not-allowed"
                              : "!text-gray-600 hover:!text-blue-600"
                          }`}
                        >
                          <Arrow />
                          <span className="font-medium">
                            {question.upvotes || 0}
                          </span>
                          <span className="text-sm">
                            {hasUserUpvoted(question) ? "Upvoted" : "Upvote"}
                          </span>
                        </IconButton>

                        <IconButton
                          onClick={() => toggleComments(question._id)}
                          className={`!flex !items-center !gap-2 !transition-colors !group ${
                            expandedQuestion === question._id
                              ? "!text-green-600"
                              : "!text-gray-600 hover:!text-green-600"
                          }`}
                        >
                          <span className="font-medium">
                            {question.answers?.length || 0}
                          </span>
                          <span className="text-sm">
                            {expandedQuestion === question._id
                              ? "Hide"
                              : "Comment"}
                          </span>
                        </IconButton>

                        <IconButton className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors group">
                          <svg
                            className="w-5 h-5 group-hover:scale-110 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                          </svg>
                          <span className="text-sm">Share</span>
                        </IconButton>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {expandedQuestion === question._id && (
                      <div className="border-t border-gray-100 bg-gray-50 animate-fadeIn">
                        {/* Comment Input */}
                        <div className="p-4 border-b border-gray-200 bg-white">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {getUserInitial(user)}
                            </div>
                            <div className="flex-1">
                              <textarea
                                placeholder="Write your answer..."
                                value={commentText[question._id] || ""}
                                onChange={(e) =>
                                  setCommentText({
                                    ...commentText,
                                    [question._id]: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={2}
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    (e.ctrlKey || e.metaKey)
                                  ) {
                                    handleComment(question._id);
                                  }
                                }}
                              />
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  Press Ctrl+Enter to submit
                                </span>
                                <Button
                                  onClick={() => handleComment(question._id)}
                                  disabled={!commentText[question._id]?.trim()}
                                  className="!px-4 !py-1.5 !bg-gradient-to-r !from-green-600 !to-teal-600 !text-white !rounded-lg !text-sm !font-medium !hover:!from-green-700 !hover:!to-teal-700 !disabled:!opacity-50 !disabled:!cursor-not-allowed !transition-all"
                                >
                                  Post Answer
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Existing Comments */}
                        <div className="p-4 space-y-4">
                          {question.answers && question.answers.length > 0 ? (
                            question.answers.map((answer, idx) => (
                              <div
                                key={idx}
                                className="flex gap-3 bg-white p-4 rounded-lg border border-gray-200"
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {getUserInitial(answer.userId)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900 text-sm">
                                      {getUserDisplay(answer.userId)}
                                    </span>
                                    {/* Unverified chip for incomplete profiles */}
                                    {!isUserVerified(answer.userId) && (
                                      <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                                        unverified
                                      </span>
                                    )}
                                    <span className="text-gray-500 text-xs">
                                      {getTimeAgo(answer.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                    {answer.content ||
                                      answer.text ||
                                      "No content"}
                                  </p>
                                  <div className="flex items-center gap-4">
                                    <IconButton
                                      onClick={() =>
                                        handleCommentUpvote(
                                          question._id,
                                          answer._id || ""
                                        )
                                      }
                                      className="!flex !items-center !gap-1 !text-gray-500 !hover:!text-blue-600 !transition-colors !text-xs !font-medium !group"
                                    >
                                      <svg
                                        className="w-4 h-4 group-hover:scale-110 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 15l7-7 7 7"
                                        />
                                      </svg>
                                      <span>{answer.upvotes || 0}</span>
                                      <span>Upvote</span>
                                    </IconButton>
                                    <IconButton className="!flex !items-center !gap-1 !text-gray-500 !hover:!text-gray-700 !text-xs">
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                        />
                                      </svg>
                                      <span>Reply</span>
                                    </IconButton>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <p className="text-sm">
                                No answers yet. Be the first to answer!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
