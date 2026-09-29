import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, BookOpen, GraduationCap, Flame, 
  Calendar, Edit3, Save, CheckCircle2, AlertCircle, 
  Sparkles, ShieldCheck, KeyRound, Hash, Camera, 
  Lock, Eye, EyeOff, Shield, ArrowLeft, X
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

  // Mode states:
  // isChangingPassword: true shows the Password Updation Form in that area
  // isEditingBio: true enables editing of the Bio and displays the Save Bio button
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);

  // Bio state
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  // Password fields
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
      // Add timestamp to ensure immediate browser refresh of the image
      const newAvatarUrl = `${res.file_url}?t=${Date.now()}`;
      setAvatar(newAvatarUrl);

      const updatedUser = { ...(profile || user), avatar: newAvatarUrl };
      setProfile(updatedUser);
      setStoredUser({ ...(profile || user), avatar: res.file_url });
      if (onUpdateUser) onUpdateUser({ ...(profile || user), avatar: res.file_url });

      setSuccessMsg('Profile picture updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      setIsEditingBio(false);
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
      setIsChangingPassword(false);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelPassword = () => {
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
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
  const isFaculty = activeUser.role === 'faculty';
  const isAdmin = activeUser.role === 'admin';

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
                  key={activeUser.avatar}
                  src={activeUser.avatar} 
                  alt={activeUser.name} 
                  className="h-20 w-20 rounded-2xl object-cover shadow-lg ring-4 ring-indigo-50 border border-slate-200"
                />
              ) : (
                <div className={`h-20 w-20 rounded-2xl ${
                  isAdmin
                    ? 'bg-linear-to-tr from-purple-700 via-indigo-700 to-slate-900 shadow-purple-500/25 ring-purple-50'
                    : isFaculty 
                    ? 'bg-linear-to-tr from-emerald-600 via-teal-600 to-indigo-600 shadow-emerald-500/25 ring-emerald-50' 
                    : 'bg-linear-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-indigo-500/25 ring-indigo-50'
                } flex items-center justify-center text-white font-extrabold text-2xl shadow-lg ring-4 shrink-0`}>
                  {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : (isAdmin ? 'A' : isFaculty ? 'F' : 'S')}
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
                  {activeUser.name || (isAdmin ? 'System Administrator' : isFaculty ? 'Faculty Instructor' : 'Scholar Student')}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  isAdmin
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : isFaculty 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {isAdmin ? 'System Administrator' : isFaculty ? 'Faculty Member' : activeUser.role}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  isAdmin 
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  <ShieldCheck className="h-3 w-3" />
                  <span>{isAdmin ? 'Root Clearance Verified' : isFaculty ? 'Faculty Registry Verified' : 'College Registered'}</span>
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                {activeUser.email}
              </p>

              {isAdmin ? (
                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-purple-700 font-semibold bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                    <Hash className="h-3 w-3" /> Admin ID: ADM-{String(activeUser.id || 1).padStart(4, '0')}
                  </span>
                  <span>•</span>
                  <span>System Administration & Institutional Oversight</span>
                  <span>•</span>
                  <span className="text-purple-700 font-medium">Root Access Controller</span>
                </div>
              ) : isFaculty ? (
                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    <Hash className="h-3 w-3" /> Faculty ID: FAC-{String(activeUser.id || 1).padStart(4, '0')}
                  </span>
                  <span>•</span>
                  <span>{activeUser.department}</span>
                  <span>•</span>
                  <span className="text-slate-700 font-medium">Course Instructor & Examiner</span>
                </div>
              ) : (
                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-indigo-700 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                    <Hash className="h-3 w-3" /> Roll: {activeUser.roll_number || '2412044050108'}
                  </span>
                  <span>•</span>
                  <span>{activeUser.department}</span>
                  <span>•</span>
                  <span>Semester {activeUser.semester} (Sec {activeUser.section})</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Metric Quick Cards */}
      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel rounded-2xl p-5 border border-purple-100 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase">Administrative Authority</span>
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-2 truncate">
              Institutional Governance
            </div>
            <div className="text-[10px] text-purple-700 font-medium mt-1">
              Full Control: User Accounts, Curriculum & Exam Blueprints
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-purple-100 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase">System Clearance Level</span>
              <ShieldCheck className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-2">
              Root Super Administrator
            </div>
            <div className="text-[10px] text-purple-700 font-medium mt-1">
              Platform Architecture, Telemetry & Multi-Semester Curriculum
            </div>
          </div>
        </div>
      ) : isFaculty ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase">Teaching Department</span>
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-2 truncate">
              {activeUser.department || 'Computer Application (BCA)'}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-1">
              Authorized Course Instructor & Question Paper Author
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase">Portal Role & Clearance</span>
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-2">
              Faculty / Examiner
            </div>
            <div className="text-[10px] text-indigo-600 font-medium mt-1">
              Exam Intake, AI Topic Mapping & Student Evaluation
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Official Registry Data (Admin Controlled) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className={`h-4 w-4 ${isAdmin ? 'text-purple-600' : 'text-indigo-600'}`} />
                <span>{isAdmin ? 'System Governance Records' : isFaculty ? 'Faculty Registry Records' : 'College Registry Data'}</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold flex items-center gap-1">
                <Lock className="h-3 w-3 text-slate-400" />
                <span>{isAdmin ? 'Root Clearance' : 'Admin Managed'}</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {isAdmin
                ? 'Master administrative parameters and global system access privileges for this account.'
                : isFaculty 
                ? 'Official faculty appointments and teaching permissions are managed by college administration.' 
                : 'Official academic fields are provisioned by college administration based on registered enrollment records.'}
            </p>

            {isAdmin ? (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                  <span className="text-[10px] uppercase font-bold text-purple-700 block mb-0.5">Admin Full Name</span>
                  <span className="font-bold text-slate-900">{activeUser.name || 'System Administrator'}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Department Assignment</span>
                  <span className="font-bold text-slate-800">System Administration & Oversight</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Administrative ID</span>
                  <span className="font-mono font-bold text-purple-700">ADM-{String(activeUser.id || 1).padStart(4, '0')}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Clearance Role</span>
                  <span className="font-bold text-slate-800">Super Administrator / Platform Root</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Account Status</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Active Institutional Superuser</span>
                  </span>
                </div>
              </div>
            ) : isFaculty ? (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Faculty Name</span>
                  <span className="font-bold text-slate-800">{activeUser.name || 'Faculty Member'}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Assigned Department</span>
                  <span className="font-bold text-slate-800">{activeUser.department}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Faculty / Employee ID</span>
                  <span className="font-mono font-bold text-emerald-700">FAC-{String(activeUser.id || 1).padStart(4, '0')}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Academic Designation</span>
                  <span className="font-bold text-slate-800">Course Instructor & Paper Setter</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">System Status</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Authorized Faculty Examiner</span>
                  </span>
                </div>
              </div>
            ) : (
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
                  <span className="font-mono font-bold text-indigo-700">{activeUser.roll_number || '2412044050108'}</span>
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
            )}
          </div>

          {/* Institutional Information Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-slate-900">
              <Shield className={`h-4 w-4 ${isAdmin ? 'text-purple-600' : 'text-emerald-600'}`} />
              <span>Institutional Governance Notice</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {isAdmin
                ? 'System administrator accounts hold full institutional jurisdiction over user roles, multi-semester BCA curriculum definitions, and exam blueprints.'
                : isFaculty 
                ? 'Official faculty credentials and department assignments are maintained by the Dean of Academics and institutional registry.' 
                : 'Official student academic credentials and department enrollments are synchronised directly with college records. For any corrections to your official name or roll number, please contact your department administration.'}
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Area */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white shadow-xs">
            
            {/* VIEW 1: Normally Shows Profile Details */}
            {!isChangingPassword ? (
              <div>
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <User className={`h-4 w-4 ${isAdmin ? 'text-purple-600' : 'text-indigo-600'}`} />
                      <span>{isAdmin ? 'System Administrator Profile & Governance' : isFaculty ? 'Faculty Profile & Settings' : 'Student Profile Details'}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isAdmin
                        ? 'Institutional contact information, system administrative responsibilities, and governance credentials.'
                        : isFaculty 
                        ? 'View institutional contact information and update your academic bio and research areas.' 
                        : 'View institutional contact information and customize your personal academic bio.'}
                    </p>
                  </div>

                  {/* Edit Details Action Button in Header */}
                  <div className="flex items-center gap-2">
                    {!isEditingBio ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingBio(true);
                          setErrorMsg('');
                          setSuccessMsg('');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isAdmin 
                            ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' 
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Details</span>
                      </button>
                    ) : (
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                        isAdmin 
                          ? 'text-purple-600 bg-purple-50 border-purple-200' 
                          : 'text-indigo-600 bg-indigo-50 border-indigo-200'
                      }`}>
                        Editing Active
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(true);
                        setIsEditingBio(false);
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    >
                      <KeyRound className={`h-3.5 w-3.5 ${isAdmin ? 'text-purple-600' : 'text-indigo-600'}`} />
                      <span>Change Password</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleBioSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Email (Read-Only) */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Email Address <span className="text-slate-400 font-normal">({isAdmin ? 'Superuser Login' : isFaculty ? 'Faculty Login' : 'College Login'})</span>
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

                  {/* Bio / Study Goals (Editable only when isEditingBio is true) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">
                        {isAdmin ? 'Administrative Bio & Operational Notes' : isFaculty ? 'Faculty Academic Bio & Teaching Philosophy' : 'Personal Academic Bio & Goals'}
                      </label>
                      {isEditingBio ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isAdmin ? 'text-purple-600 bg-purple-50' : 'text-indigo-600 bg-indigo-50'
                        }`}>
                          Editable
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          Click "Edit Details" to modify
                        </span>
                      )}
                    </div>

                    <textarea
                      rows="4"
                      disabled={!isEditingBio}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={isEditingBio 
                        ? (isAdmin ? "Share administrative notes, platform responsibilities, and institutional governance guidelines..." : isFaculty ? "Share your academic background, areas of expertise, research interests, and teaching approach..." : "Share your academic interests, focus areas, or project goals...") 
                        : (isAdmin ? "No administrative bio provided yet. Click 'Edit Details' to add notes." : "No academic bio provided yet. Click 'Edit Details' to add your bio.")}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl leading-relaxed transition-all ${
                        isEditingBio
                          ? isAdmin ? 'bg-white border-2 border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 shadow-xs' : 'bg-white border-2 border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 cursor-default'
                      }`}
                    />
                  </div>

                  {/* Save Bio Button & Cancel Button ONLY appear after clicking Edit Details */}
                  {isEditingBio && (
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingBio(false);
                          setBio(activeUser.bio || '');
                          setErrorMsg('');
                        }}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                      >
                        Cancel
                      </button>
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
                  )}
                </form>
              </div>
            ) : (
              /* VIEW 2: Shows Password Updation Form when Change Password is clicked */
              <div>
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-indigo-600" />
                      <span>Change Account Password</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify your current password, then enter and confirm your new password.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancelPassword}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
                    <span>Back to Details</span>
                  </button>
                </div>

                <form onSubmit={handlePasswordSubmit} autoComplete="off" className="space-y-4">
                  {/* Hidden inputs to divert aggressive browser auto-fill away from the real inputs */}
                  <input type="text" name="fake_user_field" className="hidden" tabIndex="-1" autoComplete="off" />
                  <input type="password" name="fake_password_field" className="hidden" tabIndex="-1" autoComplete="off" />

                  {/* Current Password Field */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Current Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        name="auth_current_security_code"
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck="false"
                        data-lpignore="true"
                        data-1p-ignore="true"
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
                        name="auth_new_security_code"
                        autoComplete="new-password"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck="false"
                        data-lpignore="true"
                        data-1p-ignore="true"
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
                        name="auth_confirm_security_code"
                        autoComplete="new-password"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck="false"
                        data-lpignore="true"
                        data-1p-ignore="true"
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

                  {/* Update Password and Cancel Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleCancelPassword}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                    >
                      Cancel
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
