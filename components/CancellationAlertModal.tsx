import React from 'react';

interface CancellationAlertModalProps {
  fee: number | null;
  onClose: () => void;
}

const CancellationAlertModal: React.FC<CancellationAlertModalProps> = ({ fee, onClose }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 z-30 flex justify-center items-center p-4 animate-fade-in">
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
            <div className="bg-gray-900 border border-yellow-500 rounded-xl w-full max-w-sm p-6 text-center text-white shadow-lg shadow-yellow-500/20">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-3 text-yellow-300">ခရီးစဉ် ပယ်ဖျက်သွားသည်</h2>
                <p className="text-gray-300 mb-6">ခရီးသည်က ခရီးစဉ်ကို ပယ်ဖျက်လိုက်ပါသည်။</p>
                {fee && fee > 0 && (
                    <div className="bg-gray-800 rounded-lg p-3 mb-6">
                        <p className="text-green-400">
                            ပယ်ဖျက်ခ <span className="font-bold">{fee.toLocaleString()} MMK</span> ကို သင်၏ ပိုက်ဆံအိတ်ထဲသို့ ထည့်ပေးလိုက်ပါပြီ။
                        </p>
                    </div>
                )}
                <button
                    onClick={onClose}
                    className="w-full bg-green-600 text-black font-bold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors"
                >
                    ကောင်းပါပြီ
                </button>
            </div>
        </div>
    );
};

export default CancellationAlertModal;
