/**
 * Topic naming and default topics for Sahay (student/mentor roles).
 * Topics are used for FCM push notifications (e.g. user_123, mentors, students).
 */

export interface GetInitialTopicsOptions {
  role: string;
  userId: string;
  organizationId?: string | null;
}

/**
 * Default topics for all users: new courses, new mentors (50+ added).
 */
export const DEFAULT_TOPICS = ["new_courses", "new_mentors"] as const;

/**
 * Get topic name for mentor-specific notifications (booking schedules).
 */
export function getMentorTopic(mentorId: string): string {
  return `mentor_${mentorId}`;
}

/**
 * Get topic name for mentor booking notifications.
 */
export function getMentorBookingsTopic(mentorId: string): string {
  return `mentor_bookings_${mentorId}`;
}

/**
 * Get initial topics for a user based on their role.
 * Sahay uses: student, mentor (no organizationId).
 * Default: new_courses, new_mentors for everyone.
 */
export function getInitialTopicsForUser(
  options: GetInitialTopicsOptions
): string[] {
  const { role, userId } = options;
  const topics: string[] = [];

  // User-specific topic (for direct push to this user)
  topics.push(`user_${userId}`);

  // Default topics: new courses, new mentors
  topics.push(...DEFAULT_TOPICS);

  // Role-based topics
  if (role === "mentor") {
    topics.push("mentors");
    topics.push(getMentorBookingsTopic(userId));
  } else {
    topics.push("students");
  }

  return topics.filter(Boolean);
}

/**
 * Get topics for a specific module/course (optional, for future use).
 */
export function getModuleTopicsForUser(moduleId: string): string[] {
  return [`module_${moduleId}`];
}

/**
 * Validate topic name (alphanumeric + underscore).
 */
export function isValidTopicName(topic: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(topic) && topic.length > 0 && topic.length <= 900;
}
