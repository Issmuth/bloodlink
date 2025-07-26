export default function DashboardCard({ 
  title, 
  children, 
  icon, 
  className = '',
  onClick,
  hoverable = false 
}) {
  const cardClasses = `
    bg-white rounded-xl shadow-sm border border-gray-100 p-6 
    ${hoverable ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim()

  const CardContent = () => (
    <>
      {(title || icon) && (
        <div className="flex items-center mb-4">
          {icon && (
            <div className="flex-shrink-0 mr-3">
              {icon}
            </div>
          )}
          {title && (
            <h3 className="text-lg font-semibold text-midnight">{title}</h3>
          )}
        </div>
      )}
      <div className="text-gray-600">
        {children}
      </div>
    </>
  )

  if (onClick) {
    return (
      <div className={cardClasses} onClick={onClick}>
        <CardContent />
      </div>
    )
  }

  return (
    <div className={cardClasses}>
      <CardContent />
    </div>
  )
} 