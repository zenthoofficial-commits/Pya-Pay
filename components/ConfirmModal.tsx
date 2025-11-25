import React from 'react';

interface ConfirmModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-70 z-40 flex justify-center items-center p-4">
            <div className="bg-gray-900 border border-red-500 rounded-lg w-full max-w-sm p-6 text-white shadow-lg shadow-red-500/20">
                <h2 className="text-xl font-bold mb-4 text-red-400">{title}</h2>
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500 transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;