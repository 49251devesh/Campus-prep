import React, { useState } from 'react';
import { UserRole, Drive } from '../types';
import Layout from './Layout';
import AnalyticsCard from './AnalyticsCard';
import AdminDrivesManager from './AdminDrivesManager';
import { BriefcaseIcon, UserGroupIcon, ChartBarIcon } from './icons';

interface AdminDashboardProps {
  drives: Drive[];
  addDrive: (drive: Omit<Drive, 'id' | 'logoUrl'>) => void;
  deleteDrive: (driveId: string) => void;
  onLogout: () => void;
}

const DashboardView: React.FC<{drives: Drive[]}> = ({ drives }) => (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <AnalyticsCard title="Total Active Drives" value={drives.length.toString()} icon={BriefcaseIcon} color="bg-blue-500" />
            <AnalyticsCard title="Total Students Registered" value="1,250" icon={UserGroupIcon} color="bg-purple-500" />
            <AnalyticsCard title="Overall Placement Rate" value="82%" icon={ChartBarIcon} color="bg-green-500" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h3>
            <p className="text-gray-600">Activity feed will be displayed here.</p>
        </div>
    </div>
);


const AdminDashboard: React.FC<AdminDashboardProps> = ({ drives, addDrive, deleteDrive, onLogout }) => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView drives={drives} />;
      case 'manage-drives':
        return <AdminDrivesManager drives={drives} addDrive={addDrive} deleteDrive={deleteDrive} />;
      default:
        return <DashboardView drives={drives} />;
    }
  };

  return (
    <Layout
      userRole={UserRole.ADMIN}
      activeView={activeView}
      setActiveView={setActiveView}
      onLogout={onLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default AdminDashboard;