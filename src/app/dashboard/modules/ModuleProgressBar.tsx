import React from "react";

interface ModuleData {
  name: string;
  description: string;
  level: string;
  totalLessons: number;
}

interface Progress {
  completionPercentage: number;
  completedLessonCount: number;
  pointsEarned: number;
}

interface ModuleProgressBarProps {
  moduleData: ModuleData | null;
  progress: Progress | null;
}

export default function ModuleProgressBar({
  moduleData,
  progress,
}: ModuleProgressBarProps) {
  if (!moduleData) return null;

  return (
    <div className="fixed bottom-0 right-0 bg-gray-900 border-t border-gray-800 shadow-lg transition-all duration-300 z-30 lg:left-52 left-0">
      <div className="w-full mx-auto px-3 sm:px-6 lg:px-10 py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
              <h1 className="text-xs sm:text-sm font-semibold text-white truncate">
                {moduleData.name}
              </h1>
              <span
                className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium uppercase tracking-wider flex-shrink-0 ${
                  moduleData.level === "Beginner"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : moduleData.level === "Intermediate"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {moduleData.level}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">
              {moduleData.description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-800">
          <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1.5 sm:mb-2">
            <span className="text-gray-500">Module Progress</span>
            <span className="text-white font-medium">
              {progress?.completionPercentage || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1 sm:h-1.5">
            <div
              className="bg-white h-1 sm:h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${progress?.completionPercentage || 0}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] text-gray-500">
            <span>
              {progress?.completedLessonCount || 0}/{moduleData.totalLessons}{" "}
              lessons
            </span>
            <span className="text-amber-400">
              {progress?.pointsEarned || 0} pts earned
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
