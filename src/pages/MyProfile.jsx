import React, { useEffect, useState, useRef } from 'react';
import { Building, Edit3, Mail, Phone, Save, User, X, Hash, Shield, Briefcase, CheckCircle2, Camera, FileText, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { getEmployeeById, updateEmployee } from '../api/employeeApi';
import { useAuth } from '../context/AuthContext';

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  
  const [selectedProfileImg, setSelectedProfileImg] = useState(null);
  const [selectedDocumentImg, setSelectedDocumentImg] = useState(null);
  const [previewProfileImg, setPreviewProfileImg] = useState(null);
  const [previewDocumentImg, setPreviewDocumentImg] = useState(null);

  const profileInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      if (!token || !user?.id) {
        throw new Error('Please login to view your profile');
      }

      const response = await getEmployeeById(user.id, token);
      const profile = response?.data;
      console.log(profile)
      if (!profile) {
        throw new Error('No profile data found');
      }

      setProfileData(profile);
      setFormData(profile);

      // Set initial previews
      if (profile.profile_img) {
        // Handle both full URLs and relative paths if needed
        setPreviewProfileImg(profile.profile_img);
      }
      if (profile.document_img) {
        setPreviewDocumentImg(profile.document_img);
      }

    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error(`Failed to load profile data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setSelectedProfileImg(file);
      setPreviewProfileImg(URL.createObjectURL(file));
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Document size should be less than 5MB');
        return;
      }
      setSelectedDocumentImg(file);
      setPreviewDocumentImg(URL.createObjectURL(file));
    }
  };


  const handleSave = async () => {
    try {
      setLoading(true);
      if (!token || !profileData?.id) {
        throw new Error('Please login to update your profile');
      }

      // Create FormData to handle file uploads
      const submitData = new FormData();

      // Append basic fields
      submitData.append('email', formData.email || '');
      submitData.append('mobile_number', formData.mobile_number || '');
      // Include other fields needed for update, even if readonly, if the API expects them
      // Or better, only include what changes. But based on previous code it was sending everything.
      // Let's send the text fields that are editable + required ones.
      // The backend service seems to merge so we might just send what we have.

      // Append files if selected
      if (selectedProfileImg) {
        submitData.append('profile_img', selectedProfileImg);
      }
      if (selectedDocumentImg) {
        submitData.append('document_img', selectedDocumentImg);
      }

      const response = await updateEmployee(profileData.id, submitData, token);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to update profile');
      }

      const updatedProfile = response?.data || formData; // Fallback
      setProfileData(updatedProfile);
      setFormData(updatedProfile);

      // Update previews/state
      if (updatedProfile.profile_img) setPreviewProfileImg(updatedProfile.profile_img);
      if (updatedProfile.document_img) setPreviewDocumentImg(updatedProfile.document_img);
      setSelectedProfileImg(null);
      setSelectedDocumentImg(null);

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData || {});
    setPreviewProfileImg(profileData?.profile_img || null);
    setPreviewDocumentImg(profileData?.document_img || null);
    setSelectedProfileImg(null);
    setSelectedDocumentImg(null);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 max-w-md">
            <p className="text-red-700 font-medium">No profile data available</p>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = (profileData?.role || '').toLowerCase() === 'admin' || profileData?.Admin === 'Yes';
  const statusColor = profileData?.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full space-y-4 sm:space-y-6">
        {/* Header Section - Responsive */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-white/80 mb-1 sm:mb-2">Profile</p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white">My Profile</h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-indigo-100">View and manage your personal information</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-indigo-600 shadow-lg transition hover:bg-indigo-50 hover:shadow-xl"
                >
                  <Edit3 size={18} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Save size={18} />
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="sm:hidden">Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/20 px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-white/30"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid - Fully Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card - Left Side */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-100">
              <div className="text-center">
                <div className="relative mx-auto h-24 w-24 sm:h-32 sm:w-32 mb-4 sm:mb-6">
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg overflow-hidden">
                    {previewProfileImg ? (
                      <img
                        src={previewProfileImg}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          console.error('Error loading profile image:', previewProfileImg);
                          // e.target.style.display = 'none'; 
                        }}
                      />
                    ) : (
                      <User size={48} className="text-white sm:w-16 sm:h-16" />
                    )}
                  </div>

                  {isEditing && (
                    <>
                      <button
                        onClick={() => profileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white shadow-lg hover:bg-indigo-700 transition-colors z-10"
                        title="Upload Profile Picture"
                      >
                        <Camera size={16} />
                      </button>
                      <input
                        type="file"
                        ref={profileInputRef}
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">{profileData.employee_name || '-'}</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-3">{profileData.designation || 'Not specified'}</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 sm:px-4 py-1.5 sm:py-2 mb-4">
                  <Hash size={14} className="text-indigo-600 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-semibold text-indigo-700">{profileData.employee_code || '-'}</span>
                </div>
                <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
                      {isAdmin && <Shield size={12} className="mr-1" />}
                      {profileData?.status || 'Active'}
                    </span>
                  </div>
                  {isAdmin && (
                    <p className="text-xs text-gray-500">Administrator Access</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Information Cards - Right Side */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Personal Information Card */}
            <div className="rounded-2xl bg-white p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <User size={18} className="text-indigo-600 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                    <Mail size={14} className="text-indigo-600 sm:w-4 sm:h-4" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      placeholder="your.email@example.com"
                    />
                  ) : (
                    <p className="text-sm sm:text-base text-gray-800 font-medium break-words">{profileData.email || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                    <Phone size={14} className="text-indigo-600 sm:w-4 sm:h-4" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="mobile_number"
                      value={formData.mobile_number || ''}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      placeholder="+91 1234567890"
                    />
                  ) : (
                    <p className="text-sm sm:text-base text-gray-800 font-medium">{profileData.mobile_number || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                    <Building size={14} className="text-indigo-600 sm:w-4 sm:h-4" />
                    Department
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department || ''}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-600 cursor-not-allowed"
                    />
                  ) : (
                    <p className="text-sm sm:text-base text-gray-800 font-medium">{profileData.department || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                    <Briefcase size={14} className="text-indigo-600 sm:w-4 sm:h-4" />
                    Designation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation || ''}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-600 cursor-not-allowed"
                    />
                  ) : (
                    <p className="text-sm sm:text-base text-gray-800 font-medium">{profileData.designation || '-'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information Card */}
            <div className="rounded-2xl bg-white p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Briefcase size={18} className="text-purple-600 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Additional Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                    <Hash size={14} className="text-purple-600 sm:w-4 sm:h-4" />
                    Employee Code
                  </label>
                  <p className="text-sm sm:text-base text-gray-800 font-medium">{profileData.employee_code || '-'}</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                    <Shield size={14} className="text-purple-600 sm:w-4 sm:h-4" />
                    Role
                  </label>
                  <p className="text-sm sm:text-base text-gray-800 font-medium capitalize">{profileData.role || 'Employee'}</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                    <CheckCircle2 size={14} className="text-purple-600 sm:w-4 sm:h-4" />
                    Status
                  </label>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
                    {profileData?.status || 'Active'}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                    <Building size={14} className="text-purple-600 sm:w-4 sm:h-4" />
                    Department
                  </label>
                  <p className="text-sm sm:text-base text-gray-800 font-medium">{profileData.department || 'Not assigned'}</p>
                </div>
              </div>
            </div>
            {/* Document Upload Section */}
            <div className="rounded-2xl bg-white p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <FileText size={18} className="text-emerald-600 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Documents</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhar Card / Identity Document
                    </label>

                    {previewDocumentImg ? (
                      <div className="relative w-full max-w-xs h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <img
                          src={previewDocumentImg}
                          alt="Document"
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            console.error('Error loading document image:', previewDocumentImg);
                            // e.target.style.display = 'none'; 
                          }}
                        />
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => documentInputRef.current?.click()}
                              className="p-2 bg-white rounded-full text-gray-900"
                            >
                              <Edit3 size={20} />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full max-w-xs h-40 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                        <FileText size={32} />
                        <span className="text-xs mt-2">No document uploaded</span>
                      </div>
                    )}

                    {isEditing && (
                      <div className="mt-3">
                        <input
                          type="file"
                          ref={documentInputRef}
                          accept="image/*"
                          onChange={handleDocumentChange}
                          className="hidden"
                        />
                        {!previewDocumentImg && (
                          <button
                            type="button"
                            onClick={() => documentInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <Upload size={16} />
                            Upload Document
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
