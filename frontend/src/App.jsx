import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExplorePage from './pages/ExplorePage';
import RegisterProfessionalPage from './pages/RegisterProfessionalPage';
import NearbyPage from './pages/NearbyPage';
import EditProfessionalPage from './pages/EditProfessionalPage';
import ProfessionalsByCategoryPage from './pages/ProfessionalsByCategoryPage';
import MyProfilePage from './pages/MyProfilePage';
import ChatsPage from './pages/ChatsPage';
import ChatRoomPage from './pages/ChatRoomPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SearchResults from './pages/SearchResults';
import AllServices from './pages/AllServices';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';
import { useAuth } from './context/AuthContext';
import NoLaborRelationshipPage from './pages/NoLaborRelationshipPage';
import JobCompletionPage from './pages/JobCompletionPage';

function App() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const requestPermissions = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // 1. Solicitar Permisos de Geolocalización
          const locStatus = await Geolocation.requestPermissions();
          console.log('Permiso de ubicación:', locStatus.location);

          // 2. Solicitar Permiso de Notificaciones
          let pushStatus = await PushNotifications.checkPermissions();
          if (pushStatus.receive === 'prompt') {
            pushStatus = await PushNotifications.requestPermissions();
          }
          if (pushStatus.receive === 'granted') {
            // Comentado para evitar crasheo si no tienes google-services.json de Firebase configurado.
            // Activa esta línea solo después de agregar tu archivo google-services.json a android/app/
            // await PushNotifications.register();
          }
          console.log('Permiso de notificaciones:', pushStatus.receive);
        } catch (err) {
          console.error('Error al solicitar permisos en móvil:', err);
        }
      }
    };
    requestPermissions();
  }, []);

  // Ocultamos la barra de navegación en ciertas páginas
  const isChatRoom = location.pathname.startsWith('/chats/');
  const showNav = !['/', '/login', '/register', '/register-professional', '/legal/no-labor-relationship'].includes(location.pathname) && !isChatRoom;

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark">
      {showNav && <div className="senn-text-watermark">SENN Fix</div>}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-professional" element={<RegisterProfessionalPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/map" element={<NearbyPage />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/services/:categoryName" element={<ProfessionalsByCategoryPage />} />
        <Route path="/services" element={<AllServices />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/legal/no-labor-relationship" element={<NoLaborRelationshipPage />} />


        {/* Rutas Protegidas */}
        <Route
          path="/my-profile"
          element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>}
        />
        <Route
          path="/chats"
          element={<ProtectedRoute><ChatsPage /></ProtectedRoute>}
        />
        <Route
          path="/chats/:chatId"
          element={<ProtectedRoute><ChatRoomPage /></ProtectedRoute>}
        />
        <Route
          path="/profile/edit/:id"
          element={<ProtectedRoute><EditProfessionalPage /></ProtectedRoute>}
        />
        <Route
          path="/jobs/:jobId/complete"
          element={<ProtectedRoute><JobCompletionPage /></ProtectedRoute>}
        />

        {/* Rutas Públicas (por ahora) */}
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  )
}

export default App