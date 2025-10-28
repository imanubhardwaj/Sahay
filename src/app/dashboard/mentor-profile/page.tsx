"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
// Button component removed - using native button elements
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Star, 
  Users, 
  Award,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface MentorProfile {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  isMentor: boolean;
  isApproved: boolean;
  bio?: string;
  headline?: string;
  expertise: string[];
  languages: string[];
  yearsOfExperience: number;
  currentRole?: string;
  currentCompany?: string;
  hourlyRate: number;
  sessionTypes: Array<{
    name: string;
    duration: number;
    price: number;
    description?: string;
  }>;
  linkedIn?: string;
  twitter?: string;
  github?: string;
  website?: string;
  zoomConnected: boolean;
  averageRating: number;
  totalReviews: number;
  completedSessions: number;
  totalEarnings: number;
  createdAt: string;
  updatedAt: string;
}

export default function MentorProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchMentorProfile();
    }
  }, [user?._id]);

  const fetchMentorProfile = async () => {
    try {
      const response = await fetch(`/api/mentor-profile?userId=${user?._id}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        console.log("No mentor profile found");
      }
    } catch (error) {
      console.error("Error fetching mentor profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Redirect to mentor setup page for editing
    window.location.href = "/dashboard/mentor-setup";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  No Mentor Profile Found
                </h2>
                <p className="text-gray-600 mb-6">
                  You haven&apos;t created a mentor profile yet. Start by setting up your profile to begin mentoring students.
                </p>
              </div>
              <button 
                onClick={() => window.location.href = "/dashboard/mentor-setup"}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg text-white font-medium"
              >
                Create Mentor Profile
              </button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Mentor Profile
            </h1>
            <p className="text-gray-600">
              Manage your mentor profile and showcase your expertise
            </p>
          </div>
          <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Edit className="h-4 w-4" />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile.userId.firstName?.[0]}{profile.userId.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">
                      {profile.userId.firstName} {profile.userId.lastName}
                    </CardTitle>
                    <p className="text-gray-600 mb-2">{profile.headline}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.currentCompany}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {profile.yearsOfExperience} years experience
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Bio */}
                {profile.bio && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">About Me</h3>
                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Expertise */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                {profile.languages.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((language, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Session Types */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Session Types</h3>
                  <div className="space-y-3">
                    {profile.sessionTypes.map((session, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{session.name}</h4>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-purple-600">
                              {session.price} points
                            </span>
                            <p className="text-sm text-gray-500">{session.duration} minutes</p>
                          </div>
                        </div>
                        {session.description && (
                          <p className="text-gray-600 text-sm">{session.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Social Links</h3>
                  <div className="flex flex-wrap gap-4">
                    {profile.linkedIn && (
                      <a 
                        href={profile.linkedIn} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                    {profile.twitter && (
                      <a 
                        href={profile.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Twitter
                      </a>
                    )}
                    {profile.github && (
                      <a 
                        href={profile.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                        GitHub
                      </a>
                    )}
                    {profile.website && (
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Mentor Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mentor Status</span>
                    <Badge variant={profile.isMentor ? "default" : "secondary"}>
                      {profile.isMentor ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Approval Status</span>
                    <Badge variant={profile.isApproved ? "default" : "secondary"}>
                      {profile.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Zoom Connected</span>
                    <div className="flex items-center gap-1">
                      {profile.zoomConnected ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {profile.zoomConnected ? "Connected" : "Not Connected"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{profile.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Reviews</span>
                    <span className="font-semibold">{profile.totalReviews}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed Sessions</span>
                    <span className="font-semibold">{profile.completedSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Earnings</span>
                    <span className="font-semibold text-green-600">
                      {profile.totalEarnings} points
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button 
                  className="w-full justify-start flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => window.location.href = "/dashboard/mentor-schedule"}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Schedule
                </button>
                <button 
                  className="w-full justify-start flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => window.location.href = "/dashboard/sessions"}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  View Sessions
                </button>
                <button 
                  className="w-full justify-start flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => window.location.href = "/dashboard/earnings"}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Earnings
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

