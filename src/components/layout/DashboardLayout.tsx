"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
// Button component removed - using native button elements
import Image from "next/image";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { FaHome, FaSearch, FaPeopleArrows } from "react-icons/fa";
import { RiUserCommunityFill, RiAccountCircleFill } from "react-icons/ri";
import { BsFillPassportFill } from "react-icons/bs";
import { MdLeaderboard, MdAttachMoney, MdLogout, MdSchedule } from "react-icons/md";
import { SiSession } from "react-icons/si";
import { GiTeacher } from "react-icons/gi";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Initialize sidebar state from localStorage to prevent flash
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebarCollapsed");
      return savedState !== null ? JSON.parse(savedState) : false;
    }
    return false;
  });
  const [isHovering, setIsHovering] = useState(false);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSidebarMouseEnter = () => {
    if (sidebarCollapsed) {
      setIsHovering(true);
    }
  };

  const handleSidebarMouseLeave = () => {
    setIsHovering(false);
  };

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (user && !user.isOnboardingComplete) {
      router.push('/onboarding-simplified');
    }
  }, [user, router]);

  const isSidebarExpanded = !sidebarCollapsed || isHovering;

  const navigation = useMemo(
    () => {
      // Check if user is a working professional (any type that includes "professional")
      const isWorkingProfessional = user?.userType?.includes("professional");
      
      if (isWorkingProfessional) {
        // Navigation for working professionals (who can be mentors)
        return [
          { name: "Home", href: "/dashboard", icon: <FaHome /> },
          {
            name: "Community",
            href: "/dashboard/community",
            icon: <RiUserCommunityFill />,
          },
          {
            name: "Mentors",
            href: "/dashboard/mentors",
            icon: <FaPeopleArrows />,
          },
                  {
                    name: "Become a Mentor",
                    href: "/dashboard/mentor-setup",
                    icon: <GiTeacher />,
                  },
                  {
                    name: "My Profile",
                    href: "/dashboard/mentor-profile",
                    icon: <RiUserCommunityFill />,
                  },
          {
            name: "My Schedule",
            href: "/dashboard/mentor-schedule",
            icon: <MdSchedule />,
          },
          {
            name: "Sessions",
            href: "/dashboard/sessions",
            icon: <SiSession />,
          },
          {
            name: "Earnings",
            href: "/dashboard/earnings",
            icon: <MdAttachMoney />,
          },
        ];
      } else {
        // Navigation for students/freshers
        return [
          { name: "Home", href: "/dashboard", icon: <FaHome /> },
          { name: "Explore", href: "/dashboard/explore", icon: <FaSearch /> },
          {
            name: "Community",
            href: "/dashboard/community",
            icon: <RiUserCommunityFill size={25} />,
          },
          {
            name: "Mentors",
            href: "/dashboard/mentors",
            icon: <FaPeopleArrows />,
          },
          {
            name: "Portfolio",
            href: "/dashboard/portfolio",
            icon: <BsFillPassportFill />,
          },
          {
            name: "Leaderboard",
            href: "/dashboard/leaderboard",
            icon: <MdLeaderboard />,
          },
        ];
      }
    },
    [user?.userType]
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Left Sidebar - Modern Design */}
      <div
        className={`fixed left-0 top-0 z-50 bg-black shadow-xl transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarExpanded ? "w-52" : "w-20"
        } h-screen`}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            {isSidebarExpanded && (
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-xl font-bold text-white">Sahay</h1>
                  {/* <p className="text-xs text-white">Learning Platform</p> */}
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-xl hover:bg-white transition-all duration-200 group"
            >
              {sidebarCollapsed || isHovering ? (
                <ChevronsRight className="w-5 h-5 text-white group-hover:text-gray-900 transition-colors" />
              ) : (
                <ChevronsLeft className="w-5 h-5 text-white group-hover:text-gray-900 transition-colors" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 w-full flex flex-col gap-4 px-4 mt-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center mx-auto w-full rounded-xl ${
                    !isSidebarExpanded ? "justify-center" : "justify-start"
                  } ${
                    isActive
                      ? "text-black hover:text-gray-900 bg-gray-200 rounded-xl"
                      : "text-white hover:bg-green-50 hover:text-gray-900 hover:shadow-md"
                  }`}
                  title={!isSidebarExpanded ? item.name : undefined}
                >
                  <div
                    className={`flex items-center group justify-center w-8 h-8 rounded-xl transition-all duration-300 ${
                      isActive
                        ? " text-black "
                        : "text-white hover:text-gray-900"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  {isSidebarExpanded && (
                    <span className="ml-4 font-semibold">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="py-4 border-t border-gray-100">
            <Link href="/dashboard/profile">
              <div className="flex items-center  hover:bg-gray-50 rounded-2xl cursor-pointer transition-all duration-300 group relative">
                {isSidebarExpanded && (
                  <div className=" flex items-center justify-center gap-2 px-3 py-2">
                    <Image
                      className="w-10 h-10 rounded-full ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-300"
                      src={
                        user?.avatar ||
                        `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`
                      }
                      alt={user?.name || ""}
                      width={40}
                      height={40}
                    />
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-white truncate">
                        @{user?.username || user?.name?.toLowerCase().replace(/\s+/g, "")}
                      </p>
                    </div>
                  </div>
                )}
              {!isSidebarExpanded && (
                <div className="flex items-center justify-center px-3 my-2 mx-auto">
                  <RiAccountCircleFill className="text-white" size={30} />
                </div>
              )}
              </div>
            </Link>
            
            {/* Points Display */}
            {isSidebarExpanded && (
              <div className="px-3 mt-3">
                <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-2 rounded-xl border border-yellow-200">
                  <span className="text-yellow-600">⭐</span>
                  <span className="text-gray-800 font-bold text-sm">
                    {user?.points || 0} points
                  </span>
                </div>
              </div>
            )}
            
            {!isSidebarExpanded && (
              <div className="flex items-center justify-center px-3 mt-2">
                <div className="flex items-center justify-center space-x-1 bg-gradient-to-r from-yellow-50 to-orange-50 px-2 py-1 rounded-lg border border-yellow-200">
                  <span className="text-yellow-600 text-sm">⭐</span>
                  <span className="text-gray-800 font-bold text-xs">
                    {user?.points || 0}
                  </span>
                </div>
              </div>
            )}
            <div className="px-3">
              {isSidebarExpanded && (
                <button
                  onClick={handleLogout}
                  className="w-full mt-3 p-2 text-xs border border-gray-200 text-white rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
                >
                  <span className="mr-2">
                    <MdLogout size={20} />
                  </span>
                  Sign Out
                </button>
              )}
              {!isSidebarExpanded && (
                <button
                  onClick={handleLogout}
                  className="w-full mt-3 p-2 text-xs border border-gray-200 text-white rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300 group relative"
                  title="Sign Out"
                >
                  <span className="text-lg">
                    <MdLogout />
                  </span>
                  <div className="absolute top-0 left-20  bg-gray-900 text-white rounded-xl px-4 py-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                    Sign Out
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col lg:flex-row min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarExpanded ? "lg:ml-52" : "ml-20"
          }`}
        >
          {/* Center Content Feed */}
          <div className="flex-1 bg-gray-50/30">
            {/* Mobile Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <h1 className="text-lg font-bold text-black">Sahay</h1>
              </div>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-2 rounded-2xl border border-yellow-200">
                <span className="text-yellow-600">⭐</span>
                <span className="text-black font-bold text-sm">
                  {user?.points || 0}
                </span>
              </div>
            </div>

            {/* Page Content */}
            <main className="min-h-screen px-4 py-4 bg-black">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
