import React, { useState } from 'react';
import { Roadmap, RoadmapStep } from '../types';
import { PencilSquareIcon, PlusCircleIcon, TrashIcon } from './icons';

interface RoadmapsProps {
    roadmapsData: Roadmap[];
    onRoadmapsChange: (roadmaps: Roadmap[]) => void;
    onAddRoadmap: (roleName: string) => void;
    onDeleteRoadmap: (roleName: string) => void;
    isAddingRoadmap: boolean;
    addRoadmapError: string | null;
}

const AddStepButton = ({ onClick }: { onClick: () => void }) => (
    <div className="relative my-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-dashed border-gray-300" />
        </div>
        <div className="relative flex justify-center">
            <button
                type="button"
                onClick={onClick}
                className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
            >
                <PlusCircleIcon className="h-5 w-5 text-indigo-600" />
                Add Step
            </button>
        </div>
    </div>
);

const Roadmaps: React.FC<RoadmapsProps> = ({ roadmapsData, onRoadmapsChange, onAddRoadmap, onDeleteRoadmap, isAddingRoadmap, addRoadmapError }) => {
    const [selectedRole, setSelectedRole] = useState<string>(roadmapsData.length > 0 ? roadmapsData[0].role : '');
    const [isEditing, setIsEditing] = useState(false);
    const [editingData, setEditingData] = useState<Roadmap | null>(null);

    const [isAddingMode, setIsAddingMode] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

    const selectedRoadmap = roadmapsData.find(r => r.role === selectedRole);
    
    React.useEffect(() => {
        // If the selected roadmap is deleted from the list, select the first available one.
        if (!roadmapsData.find(r => r.role === selectedRole) && roadmapsData.length > 0) {
            setSelectedRole(roadmapsData[0].role);
        } else if (roadmapsData.length === 0) {
            setSelectedRole('');
        }
    }, [roadmapsData, selectedRole]);


    const handleAddNewRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleName.trim() || isAddingRoadmap) return;
        onAddRoadmap(newRoleName);
        setNewRoleName('');
    };
    
    const handleDeleteRole = (roleNameToDelete: string) => {
        if (window.confirm(`Are you sure you want to delete the "${roleNameToDelete}" roadmap? This action cannot be undone.`)) {
            onDeleteRoadmap(roleNameToDelete);
        }
    };


    const handleEditClick = () => {
        setEditingData(JSON.parse(JSON.stringify(selectedRoadmap))); // Deep copy
        setIsEditing(true);
    };
    
    const handleCancel = () => {
        setIsEditing(false);
        setEditingData(null);
    };

    const handleSave = () => {
        if (!editingData) return;
        onRoadmapsChange(roadmapsData.map(r => r.role === editingData.role ? editingData : r));
        setIsEditing(false);
        setEditingData(null);
    }

    const handleStepChange = (stepIndex: number, field: keyof RoadmapStep, value: any) => {
        if (!editingData) return;
        const newSteps = [...editingData.steps];
        (newSteps[stepIndex] as any)[field] = value;
        setEditingData({ ...editingData, steps: newSteps });
    };

    const handleResourceChange = (stepIndex: number, resIndex: number, field: 'name' | 'url', value: string) => {
        if (!editingData) return;
        const newSteps = [...editingData.steps];
        newSteps[stepIndex].resources[resIndex][field] = value;
        setEditingData({ ...editingData, steps: newSteps });
    }

    const addStep = (index: number) => {
        if (!editingData) return;
        const newStep: RoadmapStep = { title: 'New Step Title', description: 'New step description.', resources: [], completed: false };
        const newSteps = [...editingData.steps];
        newSteps.splice(index, 0, newStep);
        setEditingData({ ...editingData, steps: newSteps });
    };

    const deleteStep = (stepIndex: number) => {
        if (!editingData) return;
        const newSteps = editingData.steps.filter((_, i) => i !== stepIndex);
        setEditingData({ ...editingData, steps: newSteps });
    }

    const addResource = (stepIndex: number) => {
        if (!editingData) return;
        const newSteps = [...editingData.steps];
        newSteps[stepIndex].resources.push({ name: 'New Resource', url: '#' });
        setEditingData({ ...editingData, steps: newSteps });
    }

    const deleteResource = (stepIndex: number, resIndex: number) => {
        if (!editingData) return;
        const newSteps = [...editingData.steps];
        newSteps[stepIndex].resources = newSteps[stepIndex].resources.filter((_, i) => i !== resIndex);
        setEditingData({ ...editingData, steps: newSteps });
    }
    
    const handleToggleComplete = (stepIndex: number) => {
        if (!selectedRoadmap) return;

        const newRoadmaps = roadmapsData.map(roadmap => {
            if (roadmap.role === selectedRole) {
                const newSteps = [...roadmap.steps];
                newSteps[stepIndex].completed = !newSteps[stepIndex].completed;
                return { ...roadmap, steps: newSteps };
            }
            return roadmap;
        });

        onRoadmapsChange(newRoadmaps);
    };

    const selectedRoadmapProgress = selectedRoadmap && selectedRoadmap.steps.length > 0
        ? Math.round((selectedRoadmap.steps.filter(s => s.completed).length / selectedRoadmap.steps.length) * 100)
        : 0;

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-col h-full">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700 px-1">Select a Role</h3>
                    <ul className="space-y-2 flex-grow">
                        {roadmapsData.map(roadmap => {
                             const totalSteps = roadmap.steps.length;
                             const completedSteps = roadmap.steps.filter(s => s.completed).length;
                             const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
                            return (
                                <li key={roadmap.role} className="relative group">
                                    <button
                                        onClick={() => { setSelectedRole(roadmap.role); handleCancel(); }}
                                        disabled={isEditing}
                                        className={`w-full text-left p-3 rounded-md transition-all duration-200 ${selectedRole === roadmap.role ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-800 hover:bg-gray-100 hover:shadow-sm disabled:bg-gray-200 disabled:cursor-not-allowed'}`}
                                    >
                                        <div className="flex justify-between items-center font-semibold">
                                            <span>{roadmap.role}</span>
                                            <span className={`text-xs ${selectedRole === roadmap.role ? 'text-indigo-200' : 'text-gray-500'}`}>{progress}%</span>
                                        </div>
                                        <div className={`w-full rounded-full h-1.5 mt-2 ${selectedRole === roadmap.role ? 'bg-indigo-800' : 'bg-gray-200'}`}>
                                            <div className="bg-green-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </button>
                                     <button
                                        onClick={() => handleDeleteRole(roadmap.role)}
                                        disabled={isEditing}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hidden group-hover:block bg-gray-200 text-gray-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                                        aria-label={`Delete ${roadmap.role} roadmap`}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                     <div className="mt-4 pt-4 border-t border-gray-200">
                        {isAddingMode ? (
                            <form onSubmit={handleAddNewRole} className="space-y-2">
                                <input
                                    type="text"
                                    value={newRoleName}
                                    onChange={e => setNewRoleName(e.target.value)}
                                    placeholder="Enter new role name"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                    autoFocus
                                />
                                {addRoadmapError && <p className="text-red-500 text-xs px-1">{addRoadmapError}</p>}
                                <div className="flex items-center gap-2">
                                    <button
                                        type="submit"
                                        disabled={isAddingRoadmap || !newRoleName.trim()}
                                        className="flex-1 px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                                    >
                                        {isAddingRoadmap ? 'Adding...' : 'Add Role'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setIsAddingMode(false); setNewRoleName(''); }}
                                        className="flex-1 px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setIsAddingMode(true)}
                                disabled={isEditing}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PlusCircleIcon className="w-5 h-5" />
                                Add New Role
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="lg:w-3/4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">{selectedRoadmap?.role} Roadmap</h2>
                        {selectedRoadmap && !isEditing ? (
                            <button onClick={handleEditClick} className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200">
                                <PencilSquareIcon className="w-5 h-5 mr-2" />
                                Personalize
                            </button>
                        ) : selectedRoadmap && (
                            <div className="flex gap-2">
                                <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                                <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">Save Changes</button>
                            </div>
                        )}
                    </div>
                     {!isEditing && selectedRoadmap && (
                        <div className="mb-6">
                            <div className="flex justify-between mb-1">
                                <span className="text-base font-medium text-indigo-700">Overall Progress</span>
                                <span className="text-sm font-medium text-indigo-700">{selectedRoadmapProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${selectedRoadmapProgress}%` }}></div>
                            </div>
                        </div>
                    )}

                    {isEditing && editingData ? (
                        /* EDITING VIEW */
                        <div>
                            <AddStepButton onClick={() => addStep(0)} />
                            {editingData.steps.map((step, stepIndex) => (
                                <React.Fragment key={stepIndex}>
                                    <div className="border p-4 rounded-lg space-y-3 bg-gray-50 my-4">
                                        <div className="flex justify-between items-start">
                                            <input type="text" value={step.title} onChange={e => handleStepChange(stepIndex, 'title', e.target.value)} className="text-xl font-semibold text-gray-800 border-b-2 w-full focus:border-indigo-500 outline-none bg-white p-1" />
                                            <button onClick={() => deleteStep(stepIndex)} className="text-red-500 hover:text-red-700 ml-2 p-1"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                        <textarea value={step.description} onChange={e => handleStepChange(stepIndex, 'description', e.target.value)} className="mt-1 text-gray-600 w-full p-2 border rounded-md bg-white" rows={2}/>
                                        <div>
                                            <h5 className="font-semibold text-gray-700 mb-1">Resources:</h5>
                                            <div className="space-y-2">
                                                {step.resources.map((res, resIndex) => (
                                                    <div key={resIndex} className="flex items-center gap-2">
                                                        <input type="text" placeholder="Name" value={res.name} onChange={e => handleResourceChange(stepIndex, resIndex, 'name', e.target.value)} className="w-1/3 p-1 border rounded-md bg-white"/>
                                                        <input type="text" placeholder="URL" value={res.url} onChange={e => handleResourceChange(stepIndex, resIndex, 'url', e.target.value)} className="flex-grow p-1 border rounded-md bg-white"/>
                                                        <button onClick={() => deleteResource(stepIndex, resIndex)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-5 h-5"/></button>
                                                    </div>
                                                ))}
                                                <button onClick={() => addResource(stepIndex)} className="text-sm flex items-center text-indigo-600 hover:text-indigo-800 font-semibold mt-1">
                                                    <PlusCircleIcon className="w-5 h-5 mr-1"/> Add Resource
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                     <AddStepButton onClick={() => addStep(stepIndex + 1)} />
                                </React.Fragment>
                            ))}
                        </div>
                    ) : (
                        /* DISPLAY VIEW */
                        <div className="space-y-4">
                            {selectedRoadmap?.steps.map((step, index) => (
                                 <div key={index} className={`border-l-4 p-4 transition-colors duration-300 rounded-r-md ${step.completed ? 'border-green-500 bg-green-50' : 'border-indigo-500'}`}>
                                    <label className="flex items-center cursor-pointer">
                                         <input
                                            type="checkbox"
                                            checked={step.completed}
                                            onChange={() => handleToggleComplete(index)}
                                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-4 shrink-0"
                                            aria-label={`Mark step ${index + 1} as complete`}
                                        />
                                        <h4 className={`text-xl font-semibold text-gray-800 select-none ${step.completed ? 'line-through text-gray-500' : ''}`}>{step.title}</h4>
                                    </label>
                                    <div className="pl-9 mt-2">
                                        <p className={`text-gray-600 ${step.completed ? 'text-gray-500' : ''}`}>{step.description}</p>
                                        <div className="mt-3">
                                            <h5 className="font-semibold text-gray-700">Resources:</h5>
                                            <ul className="list-disc list-inside mt-1">
                                                {step.resources.map(res => (
                                                    <li key={res.name}>
                                                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                                            {res.name}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {!selectedRoadmap && (
                                <div className="text-center py-16 text-gray-500">
                                    <p className="text-lg font-semibold">No Roadmap Selected</p>
                                    <p>Select a role from the left, or add a new one to get started.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Roadmaps;