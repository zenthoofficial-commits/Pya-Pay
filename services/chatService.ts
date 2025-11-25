import { ref, push, serverTimestamp } from 'firebase/database';
import { db } from './firebase';

export const sendMessage = async (tripId: string, text: string) => {
    if (text.trim() === '') return;
    try {
        const messagesRef = ref(db, `chats/${tripId}/messages`);
        await push(messagesRef, {
            text,
            sender: 'driver',
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error sending message:", error);
    }
};