import React, { useState, useMemo } from 'react';
import { Drive } from '../types';
import { SearchIcon } from './icons';

interface DrivesListProps {
  drives: Drive[];
  onDriveViewDetails: (driveId: string) => void;
}

const DriveCard: React.FC<{ drive: Drive; onViewDetailsClick: (id: string) => void; }> = ({ drive, onViewDetailsClick }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
        <div className="p-6 flex-grow">
            <div className="flex items-center mb-4">
                <img src={drive.logoUrl} alt={`${drive.companyName} logo`} className="w-12 h-12 mr-4 object-contain" />
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{drive.role}</h3>
                    <p className="text-md text-gray-600">{drive.companyName}</p>
                </div>
            </div>
            <p className="text-gray-700 mb-4 h-20 overflow-hidden text-ellipsis">{drive.description}</p>
        </div>
        <div className="p-6 bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-500 font-medium bg-gray-200 px-3 py-1 rounded-full">{drive.date}</p>
            <button
                onClick={() => onViewDetailsClick(drive.id)}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
                View Details
            </button>
        </div>
    </div>
);


const DrivesList: React.FC<DrivesListProps> = ({ drives, onDriveViewDetails }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const filteredDrives = useMemo(() => {
        return drives.filter(drive => {
            const searchLower = searchQuery.toLowerCase();
            const roleLower = roleFilter.toLowerCase();
            const companyLower = companyFilter.toLowerCase();

            const matchesSearch = searchLower === '' ||
                drive.companyName.toLowerCase().includes(searchLower) ||
                drive.role.toLowerCase().includes(searchLower) ||
                drive.description.toLowerCase().includes(searchLower);

            const matchesRole = roleLower === '' || drive.role.toLowerCase().includes(roleLower);
            const matchesCompany = companyLower === '' || drive.companyName.toLowerCase().includes(companyLower);
            const matchesDate = dateFilter === '' || new Date(drive.date) >= new Date(dateFilter);

            return matchesSearch && matchesRole && matchesCompany && matchesDate;
        });
    }, [drives, searchQuery, roleFilter, companyFilter, dateFilter]);


    if (drives.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold text-gray-700">No Active Drives</h3>
                <p className="mt-2 text-gray-500">Please check back later for new placement opportunities.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative lg:col-span-4">
                        <input
                            type="text"
                            placeholder="Search by keyword..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                        />
                         <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDrives.map(drive => (
                    <DriveCard key={drive.id} drive={drive} onViewDetailsClick={onDriveViewDetails} />
                ))}
            </div>

            {filteredDrives.length === 0 && (
                <div className="text-center py-16 bg-white rounded-lg shadow-md col-span-full">
                    <h3 className="text-2xl font-semibold text-gray-700">No Drives Found</h3>
                    <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </div>
    );
};

export default DrivesList;
