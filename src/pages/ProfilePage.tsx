import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="mt-2 text-gray-600">Manage your account and preferences</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card p-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-[#1E90FF] rounded-full flex items-center justify-center shadow-md mb-4">
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Management</h2>
          <p className="text-gray-600">Profile management features coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
