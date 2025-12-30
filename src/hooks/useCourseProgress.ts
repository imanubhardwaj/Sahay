import {
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
} from "@/lib/api-client";

export interface CourseProgress {
  _id: string;
  userId: string;
  courseId: {
    _id: string;
    name: string;
    description: string;
    level: string;
    duration: number;
  };
  currentLessonId: {
    _id: string;
    name: string;
    order: number;
  };
  currentLessonOrder: number;
  completedLessons: string[];
  totalLessons: number;
  progress: number;
  pointsEarned: number;
  status: "not_started" | "in_progress" | "completed";
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
}

export interface CourseProgressResponse {
  userProgress: {
    _id: string;
    userId: string;
    completedCourses: CourseProgress[];
    totalPointsEarned: number;
  };
  totalCourses: number;
  totalPoints: number;
  runningCourses: CourseProgress[];
  completedCourses: CourseProgress[];
}

export interface StartCourseData {
  userId: string;
  courseId: string;
  lessonId?: string;
}

export interface CompleteLessonData {
  userId: string;
  courseId: string;
  lessonId: string;
  pointsEarned?: number;
}

export const useCourseProgress = () => {
  /**
   * Get all course progress for a user
   * @param userId - User ID
   */
  const getUserCourseProgress = async (
    userId: string
  ): Promise<CourseProgressResponse> => {
    try {
      const response = await authenticatedGet<CourseProgressResponse>(
        `/api/user-course-progress?userId=${userId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching user course progress:", error);
      throw error;
    }
  };

  /**
   * Get specific course progress
   * @param userId - User ID
   * @param courseId - Course ID
   */
  const getCourseProgress = async (
    userId: string,
    courseId: string
  ): Promise<CourseProgress | null> => {
    try {
      const response = await authenticatedGet<{
        courseProgress: CourseProgress | null;
      }>(`/api/user-course-progress?userId=${userId}&courseId=${courseId}`);
      return response.courseProgress;
    } catch (error) {
      console.error("Error fetching course progress:", error);
      throw error;
    }
  };

  /**
   * Start a new course or update current lesson
   * @param data - Course start/update data
   */
  const startOrUpdateCourse = async (
    data: StartCourseData
  ): Promise<CourseProgress> => {
    try {
      const response = await authenticatedPost<{ progress: CourseProgress }>(
        "/api/user-course-progress",
        data
      );
      return response.progress;
    } catch (error) {
      console.error("Error starting/updating course:", error);
      throw error;
    }
  };

  /**
   * Complete a lesson and update course progress
   * @param data - Lesson completion data
   */
  const completeLesson = async (
    data: CompleteLessonData
  ): Promise<CourseProgress> => {
    try {
      const response = await authenticatedPut<{
        progress: CourseProgress;
        message: string;
      }>("/api/user-course-progress", data);
      return response.progress;
    } catch (error) {
      console.error("Error completing lesson:", error);
      throw error;
    }
  };

  interface Course {
    _id: string;
    [key: string]: unknown;
  }

  /**
   * Get running courses (courses with progress)
   * @param userId - User ID
   * @param allCourses - All available courses
   */
  const getRunningCourses = async (userId: string, allCourses: Course[]) => {
    try {
      const userProgressData = await getUserCourseProgress(userId);
      const progressMap: Record<string, CourseProgress> = {};

      userProgressData.userProgress.completedCourses.forEach((p) => {
        if (p.courseId && p.courseId._id) {
          progressMap[p.courseId._id] = p;
        }
      });

      const runningCourses = allCourses.filter((c) => progressMap[c._id]);
      const nonRunningCourses = allCourses.filter((c) => !progressMap[c._id]);

      return {
        runningCourses,
        nonRunningCourses,
        progressMap,
        totalPoints: userProgressData.totalPoints,
        totalCourses: userProgressData.totalCourses,
      };
    } catch (error) {
      console.error("Error getting running courses:", error);
      throw error;
    }
  };

  return {
    getUserCourseProgress,
    getCourseProgress,
    startOrUpdateCourse,
    completeLesson,
    getRunningCourses,
  };
};
