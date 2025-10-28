'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

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
  } | null;
  answers: Answer[];
  upvotes: number;
  createdAt: string;
  views?: number;
}

interface Answer {
  _id?: string;
  content: string;
  userId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  upvotes: number;
  createdAt: string;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    body: '',
    tags: [] as string[],
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState('All');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});

  const availableTags = [
    'React', 'JavaScript', 'Python', 'Node.js', 'CSS', 'HTML', 
    'TypeScript', 'Next.js', 'Database', 'API', 'Git', 'Deployment',
    'MongoDB', 'Express', 'Vue', 'Angular', 'Docker', 'AWS'
  ];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadQuestions();
  }, [user, router]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/community-questions');
      if (!response.ok) throw new Error('Failed to fetch questions');
      
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostQuestion = async () => {
    if (!user || !newPost.title.trim() || !newPost.body.trim()) {
      alert('Please fill in title and body');
      return;
    }

    try {
      const response = await fetch('/api/community-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPost.title,
          body: newPost.body,
          tags: selectedTags,
          askedBy: user._id,
        }),
      });

      if (!response.ok) throw new Error('Failed to post question');

      setNewPost({ title: '', body: '', tags: [] });
      setSelectedTags([]);
      setShowPostForm(false);
      await loadQuestions();
    } catch (error) {
      console.error('Failed to post question:', error);
      alert('Failed to post question. Please try again.');
    }
  };

  const handleUpvote = async (questionId: string) => {
    try {
      const response = await fetch(`/api/community-questions/${questionId}/upvote`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to upvote');
      await loadQuestions();
    } catch (error) {
      console.error('Failed to upvote:', error);
    }
  };

  const handleComment = async (questionId: string) => {
    const content = commentText[questionId]?.trim();
    if (!content || !user) {
      console.log('Comment validation failed:', { content, user });
      return;
    }

    try {
      console.log('Posting comment to question:', questionId);
      const response = await fetch(`/api/community-questions/${questionId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          userId: user._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Comment failed:', errorData);
        throw new Error('Failed to comment');
      }

      setCommentText({ ...commentText, [questionId]: '' });
      await loadQuestions();
      console.log('Comment posted successfully');
    } catch (error) {
      console.error('Failed to comment:', error);
      alert('Failed to post comment. Please try again.');
    }
  };

  const handleCommentUpvote = async (questionId: string, answerId: string) => {
    console.log('Upvoting comment:', { questionId, answerId });
    // Placeholder for comment upvote - you can implement this later
    alert('Comment upvote feature coming soon!');
  };

  const toggleComments = (questionId: string) => {
    console.log('Toggling comments for question:', questionId);
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const getUserDisplay = (userData: { firstName?: string; lastName?: string; email?: string } | null | undefined) => {
    if (!userData) return 'Unknown User';
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    return userData.email?.split('@')[0] || 'User';
  };

  const getUserInitial = (userData: { firstName?: string; email?: string } | null | undefined) => {
    if (!userData) return 'U';
    if (userData.firstName) return userData.firstName.charAt(0).toUpperCase();
    if (userData.email) return userData.email.charAt(0).toUpperCase();
    return 'U';
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return past.toLocaleDateString();
  };

  const filteredQuestions = questions.filter(q => {
    if (filterTag !== 'All' && !q.tags.includes(filterTag)) return false;
    return true;
  });

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="w-full mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">CodeCommunity</h1>
            
            {/* Tag Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterTag('All')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  filterTag === 'All'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {availableTags.slice(0, 8).map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    filterTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full mx-auto px-4 py-6"> 
          {/* Post Question Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            {!showPostForm ? (
              <button
                onClick={() => setShowPostForm(true)}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
              >
                What&apos;s your coding question?
              </button>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Question title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-4 py-3 text-lg font-semibold border-0 focus:ring-0 focus:outline-none"
                />
                
                <textarea
                  placeholder="Describe your question in detail..."
                  value={newPost.body}
                  onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                  className="w-full px-4 py-3 border-0 focus:ring-0 focus:outline-none resize-none"
                  rows={4}
                />

                {/* Tag Selection */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Add tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowPostForm(false);
                      setNewPost({ title: '', body: '', tags: [] });
                      setSelectedTags([]);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePostQuestion}
                    disabled={!newPost.title.trim() || !newPost.body.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Post Question
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Questions Feed */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions yet</h3>
              <p className="text-gray-600 mb-6">Be the first to ask a question!</p>
              <button
                onClick={() => setShowPostForm(true)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700"
              >
                Ask Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => {
                const isExpanded = expandedQuestion === question._id;
                console.log('Rendering question:', {
                  id: question._id,
                  title: question.title,
                  isExpanded,
                  expandedQuestion
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
                      <button
                        onClick={() => handleUpvote(question._id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span className="font-medium">{question.upvotes || 0}</span>
                        <span className="text-sm">Upvote</span>
                      </button>

                      <button
                        onClick={() => toggleComments(question._id)}
                        className={`flex items-center gap-2 transition-colors group ${
                          expandedQuestion === question._id
                            ? 'text-green-600'
                            : 'text-gray-600 hover:text-green-600'
                        }`}
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="font-medium">{question.answers?.length || 0}</span>
                        <span className="text-sm">{expandedQuestion === question._id ? 'Hide' : 'Comment'}</span>
                      </button>

                      <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors group">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span className="text-sm">Share</span>
                      </button>
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
                              value={commentText[question._id] || ''}
                              onChange={(e) => setCommentText({ ...commentText, [question._id]: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows={2}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                  handleComment(question._id);
                                }
                              }}
                            />
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">Press Ctrl+Enter to submit</span>
                              <button
                                onClick={() => handleComment(question._id)}
                                disabled={!commentText[question._id]?.trim()}
                                className="px-4 py-1.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                Post Answer
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Existing Comments */}
                      <div className="p-4 space-y-4">
                        {question.answers && question.answers.length > 0 ? (
                          question.answers.map((answer, idx) => (
                            <div key={idx} className="flex gap-3 bg-white p-4 rounded-lg border border-gray-200">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {getUserInitial(answer.userId)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900 text-sm">
                                    {getUserDisplay(answer.userId)}
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    {getTimeAgo(answer.createdAt)}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                  {answer.content}
                                </p>
                                <div className="flex items-center gap-4">
                                  <button 
                                    onClick={() => handleCommentUpvote(question._id, answer._id || '')}
                                    className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors text-xs font-medium group"
                                  >
                                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                    <span>{answer.upvotes || 0}</span>
                                    <span>Upvote</span>
                                  </button>
                                  <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    <span>Reply</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">No answers yet. Be the first to answer!</p>
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
