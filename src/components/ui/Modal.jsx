// src/components/ui/Modal.jsx
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Heading } from './Typography';

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 transition-all">
      <div className="bg-gray-900 border-t border-gray-700 sm:border w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-full">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-900 z-10 py-2 border-b border-gray-800">
          <Heading level={4}>{title}</Heading>
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}