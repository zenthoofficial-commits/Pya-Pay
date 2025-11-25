
import React from 'react';
import { InfoIcon } from './Icons';

interface DisclaimerModalProps {
  onClose: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onClose }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fade-in">
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
                    <InfoIcon className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-yellow-300">သတိပြုရန်</h2>
                <p className="text-gray-300 mb-6">
                    ဤအက်ပ်သည် သရုပ်ပြရန်အတွက်သာ ဖြစ်ပါသည်။ အမှန်တကယ် ကားငှားသည့် ဝန်ဆောင်မှုနှင့် ချိတ်ဆက်ထားခြင်း မရှိပါ။ ခရီးစဉ်တောင်းဆိုမှုများသည် စမ်းသပ်ရန်အတွက်သာ ဖြစ်သည်။
                </p>
                <button
                    onClick={onClose}
                    className="w-full bg-green-600 text-black font-bold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors"
                >
                    နားလည်ပါပြီ
                </button>
            </div>
        </div>
    );
};

export default DisclaimerModal;
