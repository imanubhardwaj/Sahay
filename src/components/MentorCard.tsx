"use client";

import { useState } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { HiBadgeCheck, HiLightningBolt } from "react-icons/hi";
import { SKILL_ICONS } from "@/app/dashboard/mentors/constants";

// Company logo helper - uses Brandfetch API
const getCompanyLogo = (companyName: string): string => {
  // Convert company name to domain format
  // Remove special characters and spaces, convert to lowercase
  const normalizedName = companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "");

  // Construct domain (assume .com if no domain extension found)
  const domain = normalizedName.includes(".")
    ? normalizedName
    : `${normalizedName}.com`;

  // Brandfetch API URL
  return `https://cdn.brandfetch.io/${domain}/w/400/h/400/theme/dark/fallback/lettermark/type/icon`;
};

// Get skill icon
const getSkillIcon = (skill: string): string | null => {
  const normalizedSkill = skill.toLowerCase().trim();
  return SKILL_ICONS[normalizedSkill] || null;
};

// Skill badge with icon
function SkillBadge({
  skill,
  isMatching = false,
}: {
  skill: string;
  isMatching?: boolean;
}) {
  const icon = getSkillIcon(skill);

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
        transition-all duration-200 cursor-default
        ${
          isMatching
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 ring-1 ring-emerald-500/20"
            : "bg-slate-800/80 text-slate-300 border border-slate-700/50 hover:border-slate-600"
        }
      `}
      title={skill}
    >
      {icon ? (
        <Image
          src={icon}
          alt={skill}
          width={14}
          height={14}
          className="object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div
          className={`w-2 h-2 rounded-full ${
            isMatching ? "bg-emerald-400" : "bg-slate-500"
          }`}
        />
      )}
      <span className="truncate max-w-[80px]">{skill}</span>
    </div>
  );
}

// Company badge with logo
function CompanyBadge({ company }: { company: string; showName?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getCompanyLogo(company);

  return (
    <div
      className="flex items-center gap-2 rounded-lg  transition-all"
      title={company}
    >
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={company}
          width={24}
          height={24}
          className="rounded-sm object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-5 h-5 rounded bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
          {company.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

export interface MentorProfile {
  _id: string;
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    skills?: Array<{ _id: string; name: string }>;
  } | null;
  firstName?: string; // Direct name fields from MentorProfile
  lastName?: string;
  email?: string;
  avatar?: string;
  isMentor: boolean;
  isApproved: boolean;
  bio?: string;
  headline?: string;
  expertise?: string[];
  languages?: string[];
  yearsOfExperience?: number;
  currentRole?: string;
  currentCompany?: string;
  pastCompanies?: Array<{
    company: string;
    role: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
  }>;
  averageRating: number;
  totalReviews: number;
  completedSessions: number;
  zoomConnected: boolean;
  linkedIn?: string;
  twitter?: string;
  github?: string;
  website?: string;
  sessionTypes?: Array<{
    name: string;
    duration: number;
    price: number;
    description?: string;
  }>;
}

interface MentorCardProps {
  mentor: MentorProfile;
  onClick?: () => void;
  relevanceScore?: number;
  isMatchingSkill?: (skill: string) => boolean;
  showRelevanceBadge?: boolean;
  className?: string;
}

// Helper function to get mentor name
function getMentorName(mentor: MentorProfile): string {
  // Try direct fields first
  if (mentor.firstName && mentor.lastName) {
    return `${mentor.firstName} ${mentor.lastName}`;
  }
  // Try userId fields
  if (mentor.userId?.firstName && mentor.userId?.lastName) {
    return `${mentor.userId.firstName} ${mentor.userId.lastName}`;
  }
  // Fallback to headline/role
  return mentor.headline || mentor.currentRole || "Mentor";
}

export default function MentorCard({
  mentor,
  onClick,
  relevanceScore = 0,
  isMatchingSkill,
  showRelevanceBadge = false,
  className = "",
}: MentorCardProps) {
  const hasMatchingSkills = relevanceScore > 0;
  const matchingSkillFn = isMatchingSkill || (() => false);

  return (
    <div
      onClick={onClick}
      className={`
        relative bg-slate-900/60 border rounded-2xl p-6 
        transition-all duration-300 cursor-pointer group
        hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1
        ${
          hasMatchingSkills && showRelevanceBadge
            ? "border-emerald-500/30 hover:border-emerald-500/50"
            : "border-slate-800 hover:border-slate-700"
        }
        ${className}
      `}
    >
      {/* Relevance Badge */}
      {hasMatchingSkills && showRelevanceBadge && (
        <div className="absolute -top-2 -right-2 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full flex items-center gap-1 shadow-lg">
          <HiLightningBolt className="w-3 h-3" />
          {relevanceScore} match{relevanceScore > 1 ? "es" : ""}
        </div>
      )}

      {/* Avatar & Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <Image
            src={
              mentor.avatar ||
              mentor.userId?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                getMentorName(mentor)
              )}&background=6366f1&color=fff&bold=true`
            }
            alt=""
            width={64}
            height={64}
            className="w-16 h-16 rounded-xl ring-2 ring-slate-800 group-hover:ring-violet-500/50 transition-all object-cover"
          />
          {mentor.zoomConnected && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
              {getMentorName(mentor)}
            </h3>
            {mentor.averageRating >= 4.5 && (
              <HiBadgeCheck className="w-4 h-4 text-violet-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-slate-400 truncate">
            {mentor.headline || mentor.currentRole || "Mentor"}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <FaStar className="text-amber-400 w-3.5 h-3.5" />
            <span className="text-sm font-medium text-white">
              {mentor.averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">
              ({mentor.totalReviews} reviews)
            </span>
          </div>
        </div>
      </div>
      {/* Companies */}
      {(mentor.currentCompany ||
        (mentor.pastCompanies && mentor.pastCompanies.length > 0)) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {mentor.currentCompany && (
            <CompanyBadge company={mentor.currentCompany} />
          )}
          {mentor.pastCompanies && mentor.pastCompanies.length > 0 && (
            <>
              {mentor.pastCompanies.slice(0, 3).map((pastCompany, idx) => (
                <CompanyBadge
                  key={idx}
                  company={pastCompany.company}
                  showName={false}
                />
              ))}
              {mentor.pastCompanies.length > 3 && (
                <span className="text-xs text-slate-500 self-center">
                  +{mentor.pastCompanies.length - 3} more
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* Expertise/Skills */}
      {mentor.expertise && mentor.expertise.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {mentor.expertise.slice(0, 4).map((skill, idx) => (
            <SkillBadge
              key={idx}
              skill={skill}
              isMatching={showRelevanceBadge && matchingSkillFn(skill)}
            />
          ))}
          {mentor.expertise.length > 4 && (
            <span className="px-2 py-1 text-slate-500 text-xs">
              +{mentor.expertise.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-slate-400 pt-4 border-t border-slate-800/50">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
          {mentor.yearsOfExperience || 0}+ yrs
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          {mentor.completedSessions} sessions
        </span>
        {mentor.languages && mentor.languages.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            {mentor.languages[0]}
          </span>
        )}
      </div>

      {/* Price */}
      {mentor.sessionTypes && mentor.sessionTypes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
          <span className="text-slate-500 text-sm">Starting from</span>
          <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            {Math.min(...mentor.sessionTypes.map((s) => s.price))} pts
          </span>
        </div>
      )}
    </div>
  );
}

export { CompanyBadge, SkillBadge, getCompanyLogo, getSkillIcon };
