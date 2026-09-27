import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, BookOpen, GraduationCap, Flame, 
  Calendar, Edit3, Save, CheckCircle2, AlertCircle, 
  Sparkles, ShieldCheck, KeyRound, Hash, Camera, 
  Lock, Eye, EyeOff, Shield
} from 'lucide-react';
import { api, setStoredUser } from '../services/api';

export default function StudentProfile({ user, onRequireAuth, onUpdateUser }) {
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [savingBio, setSavingBio] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Active option in Edit Details section: 'profile' or 'password'
  const [activeTab, setActiveTab] = useState('profile');

  // Bio state
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  // Change Password state: Current + New + Confirm
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getProfile();
      setProfile(data);
      setBio(data.bio || '');
      setAvatar(data.avatar || '');
    } catch (err) {
      console.error(err);
      if (user) {
        setBio(user.bio || '');
        setAvatar(user.avatar || '');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image file size exceeds 5MB limit.');
      return;
    }

    setUploadingAvatar(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.uploadFile(file, 'avatar');
      setAvatar(res.file_url);

      const updatedUser = { ...(profile || user), avatar: res.file_url };
      setProfile(updatedUser);
      setStoredUser(updatedUser);
      if (onUpdateUser) onUpdateUser(updatedUser);

      setSuccessMsg('Profile picture updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBioSave = async (e) => {
    e.preventDefault();
    setSavingBio(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updated = await api.updateProfile({ bio: bio.trim() });
      setProfile(updated);
      setStoredUser(updated);
      if (onUpdateUser) onUpdateUser(updated);

      setSuccessMsg('Academic bio updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update bio.');
    } finally {
      setSavingBio(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }
    if (!newPassword) {
      setErrorMsg('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setErrorMsg('New password cannot be the same as your current password.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword, confirmPassword);
      setSuccessMsg(res.message || 'Password changed successfully! Please use your new password next time you sign in.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto border border-slate-200 bg-white shadow-xs">
        <User className="h-12 w-12 mx-auto text-indigo-600 mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Sign in to view Student Profile</h3>
        <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
          Access your registered college records, study streak metrics, and personal account settings.
        </p>
        <button
          onClick={onRequireAuth}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500">
        <Sparkles className="h-8 w-8 mx-auto text-indigo-600 animate-spin mb-3" />
        <span>Loading registered student records...</span>
      </div>
    );
  }

  const activeUser = profile || user;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Alert Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            {/* Avatar with Photo Upload */}
            <div className="relative group">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden" 
              />

              {activeUser.avatar ? (
                <img 
                  src={activeUser.avatar} 
                  alt={activeUser.name} 
                  className="h-20 w-20 rounded-2xl object-cover shadow-lg ring-4 ring-indigo-50 border border-slate-200"
                />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/25 ring-4 ring-indigo-50 shrink-0">
                  {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-semibold transition-opacity cursor-pointer"
                title="Change Profile Photo"
              >
                {uploadingAvatar ? (
                  <span className="animate-spin text-sm">⟳</span>
                ) : (
                  <>
                    <Camera className="h-5 w-5 mb-0.5" />
                    <span>Change</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {activeUser.name || 'Scholar Student'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeUser.role}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>College Registered</span>
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                {activeUser.email}
              </p>

              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-indigo-700 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                  <Hash className="h-3 w-3" /> Roll: {activeUser.roll_number || '2023/BCA/042'}
                </span>
                <span>•</span>
                <span>{activeUser.department}</span>
                <span>•</span>
                <span>Semester {activeUser.semester} (Sec {activeUser.section})</span>
              </div>
            </div>
          </div>

          {/* Quick Option Selectors */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('profile'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={() => { setActiveTab('password'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === 'password'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Change Password</span>
            </button>
          </div>

        </div>
      </div>

      {/* 4 Academic Metric Quick Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak Count */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Study Streak</span>
            <Flame className="h-5 w-5 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {activeUser.streak_count || 1} <span className="text-sm font-semibold text-slate-500">Days</span>
          </div>
          <div className="text-[10px] text-amber-600 font-medium mt-1">
            Personal Best: {activeUser.longest_streak || activeUser.streak_count || 1} Days
          </div>
        </div>

        {/* Current Semester */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Academic Level</span>
            <GraduationCap className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            Sem {activeUser.semester || 5}
          </div>
          <div className="text-[10px] text-indigo-600 font-medium mt-1">
            Section {activeUser.section || 'A'} • Verified Enrollment
          </div>
        </div>

        {/* Verification Status */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Account Status</span>
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">Verified</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">
            Institutional Registry Confirmed
          </div>
        </div>

        {/* Member Since */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Registration</span>
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            {activeUser.date_joined ? new Date(activeUser.date_joined).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '2025'}
          </div>
          <div className="text-[10px] text-purple-600 font-medium mt-1">
            College Academic Portal
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Official College Registry (Admin Controlled) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <span>College Registry Data</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold flex items-center gap-1">
                <Lock className="h-3 w-3 text-slate-400" />
                <span>Admin Managed</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Official academic fields are provisioned by college administration based on registered enrollment records.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Full Official Name</span>
                <span className="font-bold text-slate-800">{activeUser.name || 'Scholar Student'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Enrolled Program</span>
                <span className="font-bold text-slate-800">{activeUser.department}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Roll / University ID</span>
                <span className="font-mono font-bold text-indigo-700">{activeUser.roll_number || '2023/BCA/042'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Semester</span>
                  <span className="font-bold text-slate-800">Semester {activeUser.semester}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Section</span>
                  <span className="font-bold text-slate-800">Section {activeUser.section}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Information Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-slate-900">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Institutional Records Notice</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Official student academic credentials and department enrollments are synchronised directly with college records. For any corrections to your official name or roll number, please contact your department administration.
            </p>
          </div>
        </div>

        {/* Right Column: Edit Details Section with Separate Options */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-xs">
            
            {/* Separate Option Selector Pills */}
            <div className="flex items-center gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => { setActiveTab('profile'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile & Bio Details</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('password'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'password'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="h-4 w-4" />
                <span>Change Password</span>
              </button>
            </div>

            {/* OPTION 1: Profile & Bio Details */}
            {activeTab === 'profile' && (
              <div>
                <div className="pb-4 mb-5 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <User className="h-4 w-4 text-indigo-600" />
                    <span>Student Profile & Bio</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    View registered contact details and customize your personal academic bio.
                  </p>
                </div>

                <form onSubmit={handleBioSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Email (Read-Only) */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Email Address <span className="text-slate-400 font-normal">(College Login)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          disabled
                          value={activeUser.email}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed"
                        />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Contact Phone (College-Registered, Read-Only) */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Registered Phone Number <span className="text-slate-400 font-normal">(College Registry)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          disabled
                          value={activeUser.phone || 'Not provided in registry'}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed"
                        />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </div>

                  </div>

                  {/* Bio / Study Goals (Editable) */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Personal Academic Bio & Goals <span className="text-indigo-600 font-normal">• Editable</span>
                    </label>
                    <textarea
                      rows="4"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share your academic interests, focus areas, or project goals..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white leading-relaxed transition-colors"
                    />
                  </div>

                  {/* Save Bio Button */}
                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={savingBio}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {savingBio ? (
                        <span className="animate-spin text-sm">⟳ Saving...</span>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Bio</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* OPTION 2: Change Password (Dedicated 3-Field Flow) */}
            {activeTab === 'password' && (
              <div>
                <div className="pb-4 mb-5 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-indigo-600" />
                    <span>Change Account Password</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    To change your password, enter your current password followed by your new password and confirmation.
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  
                  {/* Current Password Field */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Current Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        required
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        tabIndex="-1"
                      >
                        {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password Field */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      New Password <span className="text-rose-500">*</span> <span className="text-slate-400 font-normal">(Min. 6 characters)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        required
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        tabIndex="-1"
                      >
                        {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password Field */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your new password to confirm"
                        required
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        tabIndex="-1"
                      >
                        {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Match Validation Indicator */}
                    {confirmPassword && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                        {newPassword === confirmPassword ? (
                          <span className="text-emerald-600 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                          </span>
                        ) : (
                          <span className="text-rose-600 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3.5 w-3.5" /> Passwords do not match
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setErrorMsg('');
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={changingPassword || (newPassword && confirmPassword && newPassword !== confirmPassword)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {changingPassword ? (
                        <span className="animate-spin text-sm">⟳ Updating...</span>
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4" />
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
