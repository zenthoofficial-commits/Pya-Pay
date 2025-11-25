
import React, { useState, useEffect, useRef } from 'react';
import { ref, onChildAdded, query as dbQuery, orderByChild } from 'firebase/database';
import { db } from '../services/firebase';
import { Message } from '../types';
import { BackIcon } from './Icons';
import { sendMessage } from '../services/chatService';

interface ChatModalProps {
    tripId: string;
    onClose: () => void;
}

const QUICK_REPLIES = [
    "ခဏစောင့်ပါ၊ လာနေပါပြီ။",
    "ကျွန်တော်ရောက်ပါပြီ။",
    "ဘယ်နေရာမှာ စောင့်နေတာလဲ ခင်ဗျာ။",
    "လမ်းပိတ်နေလို့ ခဏလောက်စောင့်ပေးပါနော်။",
    "ဟုတ်ကဲ့၊ ကျေးဇူးတင်ပါတယ်။",
];

const ChatModal: React.FC<ChatModalProps> = ({ tripId, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([]); // Clear messages when trip changes
        const messagesRef = ref(db, `chats/${tripId}/messages`);
        const q = dbQuery(messagesRef, orderByChild('timestamp'));
        
        const unsubscribe = onChildAdded(q, (snapshot) => {
            const msgData = snapshot.val();
            const msgId = snapshot.key;
            if (msgId) {
                setMessages(prev => [...prev, { id: msgId, ...msgData }]);
            }
        });
        
        return () => unsubscribe();
    }, [tripId]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSendQuickReply = async (text: string) => {
        if (text.trim() === '') return;
        await sendMessage(tripId, text);
    };

    const handleSendForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        await sendMessage(tripId, newMessage);
        setNewMessage('');
    };

    return (
        <div 
            className="absolute inset-0 bg-black/70 z-30 flex justify-center items-end animate-fade-in-fast"
            onClick={onClose}
        >
            <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }

                @keyframes slide-in-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
            `}</style>
            <div 
                className="bg-gray-900 border-t-2 border-green-500 rounded-t-2xl w-full max-w-md flex flex-col h-[85vh] shadow-lg shadow-green-500/30 animate-slide-in-up"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <button onClick={onClose} className="p-2 -ml-2"><BackIcon className="w-6 h-6 text-green-400" /></button>
                    <h2 className="text-xl font-bold text-green-300 mx-auto">Passenger Chat</h2>
                    <div className="w-10"></div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'driver' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'passenger' && 
                                <img src="https://i.pravatar.cc/40?u=passenger" alt="Passenger" className="w-8 h-8 rounded-full flex-shrink-0" />
                            }
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'driver' ? 'bg-green-600 text-black rounded-br-none' : 'bg-gray-700 text-white rounded-bl-none'}`}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-4 border-t border-gray-700">
                    <div className="flex overflow-x-auto space-x-2 mb-3 pb-2 -mx-4 px-4">
                        {QUICK_REPLIES.map((reply, index) => (
                            <button
                                key={index}
                                onClick={() => handleSendQuickReply(reply)}
                                className="flex-shrink-0 text-left bg-gray-800 text-green-300 px-3 py-2 rounded-full hover:bg-gray-700 transition-colors text-sm whitespace-nowrap"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleSendForm} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="စာရိုက်ပါ..."
                            className="flex-1 bg-gray-800 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button type="submit" className="bg-green-500 rounded-full p-3 text-black flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default ChatModal;