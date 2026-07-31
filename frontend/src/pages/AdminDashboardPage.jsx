import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAbsoluteImageUrl, handleImageError, handleGalleryError } from '../utils/imageHelper';

// Configuración de iconos personalizados para Leaflet en Panel Admin
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function AdminDashboardPage() {
  const { user, token, login, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'stats';
  
  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };
  
  // Datos del Dashboard
  const [stats, setStats] = useState(null);
  const [pendingProfessionals, setPendingProfessionals] = useState([]);
  const [pendingClients, setPendingClients] = useState([]);
  const [approvedProfessionals, setApprovedProfessionals] = useState([]);
  const [activeClients, setActiveClients] = useState([]);
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [pendingPortfolio, setPendingPortfolio] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  
  // Perfil del Administrador
  const [adminProfileName, setAdminProfileName] = useState(user?.name || 'admin');
  const [adminProfileEmail, setAdminProfileEmail] = useState(user?.email || 'admin@gmail.com');
  const [adminProfilePhone, setAdminProfilePhone] = useState('');
  const [adminProfilePassword, setAdminProfilePassword] = useState('');
  const [adminProfileFile, setAdminProfileFile] = useState(null);
  const [adminProfileFeedback, setAdminProfileFeedback] = useState(null);

  useEffect(() => {
    if (user) {
      setAdminProfileName(user.name || '');
      setAdminProfileEmail(user.email || '');
      setAdminProfilePhone(user.phone_number || '');
    }
  }, [user]);

  const handleUpdateAdminProfile = async (e) => {
    e.preventDefault();
    setAdminProfileFeedback(null);
    try {
      const formData = new FormData();
      formData.append('name', adminProfileName);
      formData.append('email', adminProfileEmail);
      formData.append('phone_number', adminProfilePhone);
      if (adminProfilePassword) {
        formData.append('password', adminProfilePassword);
      }
      if (adminProfileFile) {
        formData.append('adminAvatar', adminProfileFile);
      }

      const response = await fetch(window.API_URL + '/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al actualizar el perfil.');
      
      // Actualizar sesión
      login(data.token);
      setAdminProfilePassword(''); // Limpiar contraseña
      setAdminProfileFile(null); // Limpiar archivo seleccionado
      setAdminProfileFeedback({ type: 'success', text: 'Perfil de administrador actualizado con éxito.' });
    } catch (err) {
      setAdminProfileFeedback({ type: 'error', text: err.message });
    }
  };

  // Listas para el módulo de chat
  const [allProfessionals, setAllProfessionals] = useState([]);
  const [adminChats, setAdminChats] = useState([]);
  const [searchChatQuery, setSearchChatQuery] = useState('');
  
  // Chat activo
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversationData, setActiveConversationData] = useState(null); // { messages, otherUser }
  const [messageInput, setMessageInput] = useState('');
  const chatMessagesEndRef = useRef(null);
  
  // Cola de verificaciones
  const [verificationSubTab, setVerificationSubTab] = useState('pending-pros'); // pending-pros, pending-clients, approved-pros, suspended-users
  const [searchVerificationQuery, setSearchVerificationQuery] = useState('');
  const [selectedVerificationItemId, setSelectedVerificationItemId] = useState(null);
  const [docValidations, setDocValidations] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga general de datos de administración
  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Estadísticas
      const resStats = await fetch(window.API_URL + '/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resStats.ok) throw new Error('Error al cargar estadísticas.');
      const dataStats = await resStats.json();
      setStats(dataStats);

      // 2. Cola de Verificaciones
      const resPendingPros = await fetch(window.API_URL + '/api/admin/pending-professionals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resPendingPros.ok) throw new Error('Error al cargar profesionales pendientes.');
      const dataPendingPros = await resPendingPros.json();
      setPendingProfessionals(dataPendingPros);

      const resPendingClients = await fetch(window.API_URL + '/api/admin/pending-clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resPendingClients.ok) throw new Error('Error al cargar clientes menores pendientes.');
      const dataPendingClients = await resPendingClients.json();
      setPendingClients(dataPendingClients);

      const resApprovedPros = await fetch(window.API_URL + '/api/admin/verified-professionals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resApprovedPros.ok) throw new Error('Error al cargar profesionales aprobados.');
      const dataApprovedPros = await resApprovedPros.json();
      setApprovedProfessionals(dataApprovedPros);

      const resSuspended = await fetch(window.API_URL + '/api/admin/suspended-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resSuspended.ok) throw new Error('Error al cargar usuarios suspendidos.');
      const dataSuspended = await resSuspended.json();
      setSuspendedUsers(dataSuspended);

      const resActiveClients = await fetch(window.API_URL + '/api/admin/active-clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resActiveClients.ok) throw new Error('Error al cargar clientes activos.');
      const dataActiveClients = await resActiveClients.json();
      setActiveClients(dataActiveClients);

      // 3. Reclamos
      const resComplaints = await fetch(window.API_URL + '/api/admin/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resComplaints.ok) throw new Error('Error al cargar los reclamos de soporte.');
      const dataComplaints = await resComplaints.json();
      setComplaints(dataComplaints);

      // 4. Historial de Trabajos
      const resJobs = await fetch(window.API_URL + '/api/admin/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resJobs.ok) throw new Error('Error al cargar trabajos.');
      const dataJobs = await resJobs.json();
      setJobs(dataJobs);

      // 5. Todos los profesionales para el chat
      const resAllPros = await fetch(window.API_URL + '/api/admin/professionals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resAllPros.ok) throw new Error('Error al cargar listado de profesionales.');
      const dataAllPros = await resAllPros.json();
      setAllProfessionals(dataAllPros);

      // 6. Fotos de portafolio pendientes
      const resPendingPort = await fetch(window.API_URL + '/api/admin/pending-portfolio', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resPendingPort.ok) throw new Error('Error al cargar portafolios pendientes.');
      const dataPendingPort = await resPendingPort.json();
      setPendingPortfolio(dataPendingPort);

      // 7. Alertas de seguridad
      const resAlerts = await fetch(window.API_URL + '/api/admin/security-alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resAlerts.ok) throw new Error('Error al cargar alertas de seguridad.');
      const dataAlerts = await resAlerts.json();
      setSecurityAlerts(dataAlerts);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar lista de chats del administrador
  const fetchAdminChats = async () => {
    try {
      const response = await fetch(window.API_URL + '/api/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAdminChats(data);
      }
    } catch (err) {
      console.error('Error al cargar chats:', err);
    }
  };

  useEffect(() => {
    if (user && user.user_type === 'admin') {
      fetchAdminData();
      fetchAdminChats();
    } else {
      setError('Acceso denegado. Solo administradores pueden ver esta página.');
      setLoading(false);
    }
  }, [user, token]);

  // Carga periódica de la lista de chats en la mensajería central (cada 4 segundos)
  useEffect(() => {
    if (user && user.user_type === 'admin' && activeTab === 'chat') {
      const interval = setInterval(fetchAdminChats, 4000);
      return () => clearInterval(interval);
    }
  }, [user, token, activeTab]);

  // Carga periódica de mensajes cuando hay una conversación abierta (Polling cada 3 segundos)
  useEffect(() => {
    if (!activeConversationId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${window.API_URL}/api/chats/${activeConversationId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setActiveConversationData(data);
        }
      } catch (err) {
        console.error('Error al obtener mensajes en bucle:', err);
      }
    };

    fetchMessages(); // Carga inicial inmediata
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeConversationId, token]);

  // Auto-scroll al final del chat
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversationData?.messages]);

  // Selección automática del primer elemento en la pestaña de verificaciones
  useEffect(() => {
    const list = getActiveVerificationList();
    if (list && list.length > 0) {
      setSelectedVerificationItemId(list[0].id);
    } else {
      setSelectedVerificationItemId(null);
    }
  }, [verificationSubTab, pendingProfessionals, pendingClients, approvedProfessionals, activeClients, suspendedUsers]);

  const getActiveVerificationList = () => {
    switch (verificationSubTab) {
      case 'pending-pros':
        return pendingProfessionals;
      case 'pending-clients':
        return pendingClients;
      case 'approved-pros':
        return approvedProfessionals;
      case 'active-clients':
        return activeClients;
      case 'suspended-users':
        return suspendedUsers;
      default:
        return [];
    }
  };

  const handleVerifyProfessional = async (professionalId) => {
    try {
      const response = await fetch(`${window.API_URL}/api/admin/verify-professional/${professionalId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al verificar profesional.');
      fetchAdminData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleVerifyClient = async (clientId) => {
    try {
      const response = await fetch(`${window.API_URL}/api/admin/verify-client/${clientId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al verificar cliente.');
      fetchAdminData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSuspendUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de suspender o rechazar esta cuenta?')) {
      return;
    }
    try {
      const response = await fetch(`${window.API_URL}/api/admin/suspend-user/${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al suspender cuenta.');
      fetchAdminData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleResolveComplaint = async (complaintId) => {
    try {
      const response = await fetch(`${window.API_URL}/api/admin/complaints/${complaintId}/resolve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al marcar como resuelto.');
      fetchAdminData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      const response = await fetch(`${window.API_URL}/api/admin/security-alerts/${alertId}/resolve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('No se pudo resolver la alerta de seguridad.');
      fetchAdminData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Iniciar conversación directa desde Reclamos o Buscador
  const handleStartChatWithUser = async (recipientId) => {
    try {
      const response = await fetch(window.API_URL + '/api/chats/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId })
      });
      if (!response.ok) throw new Error('No se pudo iniciar el canal de chat.');
      const data = await response.json();
      setActiveConversationId(data.conversationId);
      fetchAdminChats();
      setActiveTab('chat'); // Redirigir al panel de chat
    } catch (err) {
      alert(`Error de mensajería: ${err.message}`);
    }
  };

  // Enviar mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversationId) return;

    const currentMsg = messageInput;
    setMessageInput('');

    try {
      const response = await fetch(`${window.API_URL}/api/chats/${activeConversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: currentMsg })
      });
      if (response.ok) {
        // Recargar mensajes inmediatamente
        const resData = await fetch(`${window.API_URL}/api/chats/${activeConversationId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resData.ok) {
          const updated = await resData.json();
          setActiveConversationData(updated);
          fetchAdminChats();
        }
      }
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const handleVerifyPortfolioPhoto = async (photoId, status) => {
    try {
      const response = await fetch(`${window.API_URL}/api/admin/portfolio/${photoId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al verificar la foto.');

      // Recargar datos
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const setDocValidationState = (itemId, docKey, state) => {
    setDocValidations(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { ciFront: 'pending', ciBack: 'pending', felcc: 'pending' }),
        [docKey]: state
      }
    }));
  };

  const getDocState = (itemId, docKey) => {
    return docValidations[itemId]?.[docKey] || 'pending';
  };

  const getFilteredVerificationList = () => {
    return getActiveVerificationList().filter(item => 
      item.name?.toLowerCase().includes(searchVerificationQuery.toLowerCase()) ||
      (item.specialty && item.specialty.toLowerCase().includes(searchVerificationQuery.toLowerCase()))
    );
  };

  const filteredVerificationList = getFilteredVerificationList();
  const selectedVerificationItem = getActiveVerificationList().find(item => item.id === selectedVerificationItemId);

  // Filtrado de profesionales para búsqueda en pestaña de chat
  const filteredChatProsList = allProfessionals.filter(pro =>
    pro.name?.toLowerCase().includes(searchChatQuery.toLowerCase()) ||
    pro.specialty?.toLowerCase().includes(searchChatQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-background text-primary dark:text-teal-400">
        <span className="material-symbols-outlined text-5xl animate-spin">sync</span>
        <p className="mt-4 font-semibold font-display">Cargando consola central...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-background text-red-500 text-center p-6">
        <span className="material-symbols-outlined text-5xl">warning</span>
        <p className="mt-4 font-bold font-display">{error}</p>
        <Link to="/home" className="mt-6 px-6 py-3 bg-primary text-white rounded-lg font-bold">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="bg-surface dark:bg-slate-950 text-on-surface dark:text-slate-100 font-sans h-screen flex overflow-hidden w-full transition-colors duration-200">
      
      {/* Sidebar de Navegación Principal del Admin */}
      <aside className="w-64 bg-surface-container-low dark:bg-slate-900 border-r border-outline-variant/20 dark:border-slate-800 flex flex-col hidden md:flex h-full z-10 relative">
        <div className="p-6">
          <Link to="/home">
            <h1 className="font-headline-xl text-3xl tracking-tight text-primary dark:text-teal-400 font-bold">
              SENN <span className="text-secondary dark:text-teal-500 text-xl font-normal">Admin</span>
            </h1>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <p className="text-xs text-on-surface-variant/70 dark:text-slate-400 uppercase mb-4 px-2 tracking-widest font-bold">Consola</p>
          
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-semibold text-sm ${
              activeTab === 'stats'
                ? 'bg-primary/10 text-primary dark:bg-teal-500/10 dark:text-teal-400 font-bold'
                : 'text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">analytics</span>
            <span className="flex-1 text-left">Dashboard Estadísticas</span>
          </button>

          <button
            onClick={() => setActiveTab('verifications')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-semibold text-sm ${
              activeTab === 'verifications'
                ? 'bg-primary/10 text-primary dark:bg-teal-500/10 dark:text-teal-400 font-bold'
                : 'text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
            <span className="flex-1 text-left">Aceptar Cuentas</span>
            {(pendingProfessionals.length + pendingClients.length) > 0 && (
              <span className="bg-primary text-white dark:bg-teal-600 dark:text-white text-xs px-2 py-0.5 rounded-full">
                {pendingProfessionals.length + pendingClients.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('portfolio-verifications')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-semibold text-sm ${
              activeTab === 'portfolio-verifications'
                ? 'bg-primary/10 text-primary dark:bg-teal-500/10 dark:text-teal-400 font-bold'
                : 'text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">photo_library</span>
            <span className="flex-1 text-left">Aprobar Galería</span>
            {pendingPortfolio.length > 0 && (
              <span className="bg-primary text-white dark:bg-teal-600 dark:text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {pendingPortfolio.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-semibold text-sm ${
              activeTab === 'complaints'
                ? 'bg-primary/10 text-primary dark:bg-teal-500/10 dark:text-teal-400 font-bold'
                : 'text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">report</span>
            <span className="flex-1 text-left">Buzón de Reclamos</span>
            {complaints.filter(c => c.status === 'open').length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {complaints.filter(c => c.status === 'open').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('security-alerts')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-semibold text-sm ${
              activeTab === 'security-alerts'
                ? 'bg-primary/10 text-primary dark:bg-teal-500/10 dark:text-teal-400 font-bold'
                : 'text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">gpp_bad</span>
            <span className="flex-1 text-left">Alertas de Seguridad</span>
            {securityAlerts.filter(a => a.status === 'open').length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                {securityAlerts.filter(a => a.status === 'open').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-semibold text-sm ${
              activeTab === 'chat'
                ? 'bg-primary/10 text-primary dark:bg-teal-500/10 dark:text-teal-400 font-bold'
                : 'text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span className="flex-1 text-left">Mensajería Central</span>
          </button>

          <div className="my-6 border-t border-outline-variant/20 dark:border-slate-800"></div>
          <p className="text-xs text-on-surface-variant/70 dark:text-slate-400 uppercase mb-4 px-2 tracking-widest font-bold">Monitoreo</p>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-semibold text-sm ${
              activeTab === 'jobs'
                ? 'bg-primary/10 text-primary dark:bg-teal-500/10 dark:text-teal-400 font-bold'
                : 'text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">work</span>
            <span className="flex-1 text-left">Historial de Trabajos</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-semibold text-sm ${
              activeTab === 'profile'
                ? 'bg-primary/10 text-primary dark:bg-teal-500/10 dark:text-teal-400 font-bold'
                : 'text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
            <span className="flex-1 text-left">Mi Perfil Admin</span>
          </button>
        </nav>

        <div className="p-4 border-t border-outline-variant/20 dark:border-slate-800">
          <div 
            onClick={() => setActiveTab('profile')}
            className="flex items-center justify-between cursor-pointer hover:bg-surface-container-high dark:hover:bg-slate-800 p-2 rounded-xl transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-slate-800 flex items-center justify-center text-primary dark:text-teal-400 font-bold">
                <span className="material-symbols-outlined">shield_person</span>
              </div>
              <div>
                <p className="text-sm font-bold text-primary dark:text-slate-100">{user?.name || 'Administrador'}</p>
                <p className="text-xs text-on-surface-variant dark:text-slate-400">Ajustes Perfil</p>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleLogout(); }} 
              className="p-1 text-red-500 hover:bg-red-500/10 rounded" 
              title="Cerrar sesión"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Area Central de Contenido */}
      <main className="flex-1 flex flex-col h-full bg-background dark:bg-slate-950 relative overflow-hidden">
        
        {/* Cabecera Móvil y Selector de Pestaña */}
        <header className="bg-surface/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-outline-variant/10 dark:border-slate-800 flex justify-between items-center px-6 h-16 w-full z-40 sticky top-0 shrink-0">
          <div className="flex items-center md:hidden w-full justify-between gap-2">
            <h1 className="font-headline-lg-mobile text-lg font-bold text-primary dark:text-teal-400">SENN Admin</h1>
            <select
              value={activeTab}
              onChange={e => {
                setActiveTab(e.target.value);
                setSearchChatQuery('');
                setSearchVerificationQuery('');
              }}
              className="bg-white dark:bg-slate-800 border border-outline-variant/20 dark:border-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-bold text-primary dark:text-slate-100 focus:outline-none"
            >
              <option value="stats">Estadísticas</option>
              <option value="verifications">Aceptar Cuentas</option>
              <option value="portfolio-verifications">Aprobar Galería</option>
              <option value="complaints">Reclamos</option>
              <option value="chat">Mensajería Central</option>
              <option value="jobs">Trabajos</option>
              <option value="profile">Mi Perfil</option>
            </select>
          </div>
          
          <div className="hidden md:flex items-center text-on-surface-variant dark:text-slate-350 font-semibold text-sm">
            <span className="material-symbols-outlined mr-2 text-primary dark:text-teal-400">dashboard</span>
            <span>Panel Administrativo</span>
            <span className="mx-2">/</span>
            <span className="text-primary dark:text-teal-400 font-bold capitalize">
              {activeTab === 'stats' 
                ? 'Dashboard de Estadísticas' 
                : activeTab === 'verifications' 
                ? 'Aprobación de Cuentas' 
                : activeTab === 'portfolio-verifications'
                ? 'Aprobación de Galería de Fotos'
                : activeTab === 'complaints' 
                ? 'Reclamos de Soporte' 
                : activeTab === 'security-alerts'
                ? 'Alertas de Seguridad'
                : activeTab === 'chat' 
                ? 'Mensajería Central' 
                : activeTab === 'profile'
                ? 'Mi Perfil Admin'
                : 'Logs de Trabajos'}
            </span>
          </div>
        </header>

        {/* --- RENDERIZADO DINÁMICO DE PESTAÑAS --- */}
        <div className="flex-1 overflow-hidden relative">

          {/* 1. TAB ESTADÍSTICAS (Analytics & Geodensity) */}
          {activeTab === 'stats' && stats && (
            <div className="h-full overflow-y-auto p-6 md:p-8 space-y-8 animate-feedback">
              <div className="max-w-6xl mx-auto space-y-6">
                <div>
                  <h2 className="text-3xl font-display font-bold text-primary dark:text-slate-100">Panel de Estadísticas</h2>
                  <p className="text-sm text-primary/70 dark:text-slate-400">Métricas en tiempo real y densidad geográfica de la plataforma.</p>
                </div>

                {/* Totalizers Bento Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-primary/10 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <span className="material-symbols-outlined text-primary dark:text-teal-400 text-3xl mb-2">engineering</span>
                    <p className="text-xs font-semibold text-primary/60 dark:text-slate-400 uppercase tracking-wider">Profesionales</p>
                    <p className="text-2xl font-bold font-display text-primary dark:text-slate-100 mt-1">{stats.userCounts?.professionals}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-primary/10 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <span className="material-symbols-outlined text-primary dark:text-teal-400 text-3xl mb-2">group</span>
                    <p className="text-xs font-semibold text-primary/60 dark:text-slate-400 uppercase tracking-wider">Clientes</p>
                    <p className="text-2xl font-bold font-display text-primary dark:text-slate-100 mt-1">{stats.userCounts?.clients}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-primary/10 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <span className="material-symbols-outlined text-red-500 text-3xl mb-2">report</span>
                    <p className="text-xs font-semibold text-red-500/80 uppercase tracking-wider">Reclamos Abiertos</p>
                    <p className="text-2xl font-bold font-display text-red-600 dark:text-red-400 mt-1">{complaints.filter(c => c.status === 'open').length}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-primary/10 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                    <span className="material-symbols-outlined text-primary dark:text-teal-400 text-3xl mb-2">work_history</span>
                    <p className="text-xs font-semibold text-primary/60 dark:text-slate-400 uppercase tracking-wider">Trabajos Registrados</p>
                    <p className="text-2xl font-bold font-display text-primary dark:text-slate-100 mt-1">{jobs.length}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Category Distribution list */}
                  <div className="bg-white dark:bg-slate-900 border border-primary/10 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                    <h3 className="font-display font-bold text-lg text-primary dark:text-slate-100 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary dark:text-teal-400">category</span>
                      Distribución por Especialidades
                    </h3>
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                      {stats.specialtyStats?.length === 0 ? (
                        <p className="text-sm text-slate-450 italic">No hay profesionales registrados todavía.</p>
                      ) : (
                        stats.specialtyStats?.map(spec => (
                          <div key={spec.specialty} className="space-y-1">
                            <div className="flex justify-between text-sm font-semibold">
                              <span className="text-primary dark:text-slate-200">{spec.specialty || 'Sin especialidad'}</span>
                              <span className="text-primary/70 dark:text-slate-400">{spec.count}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-primary dark:bg-teal-500 h-full rounded-full" 
                                style={{ width: `${Math.min(100, (parseInt(spec.count) / (stats.userCounts?.professionals || 1)) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Hot Search Zones */}
                  <div className="bg-white dark:bg-slate-900 border border-primary/10 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                    <h3 className="font-display font-bold text-lg text-primary dark:text-slate-100 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary dark:text-teal-400">map</span>
                      Zonas de Mayor Búsqueda
                    </h3>
                    <div className="space-y-4">
                      {stats.zoneSearchStats?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-primary/5 dark:bg-slate-800 text-primary dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-primary dark:text-slate-200">{item.zone}</p>
                            <p className="text-xs text-primary/60 dark:text-slate-400">{item.count} búsquedas mensuales</p>
                          </div>
                          <span className="text-sm font-bold text-primary dark:text-teal-400">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Client Density Zones */}
                  <div className="bg-white dark:bg-slate-900 border border-primary/10 dark:border-slate-800 p-6 rounded-2xl space-y-4 lg:col-span-2">
                    <h3 className="font-display font-bold text-lg text-primary dark:text-slate-100 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary dark:text-teal-400">holiday_village</span>
                      Zonas con Mayor Cantidad de Clientes Activos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {stats.clientZoneStats?.map((item, idx) => (
                        <div key={idx} className="p-4 bg-background-light dark:bg-slate-800/50 border border-primary/5 dark:border-slate-800 rounded-xl text-center space-y-1 shadow-sm">
                          <span className="material-symbols-outlined text-primary dark:text-teal-400">pin_drop</span>
                          <p className="text-xs font-bold text-primary/80 dark:text-slate-300 line-clamp-1">{item.zone.split(' ')[0]}</p>
                          <p className="text-lg font-bold font-display text-primary dark:text-slate-100">{item.count}</p>
                          <p className="text-[10px] text-primary/50 dark:text-slate-400 uppercase tracking-widest font-semibold">Clientes</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mapa Geográfico de Profesionales */}
                  <div className="bg-white dark:bg-slate-900 border border-primary/10 dark:border-slate-800 p-6 rounded-2xl space-y-4 lg:col-span-2 shadow-sm">
                    <h3 className="font-display font-bold text-lg text-primary dark:text-slate-100 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary dark:text-teal-400">map</span>
                      Ubicación de Profesionales
                    </h3>
                    <p className="text-xs text-primary/70 dark:text-slate-400">
                      Marcadores verdes representan profesionales en línea. Marcadores azules representan tiendas o ubicaciones fijas. Marcadores dorados representan profesionales con sello de oro.
                    </p>
                    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-primary/10 dark:border-slate-800 z-10 relative">
                      <MapContainer center={[-17.7833, -63.1821]} zoom={12} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {stats.professionalLocations?.map((loc) => {
                          let lat = parseFloat(loc.latitude);
                          let lon = parseFloat(loc.longitude);
                          let markerType = 'Tienda/Local Fijo';

                          if (loc.is_online && loc.current_latitude && loc.current_longitude) {
                            lat = parseFloat(loc.current_latitude);
                            lon = parseFloat(loc.current_longitude);
                            markerType = 'Online (Tiempo Real)';
                          }

                          if (isNaN(lat) || isNaN(lon)) return null;

                          let icon = blueIcon;
                          if (loc.is_online) {
                            icon = greenIcon;
                          } else if (loc.has_gold_seal) {
                            icon = goldIcon;
                          }

                          return (
                            <Marker key={loc.id} position={[lat, lon]} icon={icon}>
                              <Popup>
                                <div className="text-xs space-y-1">
                                  <h4 className="font-bold text-primary">{loc.name}</h4>
                                  <p><strong>Especialidad:</strong> {loc.specialty}</p>
                                  <p><strong>Estado:</strong> {loc.is_online ? 'Disponible / En Línea' : 'Desconectado'}</p>
                                  <p><strong>Ubicación:</strong> {markerType}</p>
                                </div>
                              </Popup>
                            </Marker>
                          );
                        })}
                      </MapContainer>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* 2. TAB ACEPTAR CUENTAS (Verifications Split Layout) */}
          {activeTab === 'verifications' && (
            <div className="h-full flex overflow-hidden">
              
              {/* Left Column queue list */}
              <section className="w-full md:w-80 lg:w-96 border-r border-outline-variant/10 dark:border-slate-800 flex flex-col h-full shrink-0">
                <div className="p-4 border-b border-outline-variant/10 dark:border-slate-800 space-y-3">
                  
                  {/* Internal Subtabs for verifications */}
                  <div className="flex bg-surface-container dark:bg-slate-800 p-1 rounded-lg text-xs font-bold gap-1">
                    <button
                      onClick={() => { setVerificationSubTab('pending-pros'); setSelectedVerificationItemId(null); }}
                      className={`flex-1 py-1.5 rounded transition-all ${verificationSubTab === 'pending-pros' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-slate-100 font-bold' : 'text-primary/60 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'}`}
                    >
                      Pros Pend. ({pendingProfessionals.length})
                    </button>
                    <button
                      onClick={() => { setVerificationSubTab('pending-clients'); setSelectedVerificationItemId(null); }}
                      className={`flex-1 py-1.5 rounded transition-all ${verificationSubTab === 'pending-clients' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-slate-100 font-bold' : 'text-primary/60 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'}`}
                    >
                      Menores Pend. ({pendingClients.length})
                    </button>
                  </div>
                  <div className="flex bg-surface-container dark:bg-slate-800 p-1 rounded-lg text-xs font-bold gap-1">
                    <button
                      onClick={() => { setVerificationSubTab('approved-pros'); setSelectedVerificationItemId(null); }}
                      className={`flex-1 py-1.5 rounded transition-all ${verificationSubTab === 'approved-pros' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-slate-100 font-bold' : 'text-primary/60 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'}`}
                    >
                      Aprobados
                    </button>
                    <button
                      onClick={() => { setVerificationSubTab('active-clients'); setSelectedVerificationItemId(null); }}
                      className={`flex-1 py-1.5 rounded transition-all ${verificationSubTab === 'active-clients' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-slate-100 font-bold' : 'text-primary/60 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'}`}
                    >
                      Clientes Act. ({activeClients.length})
                    </button>
                    <button
                      onClick={() => { setVerificationSubTab('suspended-users'); setSelectedVerificationItemId(null); }}
                      className={`flex-1 py-1.5 rounded transition-all ${verificationSubTab === 'suspended-users' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-slate-100 font-bold' : 'text-primary/60 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'}`}
                    >
                      Suspendidos
                    </button>
                  </div>

                  <div className="relative bg-white/70 dark:bg-slate-800/70 border border-outline-variant/20 dark:border-slate-700 rounded-lg px-3 py-1 flex items-center">
                    <span className="material-symbols-outlined text-primary/50 dark:text-teal-400 mr-2 text-[18px]">search</span>
                    <input
                      value={searchVerificationQuery}
                      onChange={e => setSearchVerificationQuery(e.target.value)}
                      className="bg-transparent border-none text-xs w-full placeholder-on-surface-variant/50 p-0 focus:outline-none text-primary dark:text-slate-100"
                      placeholder="Buscar por nombre..."
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                  {filteredVerificationList.length === 0 ? (
                    <div className="text-center py-12 text-xs text-primary/50 dark:text-slate-400 italic">
                      No hay solicitudes registradas en esta sección.
                    </div>
                  ) : (
                    filteredVerificationList.map(item => {
                      const isActive = item.id === selectedVerificationItemId;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedVerificationItemId(item.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                            isActive
                              ? 'border-primary/30 bg-surface-container dark:bg-slate-850 dark:border-teal-500/50 shadow-sm'
                              : 'border-outline-variant/30 bg-white dark:bg-slate-900 hover:bg-surface-container-low dark:hover:bg-slate-800'
                          }`}
                        >
                          {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary dark:bg-teal-500"></div>}
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              item.account_status === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                : item.account_status === 'active'
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400'
                            }`}>
                              {item.account_status.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-on-surface-variant dark:text-slate-400 font-semibold">ID: {item.id}</span>
                          </div>
                          <h3 className="font-bold text-primary dark:text-slate-100 text-sm">{item.name}</h3>
                          <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1">
                            {item.specialty || (item.user_type === 'client' ? 'Cliente Menor de Edad' : 'Usuario')}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Right Column detail view */}
              <section className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-surface-container-lowest dark:bg-slate-950">
                {selectedVerificationItem ? (
                  <div className="max-w-3xl space-y-6">
                    
                    {/* Profile Panel Header */}
                    <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800 animate-feedback">
                      <img
                        className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0"
                        src={getAbsoluteImageUrl(selectedVerificationItem.imageUrl)}
                        onError={handleImageError}
                        alt={selectedVerificationItem.name}
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h2 className="font-headline-lg text-xl font-bold text-primary dark:text-slate-100">{selectedVerificationItem.name}</h2>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                            selectedVerificationItem.account_status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                              : selectedVerificationItem.account_status === 'active'
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}>
                            {selectedVerificationItem.account_status.toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-sm font-semibold text-on-surface-variant dark:text-slate-350">
                          {selectedVerificationItem.specialty || (selectedVerificationItem.user_type === 'client' ? 'Cliente Menor de Edad' : 'Solicitud')}
                        </p>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-on-surface-variant dark:text-slate-400">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">phone_iphone</span> {selectedVerificationItem.phone_number}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">mail</span> {selectedVerificationItem.email}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">cake</span> Nacimiento: {new Date(selectedVerificationItem.birth_date).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Verification documents grid */}
                    {selectedVerificationItem.user_type === 'professional' && (
                      <div className="space-y-4">
                        <h3 className="font-headline-md text-lg font-bold text-primary dark:text-slate-100">Documentación Requerida</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Anverso CI */}
                          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-outline-variant/20 dark:border-slate-800 p-5 shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-sm text-primary dark:text-teal-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">badge</span> Anverso C.I.
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                getDocState(selectedVerificationItem.id, 'ciFront') === 'valid'
                                  ? 'bg-green-500/10 text-green-600'
                                  : getDocState(selectedVerificationItem.id, 'ciFront') === 'rejected'
                                  ? 'bg-red-500/10 text-red-600'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {getDocState(selectedVerificationItem.id, 'ciFront').toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="w-full aspect-[1.58] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-outline-variant/10 relative group">
                              {selectedVerificationItem.ci_front_url ? (
                                <img
                                  className="w-full h-full object-cover"
                                  src={`${getAbsoluteImageUrl(selectedVerificationItem.ci_front_url)}?token=${token}`}
                                  onError={handleGalleryError}
                                  alt="Anverso CI"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-slate-450">Sin archivo</div>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => setDocValidationState(selectedVerificationItem.id, 'ciFront', 'valid')}
                                className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-600 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border border-green-500/20"
                              >
                                <span className="material-symbols-outlined text-sm">check</span> Válido
                              </button>
                              <button
                                onClick={() => setDocValidationState(selectedVerificationItem.id, 'ciFront', 'rejected')}
                                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border border-red-500/20"
                              >
                                <span className="material-symbols-outlined text-sm">close</span> Rechazar
                              </button>
                            </div>
                          </div>

                          {/* Reverso CI */}
                          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-outline-variant/20 dark:border-slate-800 p-5 shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-sm text-primary dark:text-teal-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">credit_card</span> Reverso C.I.
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                getDocState(selectedVerificationItem.id, 'ciBack') === 'valid'
                                  ? 'bg-green-500/10 text-green-600'
                                  : getDocState(selectedVerificationItem.id, 'ciBack') === 'rejected'
                                  ? 'bg-red-500/10 text-red-600'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {getDocState(selectedVerificationItem.id, 'ciBack').toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="w-full aspect-[1.58] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-outline-variant/10 relative group">
                              {selectedVerificationItem.ci_back_url ? (
                                <img
                                  className="w-full h-full object-cover"
                                  src={`${getAbsoluteImageUrl(selectedVerificationItem.ci_back_url)}?token=${token}`}
                                  onError={handleGalleryError}
                                  alt="Reverso CI"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-slate-455">Sin archivo</div>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => setDocValidationState(selectedVerificationItem.id, 'ciBack', 'valid')}
                                className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-600 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border border-green-500/20"
                              >
                                <span className="material-symbols-outlined text-sm">check</span> Válido
                              </button>
                              <button
                                onClick={() => setDocValidationState(selectedVerificationItem.id, 'ciBack', 'rejected')}
                                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border border-red-500/20"
                              >
                                <span className="material-symbols-outlined text-sm">close</span> Rechazar
                              </button>
                            </div>
                          </div>

                          {/* FELCC / Background check */}
                          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-outline-variant/20 dark:border-slate-800 p-5 shadow-sm space-y-4 md:col-span-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-sm text-primary dark:text-teal-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">gavel</span> Certificado FELCC / REJAP
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                getDocState(selectedVerificationItem.id, 'felcc') === 'valid'
                                  ? 'bg-green-500/10 text-green-600'
                                  : getDocState(selectedVerificationItem.id, 'felcc') === 'rejected'
                                  ? 'bg-red-500/10 text-red-600'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {getDocState(selectedVerificationItem.id, 'felcc').toUpperCase()}
                              </span>
                            </div>

                            {selectedVerificationItem.felcc_rejap_url ? (
                              <a
                                href={selectedVerificationItem.felcc_rejap_url.startsWith('http') ? selectedVerificationItem.felcc_rejap_url : `${window.API_URL}/${selectedVerificationItem.felcc_rejap_url}?token=${token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-24 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center gap-1 hover:bg-primary/5 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-primary dark:text-teal-400 text-3xl">description</span>
                                <span className="text-xs text-primary/70 dark:text-slate-350 font-bold">Ver antecedentes judiciales (PDF / Imagen)</span>
                              </a>
                            ) : (
                              <div className="w-full h-24 flex items-center justify-center text-xs text-slate-400 italic">No proporcionó antecedentes</div>
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={() => setDocValidationState(selectedVerificationItem.id, 'felcc', 'valid')}
                                className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-600 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border border-green-500/20"
                              >
                                <span className="material-symbols-outlined text-sm">check</span> Válido
                              </button>
                              <button
                                onClick={() => setDocValidationState(selectedVerificationItem.id, 'felcc', 'rejected')}
                                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border border-red-500/20"
                              >
                                <span className="material-symbols-outlined text-sm">close</span> Rechazar
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {selectedVerificationItem.user_type === 'professional' && (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-outline-variant/20 dark:border-slate-800 p-5 shadow-sm space-y-4">
                        <h3 className="font-bold text-sm text-primary dark:text-teal-400 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">work</span> Información Profesional
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-primary/80 dark:text-slate-350">
                          <div className="space-y-2">
                            <p><strong>Especialidad:</strong> {selectedVerificationItem.specialty || 'No especificada'}</p>
                            <p><strong>Servicios Ofrecidos:</strong> {selectedVerificationItem.services_offered || 'No especificados'}</p>
                            <p><strong>Biografía:</strong> {selectedVerificationItem.bio || 'No especificada'}</p>
                          </div>
                          <div className="space-y-2">
                            <p><strong>¿Tiene Tienda Física?:</strong> {selectedVerificationItem.has_store ? 'Sí' : 'No'}</p>
                            {selectedVerificationItem.has_store && (
                              <>
                                <p><strong>Dirección de la Tienda:</strong> {selectedVerificationItem.store_address || 'No especificada'}</p>
                                <p><strong>Coordenadas:</strong> {selectedVerificationItem.latitude && selectedVerificationItem.longitude ? `${selectedVerificationItem.latitude}, ${selectedVerificationItem.longitude}` : 'No especificadas'}</p>
                              </>
                            )}
                            <p><strong>Radio de Acción:</strong> {selectedVerificationItem.action_radius ? `${selectedVerificationItem.action_radius} km` : 'No especificado'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tutor info for minor professionals */}
                    {selectedVerificationItem.user_type === 'professional' && selectedVerificationItem.is_minor && (
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5 space-y-3">
                        <h4 className="font-bold text-sm text-yellow-800 dark:text-yellow-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">warning</span> Verificación de Profesional Menor de Edad
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Este profesional menor de edad requiere la tutoría y el permiso de la defensoría según la Ley 548 de Bolivia.
                        </p>
                        <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                          <p><strong>Nombre del Tutor:</strong> {selectedVerificationItem.tutor_name || 'No especificado'}</p>
                          <p><strong>Teléfono del Tutor:</strong> {selectedVerificationItem.tutor_phone || 'No especificado'}</p>
                        </div>
                        {selectedVerificationItem.defensoria_permit_url ? (
                          <a
                            href={selectedVerificationItem.defensoria_permit_url.startsWith('http') ? selectedVerificationItem.defensoria_permit_url : `${window.API_URL}/${selectedVerificationItem.defensoria_permit_url}?token=${token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-16 bg-amber-500/5 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg border border-dashed border-amber-500/20 flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs font-semibold"
                          >
                            <span className="material-symbols-outlined">description</span>
                            Ver Permiso de la Defensoría (PDF / Imagen)
                          </a>
                        ) : (
                          <div className="text-xs text-red-500 italic">No se adjuntó el permiso de la defensoría.</div>
                        )}
                      </div>
                    )}

                    {/* Tutor info for minors */}
                    {selectedVerificationItem.user_type === 'client' && selectedVerificationItem.account_status === 'pending' && (
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5 space-y-3">
                        <h4 className="font-bold text-sm text-yellow-800 dark:text-yellow-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">warning</span> Verificación de Menor de Edad
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Este usuario menor de edad requiere la verificación de identidad según la Ley 548 de Bolivia.
                        </p>
                        <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                          <p><strong>C.I. Registrado:</strong> {selectedVerificationItem.identity_card || 'No especificado'}</p>
                          <p><strong>Rango de Edad:</strong> Menor de 18 años</p>
                        </div>
                      </div>
                    )}

                    {/* Final Actions Block */}
                    {selectedVerificationItem.account_status === 'pending' && (
                      <div className="pt-6 border-t border-outline-variant/10 dark:border-slate-800 flex gap-4">
                        <button
                          onClick={() => handleSuspendUser(selectedVerificationItem.id)}
                          className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-red-600 border border-red-500/30 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:scale-[0.98] active:scale-95 text-sm"
                        >
                          <span className="material-symbols-outlined text-lg">block</span> Rechazar / Suspender
                        </button>

                        <button
                          onClick={() => {
                            if (selectedVerificationItem.user_type === 'professional') {
                              handleVerifyProfessional(selectedVerificationItem.id);
                            } else {
                              handleVerifyClient(selectedVerificationItem.id);
                            }
                          }}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:scale-[0.98] active:scale-95 shadow-md text-sm"
                        >
                          <span className="material-symbols-outlined text-lg">verified</span> Aprobar Cuenta
                        </button>
                      </div>
                    )}

                    {selectedVerificationItem.account_status === 'active' && (
                      <div className="pt-6 border-t border-outline-variant/10 dark:border-slate-800">
                        <button
                          onClick={() => handleSuspendUser(selectedVerificationItem.id)}
                          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm border border-red-500/20"
                        >
                          <span className="material-symbols-outlined text-sm">block</span> Suspender Cuenta
                        </button>
                      </div>
                    )}

                    {selectedVerificationItem.account_status === 'suspended' && (
                      <div className="pt-6 border-t border-outline-variant/10 dark:border-slate-800">
                        <button
                          onClick={() => {
                            if (selectedVerificationItem.user_type === 'professional') {
                              handleVerifyProfessional(selectedVerificationItem.id);
                            } else {
                              handleVerifyClient(selectedVerificationItem.id);
                            }
                          }}
                          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span> Reactivar Cuenta
                        </button>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
                    Selecciona un usuario de la cola para inspeccionar sus documentos.
                  </div>
                )}
              </section>
            </div>
          )}

          {/* 3. TAB APROBACIÓN DE FOTOS DE PORTAFOLIO */}
          {activeTab === 'portfolio-verifications' && (
            <div className="h-full overflow-y-auto p-6 md:p-8 space-y-6 animate-feedback">
              <div className="max-w-5xl mx-auto space-y-4">
                <div>
                  <h2 className="text-2xl font-bold font-display text-primary dark:text-slate-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary dark:text-teal-400">photo_library</span>
                    Cola de Aprobación de Fotos de Portafolio
                  </h2>
                  <p className="text-sm text-primary/70 dark:text-slate-400 mt-1">Revisa y valida las fotos de trabajos cargadas por los profesionales antes de que sean visibles para el público.</p>
                </div>

                {pendingPortfolio.length === 0 ? (
                  <div className="text-center p-12 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-primary/5 dark:border-slate-800 text-primary/60 dark:text-slate-400 animate-page-entry">
                    <span className="material-symbols-outlined text-5xl mb-2 block text-slate-350 dark:text-slate-650">done_all</span>
                    No hay fotos pendientes de aprobación. ¡Todo al día!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-page-entry">
                    {pendingPortfolio.map(photo => (
                      <div key={photo.id} className="bg-white dark:bg-slate-900 border border-primary/5 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover-interactive">
                        <div className="p-4 border-b border-primary/5 dark:border-slate-850">
                          <p className="font-bold text-sm text-primary dark:text-slate-100">{photo.professional_name}</p>
                          <p className="text-xs text-primary/60 dark:text-slate-450">{photo.professional_email}</p>
                          <p className="text-[10px] text-primary/50 dark:text-slate-500 mt-1">Subido el: {new Date(photo.created_at).toLocaleDateString('es-ES')}</p>
                        </div>
                        
                        <div className="relative aspect-video bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
                          <img 
                            src={getAbsoluteImageUrl(photo.image_url)} 
                            onError={handleGalleryError}
                            alt="Trabajo" 
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" 
                            onClick={() => window.open(getAbsoluteImageUrl(photo.image_url), '_blank')}
                          />
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-2">
                          <button
                            onClick={() => handleVerifyPortfolioPhoto(photo.id, 'approved')}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                          >
                            <span className="material-symbols-outlined text-sm">check</span>
                            Aprobar
                          </button>
                          
                          <button
                            onClick={() => handleVerifyPortfolioPhoto(photo.id, 'rejected')}
                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all border border-red-500/20 active:scale-95"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                            Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. TAB BUZÓN DE RECLAMOS (Complaints Inbox) */}
          {activeTab === 'complaints' && (
            <div className="h-full overflow-y-auto p-6 md:p-8 space-y-6 animate-feedback">
              <div className="max-w-5xl mx-auto space-y-4">
                <h2 className="text-2xl font-bold font-display text-primary dark:text-slate-100">Buzón de Reclamos y Disputas</h2>
                
                {complaints.length === 0 ? (
                  <div className="text-center p-12 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-primary/5 dark:border-slate-800 text-primary/60 dark:text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-2 block">sentiment_satisfied</span>
                    No se han registrado reportes ni reclamos de soporte.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.map(ticket => (
                      <div key={ticket.id} className="bg-white dark:bg-slate-900 border border-primary/10 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ticket.status === 'open' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                              {ticket.status.toUpperCase()}
                            </span>
                            <h4 className="text-lg font-bold text-primary dark:text-slate-100 mt-2">Motivo: {ticket.reason}</h4>
                          </div>
                          <span className="text-xs text-primary/50 dark:text-slate-400">{new Date(ticket.created_at).toLocaleDateString('es-ES')}</span>
                        </div>

                        <p className="text-sm text-primary/80 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl italic">
                          "{ticket.details}"
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-primary/70 dark:text-slate-400">
                          <div>
                            <p className="font-bold text-primary dark:text-slate-200">Denunciante (Reporter):</p>
                            <p>{ticket.reporter_name} ({ticket.reporter_email}) - <span className="capitalize">{ticket.reporter_type}</span></p>
                          </div>
                          <div>
                            <p className="font-bold text-primary dark:text-slate-200">Denunciado (Reported User):</p>
                            <p>{ticket.reported_name} ({ticket.reported_email}) - <span className="capitalize">{ticket.reported_type}</span></p>
                          </div>
                        </div>

                        {ticket.job_title && (
                          <div className="text-xs text-primary/60 dark:text-slate-450 border-t border-primary/5 dark:border-slate-800 pt-2">
                            <strong>Trabajo Relacionado:</strong> {ticket.job_title}
                          </div>
                        )}

                        <div className="flex gap-2 pt-2 border-t border-primary/5 dark:border-slate-800">
                          {ticket.status === 'open' && (
                            <button
                              onClick={() => handleResolveComplaint(ticket.id)}
                              className="bg-green-500 hover:bg-green-600 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1 shadow-sm transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">done</span>
                              Marcar como Resuelto
                            </button>
                          )}
                          <button
                            onClick={() => handleStartChatWithUser(ticket.reported_id)}
                            className="bg-primary hover:bg-primary/95 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">chat</span>
                            Chatear con Denunciado
                          </button>
                          <button
                            onClick={() => handleStartChatWithUser(ticket.reporter_id)}
                            className="bg-white dark:bg-slate-800 text-primary dark:text-slate-200 border border-primary/20 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">chat</span>
                            Chatear con Denunciante
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4b. TAB ALERTAS DE SEGURIDAD (Security Alerts) */}
          {activeTab === 'security-alerts' && (
            <div className="h-full overflow-y-auto p-6 md:p-8 space-y-6 animate-feedback">
              <div className="max-w-5xl mx-auto space-y-4">
                <h2 className="text-2xl font-bold font-display text-primary dark:text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500">gpp_bad</span>
                  Buzón de Alertas de Seguridad Automáticas
                </h2>
                <p className="text-sm text-primary/60 dark:text-slate-400">
                  Control y auditoría de suspensiones automáticas del sistema (Filtro de Seguridad: usuarios con 3+ denuncias o promedio &lt; 3 estrellas).
                </p>
                
                {securityAlerts.length === 0 ? (
                  <div className="text-center p-12 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-primary/5 dark:border-slate-800 text-primary/60 dark:text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-2 block">verified</span>
                    No se han registrado alertas de seguridad.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {securityAlerts.map(alertItem => (
                      <div key={alertItem.id} className="bg-white dark:bg-slate-900 border border-primary/10 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${alertItem.status === 'open' ? 'bg-red-500/10 text-red-650 dark:text-red-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                              {alertItem.status.toUpperCase()}
                            </span>
                            <span className="text-xs bg-primary/10 text-primary dark:bg-teal-500/10 dark:text-teal-400 px-2 py-0.5 rounded font-semibold capitalize">
                              {alertItem.alert_type === 'three_complaints' ? 'Acumulación de Denuncias (3+)' : 'Bajo Promedio de Estrellas (<3.0)'}
                            </span>
                          </div>
                          <span className="text-xs text-primary/50 dark:text-slate-400">{new Date(alertItem.created_at).toLocaleString('es-ES')}</span>
                        </div>

                        <p className="text-sm text-primary/80 dark:text-slate-350 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl font-medium border-l-4 border-red-500">
                          {alertItem.details}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-primary/70 dark:text-slate-400 border-t border-primary/5 dark:border-slate-800 pt-3">
                           <div>
                             <p className="font-bold text-primary dark:text-slate-200">Usuario Afectado (Suspendido):</p>
                             <p>{alertItem.user_name} ({alertItem.user_email}) - <span className="capitalize">{alertItem.user_type === 'professional' ? 'Profesional' : 'Cliente'}</span></p>
                           </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-primary/5 dark:border-slate-800">
                          {alertItem.status === 'open' && (
                            <button
                              onClick={() => handleResolveAlert(alertItem.id)}
                              className="bg-green-500 hover:bg-green-600 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1 shadow-sm transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">done</span>
                              Marcar como Resuelto / Archivar
                            </button>
                          )}
                          <button
                            onClick={() => handleStartChatWithUser(alertItem.user_id)}
                            className="bg-primary hover:bg-primary/95 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">chat</span>
                            Chatear con Usuario
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. TAB MENSAJERÍA CENTRAL (Direct Chats console) */}
          {activeTab === 'chat' && (
            <div className="h-full flex overflow-hidden animate-feedback">
              
              {/* Chat Sidebar */}
              <section className="w-full md:w-80 lg:w-96 border-r border-outline-variant/10 dark:border-slate-800 flex flex-col h-full shrink-0">
                <div className="p-4 border-b border-outline-variant/10 dark:border-slate-800 space-y-3">
                  <h2 className="font-headline-md text-base font-bold text-primary dark:text-slate-100">Mensajería Central</h2>
                  
                  {/* Chat Search Box */}
                  <div className="relative bg-white/70 dark:bg-slate-800/70 border border-outline-variant/20 dark:border-slate-700 rounded-lg px-3 py-1.5 flex items-center shadow-sm">
                    <span className="material-symbols-outlined text-primary/50 dark:text-teal-400 mr-2 text-[18px]">search</span>
                    <input
                      value={searchChatQuery}
                      onChange={e => setSearchChatQuery(e.target.value)}
                      className="bg-transparent border-none text-xs w-full placeholder-on-surface-variant/50 p-0 focus:outline-none text-primary dark:text-slate-100"
                      placeholder="Buscar profesional para chatear..."
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                  {/* Search Results list (if searching) */}
                  {searchChatQuery.trim().length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[10px] text-primary/50 dark:text-slate-400 uppercase font-bold tracking-widest px-1">Resultados de Búsqueda</p>
                      {filteredChatProsList.length === 0 ? (
                        <p className="text-xs italic text-slate-450 p-1">No se encontraron profesionales.</p>
                      ) : (
                        filteredChatProsList.map(pro => (
                          <div
                            key={pro.id}
                            onClick={() => {
                              handleStartChatWithUser(pro.id);
                              setSearchChatQuery('');
                            }}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-primary/5 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-primary/5 transition-colors"
                          >
                            <img src={getAbsoluteImageUrl(pro.imageUrl)} onError={handleImageError} alt={pro.name} className="w-9 h-9 rounded-full object-cover" />
                            <div>
                              <p className="text-xs font-bold text-primary dark:text-slate-100">{pro.name}</p>
                              <p className="text-[10px] text-primary/60 dark:text-slate-400">{pro.specialty}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    /* Open Conversations list */
                    <div className="space-y-2">
                      <p className="text-[10px] text-primary/50 dark:text-slate-400 uppercase font-bold tracking-widest px-1">Chats Abiertos</p>
                      {adminChats.length === 0 ? (
                        <p className="text-xs italic text-slate-450 p-1">No hay conversaciones activas.</p>
                      ) : (
                        adminChats.map(chatItem => {
                          const isChatActive = chatItem.id === activeConversationId;
                          return (
                            <div
                              key={chatItem.id}
                              onClick={() => setActiveConversationId(chatItem.id)}
                              className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                                isChatActive
                                  ? 'border-primary/20 bg-surface-container dark:bg-slate-850 dark:border-teal-500/40 shadow-sm'
                                  : 'border-primary/5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <img 
                                src={getAbsoluteImageUrl(chatItem.other_user_avatar)} 
                                alt={chatItem.other_user_name} 
                                className="w-10 h-10 rounded-full object-cover shrink-0" 
                                onError={handleImageError}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                  <p className="text-xs font-bold text-primary dark:text-slate-100 truncate">{chatItem.other_user_name}</p>
                                  <span className="text-[9px] text-primary/50 dark:text-slate-400 shrink-0">
                                    {chatItem.last_message_time ? new Date(chatItem.last_message_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}
                                  </span>
                                </div>
                                <p className="text-[10px] text-primary/70 dark:text-slate-400 truncate">{chatItem.last_message || 'Inicia una conversación'}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Chat Conversation Pane */}
              <section className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950">
                {activeConversationId && activeConversationData ? (
                  <>
                    {/* Chat Header */}
                    <div className="px-6 py-4 bg-background-light dark:bg-slate-900/80 border-b border-outline-variant/10 dark:border-slate-800 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <img
                          className="w-10 h-10 rounded-full object-cover border border-primary/10"
                          src={getAbsoluteImageUrl(activeConversationData.otherUser?.imageUrl)}
                          onError={handleImageError}
                          alt={activeConversationData.otherUser?.name}
                        />
                        <div>
                          <p className="text-sm font-bold text-primary dark:text-slate-100">{activeConversationData.otherUser?.name}</p>
                          <p className="text-[10px] text-primary/60 dark:text-slate-400">Canal de Soporte / Mediación</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setActiveConversationId(null)} 
                        className="text-primary/45 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200 transition-colors"
                        title="Cerrar chat"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950">
                      {activeConversationData.messages?.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                          No hay mensajes. ¡Escribe el primer mensaje para chatear!
                        </div>
                      ) : (
                        activeConversationData.messages?.map(msg => {
                          const isMe = msg.sender_id === user.id;
                          return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-xs ${
                                isMe
                                  ? 'bg-primary text-white dark:bg-teal-600 dark:text-white rounded-br-none'
                                  : 'bg-white dark:bg-slate-900 border border-primary/5 dark:border-slate-800 text-primary dark:text-slate-100 rounded-bl-none'
                              }`}>
                                <p>{msg.content}</p>
                                <p className={`text-[8px] mt-1 text-right ${isMe ? 'text-white/60' : 'text-primary/40 dark:text-slate-450'}`}>
                                  {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatMessagesEndRef} />
                    </div>

                    {/* Messages Footer Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-outline-variant/10 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 shrink-0">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        placeholder="Escribe un mensaje de soporte..."
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs focus:ring-2 focus:ring-primary dark:focus:ring-teal-500 focus:outline-none text-primary dark:text-slate-100"
                      />
                      <button
                        type="submit"
                        className="bg-primary dark:bg-teal-600 hover:bg-primary/95 text-white size-10 flex items-center justify-center rounded-xl transition-all shrink-0 active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm">send</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 italic p-6 text-center space-y-2">
                    <span className="material-symbols-outlined text-5xl">chat_bubble_outline</span>
                    <p className="text-sm font-semibold">Selecciona una conversación abierta o busca un profesional para chatear directamente.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* 5. TAB HISTORIAL DE TRABAJOS (Jobs Table) */}
          {activeTab === 'jobs' && (
            <div className="h-full overflow-y-auto p-6 md:p-8 space-y-6 animate-feedback">
              <div className="max-w-6xl mx-auto space-y-4">
                <h2 className="text-2xl font-bold font-display text-primary dark:text-slate-100">Registro de Trabajos</h2>
                
                {jobs.length === 0 ? (
                  <div className="text-center p-12 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-primary/5 dark:border-slate-800 text-primary/60 dark:text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-2 block">work_off</span>
                    Aún no se han registrado trabajos en la plataforma.
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-primary/10 dark:border-slate-850 shadow-md">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-primary/5 dark:bg-slate-800/80 text-primary dark:text-slate-100 font-bold text-xs uppercase border-b border-primary/10 dark:border-slate-800">
                          <th className="p-4">Trabajo</th>
                          <th className="p-4">Cliente</th>
                          <th className="p-4">Profesional</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4">Creado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/5 dark:divide-slate-800 text-sm text-primary/90 dark:text-slate-200">
                        {jobs.map(job => {
                          let statusClass = 'bg-slate-100 text-slate-700';
                          if (job.status === 'completed') statusClass = 'bg-green-500/10 text-green-600 dark:text-green-400';
                          if (job.status === 'pending') statusClass = 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
                          if (job.status === 'accepted' || job.status === 'active') statusClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
                          if (job.status === 'cancelled') statusClass = 'bg-red-500/10 text-red-600 dark:text-red-400';

                          return (
                            <tr key={job.id} className="hover:bg-primary/5 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="p-4">
                                <p className="font-semibold">Trabajo #{job.id}</p>
                                <p className="text-xs text-primary/60 dark:text-slate-400 line-clamp-1">{job.description}</p>
                              </td>
                              <td className="p-4">
                                <p>{job.client_name || 'Desconocido'}</p>
                                <p className="text-xs text-primary/60 dark:text-slate-400">{job.client_email}</p>
                              </td>
                              <td className="p-4">
                                {job.professional_name ? (
                                  <>
                                    <p>{job.professional_name}</p>
                                    <p className="text-xs text-primary/60 dark:text-slate-400">{job.professional_email}</p>
                                  </>
                                ) : (
                                  <p className="text-xs italic text-primary/50 dark:text-slate-500">Sin asignar</p>
                                )}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusClass}`}>
                                  {job.status}
                                </span>
                              </td>
                              <td className="p-4 text-xs text-primary/60 dark:text-slate-400">
                                {new Date(job.created_at).toLocaleDateString('es-ES')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. TAB AJUSTES DE PERFIL ADMIN */}
          {activeTab === 'profile' && (
            <div className="h-full overflow-y-auto p-6 md:p-8 space-y-6 animate-feedback">
              <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-primary/10 dark:border-slate-800 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-display text-primary dark:text-slate-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary dark:text-teal-400">manage_accounts</span>
                    Mi Perfil Admin
                  </h2>
                  <p className="text-xs text-primary/70 dark:text-slate-400 mt-1">Actualiza tus credenciales exclusivas de administración del sistema.</p>
                </div>

                {adminProfileFeedback && (
                  <div className={`p-4 rounded-xl text-xs font-semibold ${adminProfileFeedback.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                    {adminProfileFeedback.text}
                  </div>
                )}

                <form onSubmit={handleUpdateAdminProfile} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-primary/85 dark:text-slate-300 block mb-2">Foto de Perfil</label>
                    <div className="flex items-center gap-4">
                      {user?.imageUrl && (
                        <img 
                          src={getAbsoluteImageUrl(user.imageUrl)} 
                          onError={handleImageError}
                          alt="Admin Avatar" 
                          className="size-16 rounded-full object-cover border-2 border-primary" 
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setAdminProfileFile(e.target.files[0])}
                        className="text-xs text-primary/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-primary/85 dark:text-slate-300 block mb-2">Nombre del Administrador</label>
                    <input
                      type="text"
                      value={adminProfileName}
                      onChange={e => setAdminProfileName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-outline-variant/20 dark:border-slate-700 text-xs focus:ring-2 focus:ring-primary focus:outline-none text-primary dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-primary/85 dark:text-slate-300 block mb-2">Correo de Soporte</label>
                    <input
                      type="email"
                      value={adminProfileEmail}
                      onChange={e => setAdminProfileEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-outline-variant/20 dark:border-slate-700 text-xs focus:ring-2 focus:ring-primary focus:outline-none text-primary dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-primary/85 dark:text-slate-300 block mb-2">Teléfono Celular</label>
                    <input
                      type="text"
                      value={adminProfilePhone}
                      onChange={e => setAdminProfilePhone(e.target.value)}
                      placeholder="Ej: 77712345"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-outline-variant/20 dark:border-slate-700 text-xs focus:ring-2 focus:ring-primary focus:outline-none text-primary dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-primary/85 dark:text-slate-300 block mb-2">Cambiar Contraseña (Dejar vacío para mantener actual)</label>
                    <input
                      type="password"
                      value={adminProfilePassword}
                      onChange={e => setAdminProfilePassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres, 1 especial, 1 número"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-outline-variant/20 dark:border-slate-700 text-xs focus:ring-2 focus:ring-primary focus:outline-none text-primary dark:text-slate-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/95 dark:bg-teal-600 dark:hover:bg-teal-750 text-white py-3.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    Guardar Ajustes Admin
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default AdminDashboardPage;