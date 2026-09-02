// components/Modal.jsx — Modal genérico (identidade visual EduAcess Web)
import React from 'react'

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in-up border border-gray-100">
        
        {/* Header do Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {children}
        </div>
        
      </div>
    </div>
  )
}

export default Modal
