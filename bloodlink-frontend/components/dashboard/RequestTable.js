'use client'

import { urgencyColors, statusColors } from '../../lib/mockData'

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTimeAgo = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

export default function RequestTable({ requests, title, showActions = true }) {
  const handleConfirmDonor = (requestId, donorId) => {
    console.log(`Confirming donor ${donorId} for request ${requestId}`)
    // Implement confirmation logic
  }

  const handleArchiveRequest = (requestId) => {
    console.log(`Archiving request ${requestId}`)
    // Implement archive logic
  }

  const handleEditRequest = (requestId) => {
    console.log(`Editing request ${requestId}`)
    // Navigate to edit form
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-midnight">{title}</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Blood Type</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Units</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Urgency</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Status</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Responses</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Posted</th>
              {showActions && (
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-crimson text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {request.bloodType}
                    </div>
                    <div>
                      <div className="font-medium text-midnight">{request.bloodType}</div>
                      {request.procedure && (
                        <div className="text-sm text-gray-500">{request.procedure}</div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="py-4 px-6">
                  <div className="text-sm">
                    <div className="font-medium text-midnight">
                      {request.unitsReceived || 0}/{request.unitsNeeded}
                    </div>
                    <div className="text-gray-500">units</div>
                  </div>
                </td>
                
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${urgencyColors[request.urgency]}`}>
                    {request.urgency}
                  </span>
                </td>
                
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[request.status]}`}>
                    {request.status}
                  </span>
                </td>
                
                <td className="py-4 px-6">
                  <div className="text-sm">
                    <div className="font-medium text-midnight">{request.responses}</div>
                    <div className="text-gray-500">
                      {request.confirmed || 0} confirmed
                    </div>
                  </div>
                </td>
                
                <td className="py-4 px-6">
                  <div className="text-sm text-gray-600">
                    <div>{formatDate(request.postedAt)}</div>
                    <div className="text-xs text-gray-500">
                      {getTimeAgo(request.postedAt)}
                    </div>
                  </div>
                </td>
                
                {showActions && (
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      {request.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleEditRequest(request.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleArchiveRequest(request.id)}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            Archive
                          </button>
                        </>
                      )}
                      {request.status === 'fulfilled' && (
                        <span className="text-green-600 text-sm font-medium">
                          Completed
                        </span>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {requests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-1">No requests found</h3>
          <p className="text-gray-500">Create your first blood request to get started.</p>
        </div>
      )}
    </div>
  )
} 