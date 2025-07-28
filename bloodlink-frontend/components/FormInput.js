export default function FormInput({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-midnight dark:text-gray-100 mb-2">
          {label}
          {props.required && <span className="text-crimson dark:text-red-400 ml-1">*</span>}
        </label>
      )}
      
      {props.type === 'select' ? (
        <select
          className={`form-input ${error ? 'border-crimson dark:border-red-400' : ''}`}
          {...props}
        >
          {props.placeholder && (
            <option value="" className="text-gray-500 dark:text-gray-400">
              {props.placeholder}
            </option>
          )}
          {props.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className={`form-input ${error ? 'border-crimson dark:border-red-400' : ''}`}
          {...props}
        />
      )}
      
      {error && (
        <p className="text-crimson dark:text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}
