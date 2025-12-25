import React, { useEffect, useState } from 'react';
import { Building, Edit3, Mail, Phone, Save, User, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getEmployeeById, updateEmployee } from '../api/employeeApi';
import { useAuth } from '../context/AuthContext';

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  const fetchProfile = async () => {
    try {
      if (!token || !user?.id) {
        throw new Error('Please login to view your profile');
      }

      const response = await getEmployeeById(user.id, token);
      const profile = response?.data;
      if (!profile) {
        throw new Error('No profile data found');
      }

      setProfileData(profile);
      setFormData(profile);
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


  const handleSave = async () => {
    try {
      setLoading(true);
      if (!token || !profileData?.id) {
        throw new Error('Please login to update your profile');
      }

      const payload = {
        ...profileData,
        email: formData.email || '',
        mobile_number: formData.mobile_number || '',
        department: formData.department || '',
        designation: formData.designation || ''
      };

      const response = await updateEmployee(profileData.id, payload, token);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to update profile');
      }

      setProfileData(response?.data || payload);
      setFormData(response?.data || payload);
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
    setIsEditing(false);
  };

  if (loading) {
    return <div className="page-content p-6"><div className="flex justify-center flex-col items-center">
      <div className="w-6 h-6 border-4 border-indigo-500 border-dashed rounded-full animate-spin mb-2"></div>
      <span className="text-gray-600 text-sm">Loading pending calls...</span>
    </div></div>;
  }

  if (!profileData) {
    return <div className="page-content p-6">No profile data available</div>;
  }

  return (
    <div className="space-y-6 page-content p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <div className="flex space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Edit3 size={16} className="mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save size={16} className="mr-2" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <X size={16} className="mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture & Basic Info */}
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <div className="text-center">
            <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={48} className="text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{profileData.employee_name}</h2>
            <p className="text-gray-600">{profileData.designation || '-'}</p>
            <p className="text-sm text-gray-500">{profileData.employee_code}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-2" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-800">{profileData.email || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-800">{profileData.mobile_number || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building size={16} className="inline mr-2" />
                Department
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="department"
                  value={formData.department || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-800">{profileData.department || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="designation"
                  value={formData.designation || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-800">{profileData.designation || '-'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
