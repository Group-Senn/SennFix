import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function StarInput({ rating, setRating }) {
  return (
    <div className="flex justify-center gap-2">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={starValue}
            onClick={() => setRating(starValue)}
            className="transition-transform duration-150 ease-in-out hover:scale-125 bg-transparent border-none cursor-pointer p-0"
          >
            <span
              className={`material-symbols-outlined !text-4xl ${
                starValue <= rating ? 'text-amber-500 fill-1' : 'text-slate-300 dark:text-slate-600'
              }`}
            >
              star
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ChatRoomPage() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Estados para menús y modales
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isReasonDropdownOpen, setIsReasonDropdownOpen] = useState(false);

  // Estados del formulario de calificación
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Estados del formulario de reporte
  const [reportReason, setReportReason] = useState('Inasistencia o abandono');
  const [reportDetails, setReportDetails] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Carga y polling de mensajes cada 3 segundos
  useEffect(() => {
    const fetchChatData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:3000/api/chats/${chatId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al cargar el chat.');
        const data = await response.json();
        setMessages(data.messages);
        setOtherUser(data.otherUser);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
    const interval = setInterval(fetchChatData, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(scrollToBottom, [messages]);

  // Enviar mensaje (corregido para usar variable local en vez de estado borrado)
  const handleSend = async (e) => {
    e.preventDefault();
    const contentToSend = newMessage.trim();
    if (!contentToSend) return;

    const token = localStorage.getItem('token');
    const tempId = Date.now();
    const messageToSend = {
      id: tempId,
      content: contentToSend,
      sender_id: user.id,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, messageToSend]);
    setNewMessage('');

    try {
      const response = await fetch(`http://localhost:3000/api/chats/${chatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: contentToSend })
      });
      const savedMessage = await response.json();
      if (!response.ok) throw new Error('No se pudo enviar el mensaje.');
      setMessages(prev => prev.map(msg => msg.id === tempId ? savedMessage : msg));
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  // Enviar calificación
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (rating === 0) {
      setReviewError('Por favor, selecciona una calificación de estrellas.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/professionals/${otherUser.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment: reviewComment }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo enviar la calificación.');

      setReviewSuccess('¡Calificación enviada con éxito!');
      setTimeout(() => {
        setShowReviewModal(false);
        setRating(0);
        setReviewComment('');
        setReviewSuccess('');
      }, 1500);
    } catch (err) {
      setReviewError(err.message);
    }
  };

  // Enviar reporte
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportError('');
    setReportSuccess('');

    if (!reportDetails.trim()) {
      setReportError('Por favor, ingresa los detalles del reporte.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reported_id: otherUser.id,
          reason: reportReason,
          details: reportDetails
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo enviar el reporte.');

      setReportSuccess('Reporte enviado al administrador con éxito.');
      setTimeout(() => {
        setShowReportModal(false);
        setReportDetails('');
        setReportSuccess('');
      }, 1500);
    } catch (err) {
      setReportError(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-primary/70 dark:text-slate-400">Cargando...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 border-b border-primary/10 dark:border-slate-700 relative">
        <Link to="/chats" className="text-primary dark:text-slate-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 dark:hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h2 className="font-bold text-primary dark:text-slate-100">{otherUser?.name || 'Cargando...'}</h2>
          <p className="text-xs text-primary/60 dark:text-slate-450">En línea</p>
        </div>
        
        {/* Botón de tres puntos */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-primary dark:text-slate-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 dark:hover:bg-slate-700 transition-colors bg-transparent border-none cursor-pointer"
        >
          <span className="material-symbols-outlined">more_vert</span>
        </button>

        {/* Menú desplegable */}
        {isMenuOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute right-4 top-14 z-50 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-primary/10 dark:border-slate-700 py-1 overflow-hidden animate-feedback">
              {otherUser?.user_type === 'professional' && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate(`/profile/${otherUser.id}`);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-semibold text-primary dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 border-none bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Ver Perfil
                </button>
              )}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowReviewModal(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-primary dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 border-none bg-transparent cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">star</span>
                Calificar Usuario
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowReportModal(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 border-none bg-transparent cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-red-600">flag</span>
                Reportar Usuario
              </button>
            </div>
          </>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-background-light dark:bg-background-dark pb-24">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${msg.sender_id === user.id ? 'bg-primary text-white rounded-br-lg' : 'bg-white dark:bg-slate-700 text-primary dark:text-slate-100 rounded-bl-lg'}`}>
              <p>{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.sender_id === user.id ? 'text-white/70' : 'text-primary/50 dark:text-slate-400'} text-right`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </main>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md lg:max-w-6xl p-4 bg-white dark:bg-slate-900 border-t border-primary/10 dark:border-slate-800">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Escribe un mensaje..." 
            className="w-full pl-4 pr-4 py-3 rounded-full border-none bg-background-light dark:bg-slate-800 text-primary dark:text-slate-100 focus:ring-2 focus:ring-primary" 
          />
          <button type="submit" className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center transition-transform active:scale-90 border-none cursor-pointer">
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </footer>

      {/* Modal para Calificar Usuario */}
      {showReviewModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowReviewModal(false)}
        >
          <div 
            className="relative w-full max-w-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-6 rounded-2xl shadow-2xl flex flex-col space-y-4 border border-outline-variant/10 dark:border-slate-700 animate-feedback"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="font-display text-lg font-bold text-primary dark:text-slate-100">Calificar a {otherUser?.name}</h3>
              <button 
                type="button" 
                onClick={() => setShowReviewModal(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-primary/80 dark:text-slate-300 block mb-2 text-center">Tu calificación</label>
                <StarInput rating={rating} setRating={setRating} />
              </div>
              <div>
                <label className="text-sm font-bold text-primary/85 dark:text-slate-300 block mb-2">Comentario (opcional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700/50 text-primary dark:text-slate-100 border border-outline-variant/20 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-200"
                  placeholder="Describe tu experiencia con este usuario..."
                ></textarea>
              </div>
              
              {reviewError && <p className="text-error text-sm text-center font-semibold">{reviewError}</p>}
              {reviewSuccess && <p className="text-teal-600 dark:text-teal-400 text-sm text-center font-semibold">{reviewSuccess}</p>}
              
              <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-lg font-bold text-lg transition-all active:scale-95 border-none cursor-pointer shadow-md hover:shadow-lg">
                Publicar Reseña
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Reportar Usuario */}
      {showReportModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowReportModal(false)}
        >
          <div 
            className="relative w-full max-w-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-6 rounded-2xl shadow-2xl flex flex-col space-y-4 border border-outline-variant/10 dark:border-slate-700 animate-feedback"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="font-display text-lg font-bold text-error dark:text-red-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-error">report</span>
                Reportar Usuario
              </h3>
              <button 
                type="button" 
                onClick={() => setShowReportModal(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-primary/85 dark:text-slate-300 block mb-2">Motivo del Reporte</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsReasonDropdownOpen(!isReasonDropdownOpen)}
                    className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700/50 text-primary dark:text-slate-100 border border-outline-variant/20 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:outline-none flex justify-between items-center text-left transition-all duration-200 cursor-pointer"
                  >
                    <span>{reportReason}</span>
                    <span className="material-symbols-outlined text-[20px] transition-transform duration-200" style={{ transform: isReasonDropdownOpen ? 'rotate(180deg)' : 'none' }}>
                      expand_more
                    </span>
                  </button>
                  {isReasonDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsReasonDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 mt-1 z-50 bg-white dark:bg-slate-800 border border-outline-variant/20 dark:border-slate-700 rounded-lg shadow-xl py-1 overflow-hidden animate-feedback">
                        {[
                          "Inasistencia o abandono",
                          "Trabajo mal realizado o incompleto",
                          "Llegada fuera de horario",
                          "Falta de respeto o trato agresivo",
                          "Invasión de privacidad o acoso",
                          "Daño a la propiedad o bienes",
                          "Robo o sustracción de pertenencias",
                          "Cobro indebido o cambio de tarifa",
                          "Perfil o identidad falsa",
                          "Spam o publicidad"
                        ].map((reason) => (
                          <button
                            key={reason}
                            type="button"
                            onClick={() => {
                              setReportReason(reason);
                              setIsReasonDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-none bg-transparent cursor-pointer ${
                              reportReason === reason 
                                ? 'text-primary dark:text-teal-400 bg-primary/5 dark:bg-teal-500/5 font-bold' 
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-bold text-primary/85 dark:text-slate-300 block mb-2">Detalles del Suceso <span className="text-red-500">*</span></label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows="4"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700/50 text-primary dark:text-slate-100 border border-outline-variant/20 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-200"
                  placeholder="Por favor, describe detalladamente lo sucedido..."
                ></textarea>
              </div>

              {reportError && <p className="text-error text-sm text-center font-semibold">{reportError}</p>}
              {reportSuccess && <p className="text-teal-600 dark:text-teal-455 text-sm text-center font-semibold">{reportSuccess}</p>}

              <button type="submit" className="w-full bg-error hover:bg-error/90 text-on-error py-3 rounded-lg font-bold text-lg transition-all active:scale-95 border-none cursor-pointer shadow-md hover:shadow-lg">
                Enviar Reporte
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatRoomPage;