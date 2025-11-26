import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost', isLoading?: boolean }> = ({ 
  children, variant = 'primary', className = '', isLoading, ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-400 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-600",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }> = ({ label, className = '', error, disabled, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>}
      <input 
        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all bg-white text-slate-900 placeholder:text-slate-400 disabled:bg-white disabled:text-slate-500 disabled:border-slate-200 ${error ? 'border-red-500' : 'border-slate-200'} ${className}`} 
        disabled={disabled}
        {...props} 
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, error?: string }> = ({ label, className = '', error, children, disabled, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>}
      <div className="relative">
        <select 
          className={`appearance-none w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all bg-white text-slate-900 disabled:bg-white disabled:text-slate-500 disabled:border-slate-200 ${error ? 'border-red-500' : 'border-slate-200'} ${className}`} 
          disabled={disabled}
          {...props} 
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export const Card: React.FC<{ title?: string, children: React.ReactNode, className?: string, action?: React.ReactNode }> = ({ title, children, className = '', action }) => {
  return (
    <div className={`rounded-lg shadow-sm border border-slate-200 overflow-hidden bg-white ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-slate-100 bg-white flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-4 bg-white">
        {children}
      </div>
    </div>
  );
};