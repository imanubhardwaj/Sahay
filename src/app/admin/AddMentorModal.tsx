import { useEffect } from "react";
import { Button } from "../../../packages/ui";
import { Switch } from "../../../packages/ui";

interface AddMentorModalProps {
  showAddMentorModal: boolean;
  setShowAddMentorModal: (show: boolean) => void;
  newMentorEmail: string;
  setNewMentorEmail: (email: string) => void;
  newMentorFirstName: string;
  setNewMentorFirstName: (firstName: string) => void;
  newMentorLastName: string;
  setNewMentorLastName: (lastName: string) => void;
  newMentorLevel: "L1" | "L2" | "L3";
  setNewMentorLevel: (level: "L1" | "L2" | "L3") => void;
  newMentorHeadline: string;
  setNewMentorHeadline: (headline: string) => void;
  newMentorExpertise: string;
  setNewMentorExpertise: (expertise: string) => void;
  newMentorApproved: boolean;
  setNewMentorApproved: (approved: boolean) => void;
  addingMentor: boolean;
  handleAddMentor: () => void;
  getLevelColor: (level: "L1" | "L2" | "L3") => string;
}

export default function AddMentorModal({
  showAddMentorModal,
  setShowAddMentorModal,
  newMentorEmail,
  setNewMentorEmail,
  newMentorFirstName,
  setNewMentorFirstName,
  newMentorLastName,
  setNewMentorLastName,
  newMentorLevel,
  setNewMentorLevel,
  newMentorHeadline,
  setNewMentorHeadline,
  newMentorExpertise,
  setNewMentorExpertise,
  newMentorApproved,
  setNewMentorApproved,
  addingMentor,
  handleAddMentor,
  getLevelColor,
}: AddMentorModalProps) {
  useEffect(() => {
    if (showAddMentorModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showAddMentorModal]);
  if (!showAddMentorModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl h-[90vh] overflow-y-auto ">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>➕</span>
            Add New Mentor
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Add a mentor to the platform. If the user doesn&apos;t exist, a new account will be created.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* User Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={newMentorEmail}
              onChange={(e) => setNewMentorEmail(e.target.value)}
              placeholder="Enter mentor's email address"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              If the user doesn&apos;t have an account, one will be created automatically
            </p>
          </div>

          {/* Name Fields (for new users) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={newMentorFirstName}
                onChange={(e) => setNewMentorFirstName(e.target.value)}
                placeholder="First name"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={newMentorLastName}
                onChange={(e) => setNewMentorLastName(e.target.value)}
                placeholder="Last name"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 -mt-4">
            Optional: Used when creating a new user account
          </p>

          {/* Level Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Mentor Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["L1", "L2", "L3"] as const).map((level) => (
                <Button
                  key={level}
                  onClick={() => setNewMentorLevel(level)}
                  className={`!p-4 !rounded-xl !border-2 !transition-all !flex !flex-col !items-center ${
                    newMentorLevel === level
                      ? `${getLevelColor(level)} !border-transparent`
                      : "!border-slate-600 !bg-slate-700/50 !text-slate-300 !hover:border-slate-500"
                  }`}
                >
                  <div className="text-lg font-bold text-white">{level}</div>
                  <div className="text-xs mt-1 opacity-75 text-white">
                    {level === "L1"
                      ? "Elite"
                      : level === "L2"
                      ? "Top Tier"
                      : "Standard"}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Headline (optional)
            </label>
            <input
              type="text"
              value={newMentorHeadline}
              onChange={(e) => setNewMentorHeadline(e.target.value)}
              placeholder="e.g., Senior Engineer at Google"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Expertise */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Expertise (optional)
            </label>
            <input
              type="text"
              value={newMentorExpertise}
              onChange={(e) => setNewMentorExpertise(e.target.value)}
              placeholder="e.g., React, System Design, Interview Prep"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Comma-separated list of skills
            </p>
          </div>

          {/* Auto Approve */}
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
            <div>
              <label className="text-sm font-medium text-slate-300">
                Auto-approve mentor
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                If enabled, mentor will be immediately visible to students
              </p>
            </div>
            <Switch
              checked={newMentorApproved}
              onChange={() => setNewMentorApproved(!newMentorApproved)}
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <Button
            variant="outlined"
            onClick={() => {
              setShowAddMentorModal(false);
              setNewMentorEmail("");
              setNewMentorFirstName("");
              setNewMentorLastName("");
              setNewMentorLevel("L3");
              setNewMentorApproved(false);
              setNewMentorHeadline("");
              setNewMentorExpertise("");
            }}
            className="!px-5 !py-2.5 !rounded-lg !bg-slate-700 !text-slate-300 !hover:bg-slate-600 !transition-colors"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddMentor}
            disabled={addingMentor || !newMentorEmail.trim()}
            className="!px-5 !py-2.5 !rounded-lg !bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white !hover:from-emerald-700 !hover:to-teal-700 !transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {addingMentor && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            Add Mentor
          </Button>
        </div>
      </div>
    </div>
  );
}
