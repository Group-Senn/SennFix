import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAbsoluteImageUrl, handleImageError } from '../utils/imageHelper';

function ChatsPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(window.API_URL + '/api/chats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No hay mensajes');
        const data = await response.json();
        setConversations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
    const interval = setInterval(fetchConversations, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 justify-between border-b border-primary/10 dark:border-slate-700">
        <h2 className="text-primary dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Chats</h2>
      </header>

      <main className="flex-1 pb-32">
        {loading && <div className="p-8 text-center text-primary/70">Cargando chats...</div>}
        {error && <div className="p-8 text-center text-primary/70">{error}</div>}
        {!loading && !error && conversations.length === 0 && (
          <div className="p-8 text-center text-primary/70">No hay mensajes</div>
        )}
        {!loading && !error && conversations.length > 0 && (
          <div className="p-4 space-y-2">
            {conversations.map(chat => (
              <Link to={`/chats/${chat.id}`} key={chat.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 transition-colors">
                <div className="relative">
                  <img 
                    src={getAbsoluteImageUrl(chat.other_user_avatar)} 
                    alt={chat.other_user_name} 
                    className="w-14 h-14 rounded-full object-cover" 
                    onError={handleImageError}
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-primary dark:text-slate-100">{chat.other_user_name}</h3>
                    <p className="text-xs text-primary/50 flex-shrink-0">
                      {chat.last_message_time ? new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <p className="text-sm text-primary/70 dark:text-slate-400 truncate">{chat.last_message || 'Inicia una conversación'}</p>
                    {/* La lógica de no leídos se añadirá en el futuro */}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default ChatsPage;