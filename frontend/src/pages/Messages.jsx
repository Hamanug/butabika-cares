import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Send, User as UserIcon } from 'lucide-react';

export default function Messages() {
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { socket, onlineUsers } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const endpoint = user?.role === 'therapist' 
          ? `${import.meta.env.VITE_API_URL}/api/appointments/my-sessions` 
          : `${import.meta.env.VITE_API_URL}/api/therapists/active`;
        
        const response = await axios.get(endpoint, { withCredentials: true });
        
        let rawUsers = response.data;
        if (user?.role === 'therapist') {
            rawUsers = response.data.map(appt => ({
                ...appt,
                id: appt.patient_id,
                first_name: appt.other_first,
                last_name: appt.other_last
            }));
        }
        
        const validUsers = rawUsers.filter(u => u && (u.patient_id || u.therapist_id));
        const uniqueContacts = Array.from(new Map(
            validUsers.map(u => {
                const uniqueId = user?.role === 'therapist' ? u.patient_id : u.therapist_id;
                // Ensure the uniqueId is mapped to the object's core id property for UI rendering
                return [uniqueId, { ...u, id: uniqueId }];
            })
        ).values());
        
        setContacts(uniqueContacts);
      } catch (err) {
        console.error('Failed to load contacts', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
        fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    if (!activeChat) return;
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${activeChat.id}`, { withCredentials: true });
        setMessages(response.data);
        scrollToBottom();

        await axios.put(`${import.meta.env.VITE_API_URL}/api/messages/mark-read/${activeChat.id}`, {}, { withCredentials: true });
        if (socket) {
          socket.emit('messages_read');
        }
      } catch (err) {
        console.error('Failed to load messages or mark as read', err);
      }
    };
    fetchMessages();
  }, [activeChat, socket]);

  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveMessage = (message) => {
      if (activeChat && (message.sender_id === activeChat.id || message.receiver_id === activeChat.id)) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    };
  
    socket.on('receive_message', handleReceiveMessage);
    return () => socket.off('receive_message', handleReceiveMessage);
  }, [socket, activeChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
        receiver_id: activeChat.id,
        content: newMessage
      }, { withCredentials: true });

      const savedMessage = response.data;
      if (socket) {
        socket.emit("send_message", savedMessage);
      }
      setMessages(prev => [...prev, savedMessage]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 pt-16">
      <div className="w-1/3 max-w-sm border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
             <div className="p-4 text-center text-slate-500 text-sm">Loading contacts...</div>
          ) : contacts.length === 0 ? (
             <div className="p-4 text-center text-slate-500 text-sm">No contacts found</div>
          ) : (
            contacts.map(contact => {
                const isOnline = onlineUsers.includes(contact.id);
                const isActive = activeChat?.id === contact.id;
                return (
                    <div 
                        key={contact.id} 
                        onClick={() => setActiveChat(contact)}
                        className={`p-4 border-b border-slate-50 cursor-pointer flex items-center transition-colors ${isActive ? 'bg-orange-50' : 'hover:bg-slate-50'}`}
                    >
                        <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                {getInitials(contact.first_name, contact.last_name)}
                            </div>
                            {isOnline && (
                                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                            )}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <h3 className={`text-sm font-medium truncate ${isActive ? 'text-orange-900' : 'text-slate-900'}`}>
                                {contact.first_name} {contact.last_name}
                            </h3>
                            <p className="text-xs text-slate-500 truncate">
                                {isOnline ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>
                );
            })
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50">
        {activeChat ? (
          <>
            <div className="p-4 border-b border-slate-200 bg-white flex items-center shadow-sm z-10">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold mr-3">
                {getInitials(activeChat.first_name, activeChat.last_name)}
              </div>
              <div>
                  <h2 className="text-lg font-medium text-slate-900">
                      {activeChat.first_name} {activeChat.last_name}
                  </h2>
                  <p className="text-xs text-slate-500">
                      {onlineUsers.includes(activeChat.id) ? 'Active now' : 'Offline'}
                  </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                  <div className="text-center text-slate-500 mt-10 text-sm">
                      No messages yet. Start the conversation!
                  </div>
              ) : (
                  messages.map(msg => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                                isMine 
                                    ? 'bg-[#e87a5d] text-white rounded-tr-none' 
                                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                            }`}>
                                <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                                <span className={`text-[10px] mt-1 block text-right ${isMine ? 'text-orange-100' : 'text-slate-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                  })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#e87a5d] focus:border-[#e87a5d] text-sm text-slate-900"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="h-10 w-10 rounded-full bg-[#e87a5d] hover:bg-[#d6694c] flex items-center justify-center text-white disabled:opacity-50 transition-colors shrink-0"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Send className="h-8 w-8 text-slate-300 ml-1" />
            </div>
            <p className="font-medium text-slate-600">Select a contact to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
