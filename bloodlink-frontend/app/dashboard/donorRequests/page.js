import React, { useState, useEffect } from 'react';
import { bloodRequestsAPI } from '../../../lib/api';
import RequestTable from '../../../components/dashboard/RequestTable';

const DonorRequestsPage = () => {
    const [bloodRequests, setBloodRequests] = useState([]);
    const [bloodTypeFilter, setBloodTypeFilter] = useState('');

    useEffect(() => {
        const fetchBloodRequests = async () => {
            try {
                const response = await bloodRequestsAPI.getDonorRequests({ bloodType: bloodTypeFilter });
                setBloodRequests(response.data.requests);
            } catch (error) {
                console.error('Error fetching blood requests:', error);
            }
        };

        fetchBloodRequests();
    }, [bloodTypeFilter]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Blood Donation Requests</h1>
            <div className="mb-4">
                <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">Filter by Blood Type</label>
                <select
                    id="bloodType"
                    value={bloodTypeFilter}
                    onChange={(e) => setBloodTypeFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    <option value="">All</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                </select>
            </div>
            <RequestTable requests={bloodRequests} />
        </div>
    );
};

export default DonorRequestsPage;
