"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

export default function BloodRequestsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [bloodRequests, setBloodRequests] = useState([]);
    const [filter, setFilter] = useState('');
    const [isClient, setIsClient] = useState(false);

    // Ensure we're on client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || authLoading) return;

        async function fetchBloodRequests() {
            try {
                const response = await api.get('/blood-requests');
                setBloodRequests(response.data?.data?.requests || []);
            } catch (error) {
                console.error('Error fetching blood requests:', error);
            }
        }

        fetchBloodRequests();
    }, [isClient, authLoading]);

    // Show consistent loading state during hydration
    if (!isClient || authLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const filteredRequests = bloodRequests.filter(request =>
        filter ? request.bloodType === filter : true
    );

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Blood Requests</h1>

            <div className="mb-4">
                <label htmlFor="filter" className="block text-sm font-medium text-gray-700">
                    Filter by Blood Type
                </label>
                <select
                    id="filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-crimson focus:border-crimson sm:text-sm rounded-md"
                >
                    <option value="">All</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                </select>
            </div>

            <ul className="space-y-4">
                {filteredRequests.map((request) => (
                    <li key={request.id} className="p-4 border rounded-lg shadow">
                        <p><strong>Blood Type:</strong> {request.bloodType}</p>
                        <p><strong>Quantity:</strong> {request.quantity} units</p>
                        <p><strong>Requested By:</strong> {request.requestedBy}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
