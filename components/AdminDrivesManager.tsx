import React, { useState } from 'react';
import { Drive } from '../types';
import { PlusCircleIcon, TrashIcon } from './icons';

interface AdminDrivesManagerProps {
  drives: Drive[];
  addDrive: (drive: Omit<Drive, 'id' | 'logoUrl'>) => void;
  deleteDrive: (driveId: string) => void;
}

const AdminDrivesManager: React.FC<AdminDrivesManagerProps> = ({ drives, addDrive, deleteDrive }) => {
    const [companyName, setCompanyName] = useState('');
    const [role, setRole] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescripton] = useState('');
    const [applyUrl, setApplyUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!companyName || !role || !date || !description || !applyUrl) return;
        addDrive({ companyName, role, date, description, applyUrl });
        setCompanyName('');
        setRole('');
        setDate('');
        setDescripton('');
        setApplyUrl('');
    };

    const handleDelete = (driveId: string, driveTitle: string) => {
        if (window.confirm(`Are you sure you want to delete the drive: "${driveTitle}"?`)) {
            deleteDrive(driveId);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <PlusCircleIcon className="w-8 h-8 mr-2 text-indigo-600"/>
                        Add New Drive
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                            <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role / Position</label>
                            <input type="text" id="role" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                         <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" value={description} onChange={(e) => setDescripton(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                        <div>
                            <label htmlFor="applyUrl" className="block text-sm font-medium text-gray-700">Apply URL</label>
                            <input type="url" id="applyUrl" value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Post Drive
                        </button>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Current Active Drives ({drives.length})</h3>
                    <div className="space-y-4">
                        {drives.length > 0 ? drives.map(drive => (
                            <div key={drive.id} className="p-4 border rounded-md flex justify-between items-center bg-gray-50">
                                <div>
                                    <p className="font-bold text-lg text-gray-800">{drive.role} at {drive.companyName}</p>
                                    <p className="text-sm text-gray-500">{drive.date}</p>
                                </div>
                                <button 
                                    onClick={() => handleDelete(drive.id, `${drive.role} at ${drive.companyName}`)}
                                    className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 p-2 rounded-md hover:bg-red-100"
                                >
                                    <TrashIcon className="w-5 h-5"/>
                                    Delete
                                </button>
                            </div>
                        )) : <p className="text-gray-500">No drives posted yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDrivesManager;