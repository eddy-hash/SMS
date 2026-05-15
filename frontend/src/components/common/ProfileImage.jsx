import React, { useState, useEffect } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProfileImage = ({ size = 'h-14 w-14', editable = true, onImageUpdate }) => {
  const { user, updateProfileImage } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfileImage(null);
      setImageError(false);
      return;
    }
    if (user?.profile_image) {
      const timestamp = new Date().getTime();
      const imageUrl = user.profile_image.startsWith('http') 
        ? user.profile_image 
        : `http://localhost:8000${user.profile_image}?t=${timestamp}`;
      setProfileImage(imageUrl);
      setImageError(false);
    } else {
      setProfileImage(null);
    }
  }, [user]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPEG, PNG, JPG, GIF, WEBP allowed');
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result;
        const response = await api.post('/auth/upload-profile-image', {
          image_data: base64String,
        });

        const newImage = response.data.profile_image;
        const timestamp = new Date().getTime();
        const fullImageUrl = `http://localhost:8000${newImage}?t=${timestamp}`;

        if (newImage) {
          setProfileImage(fullImageUrl);
          setImageError(false);
          updateProfileImage(newImage);
          if (onImageUpdate) onImageUpdate(newImage);
        }

        event.target.value = null;
      } catch (error) {
        console.error('Upload failed:', error);
        alert(error.response?.data?.detail || 'Upload failed');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getInitials = () => {
    if (!user) return 'U';
    if (user?.full_name) return user.full_name.charAt(0).toUpperCase();
    if (user?.username) return user.username.charAt(0).toUpperCase();
    return 'U';
  };

  const sizeClasses = {
    'h-8 w-8': 'text-sm',
    'h-9 w-9': 'text-base',
    'h-10 w-10': 'text-lg',
    'h-11 w-11': 'text-lg',
    'h-12 w-12': 'text-xl',
    'h-14 w-14': 'text-2xl',
    'h-16 w-16': 'text-3xl',
    'h-20 w-20': 'text-4xl',
  };

  const textSize = sizeClasses[size] || 'text-xl';

  // Show gray default avatar when logged out
  if (!user) {
    return (
      <div className={`${size} rounded-full bg-gray-400 flex items-center justify-center shadow-md`}>
        <span className={`text-white font-bold ${textSize}`}>U</span>
      </div>
    );
  }

  return (
    <div className="relative group">
      {editable && (
        <input
          type="file"
          className="hidden"
          id="profile-upload"
          accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
          onChange={handleImageUpload}
        />
      )}

      {profileImage && !imageError ? (
        <img
          src={profileImage}
          alt="profile"
          className={`${size} rounded-full object-cover shadow-md`}
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={`${size} rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md`}>
          <span className={`text-white font-bold ${textSize}`}>
            {getInitials()}
          </span>
        </div>
      )}

      {editable && (
        <label
          htmlFor="profile-upload"
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
        >
          {uploading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <CameraIcon className="h-5 w-5 text-white" />
          )}
        </label>
      )}
    </div>
  );
};

export default ProfileImage;