import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAbsoluteImageUrl, handleImageError, handleGalleryError } from '../utils/imageHelper';

// Componente para la vista del usuario autenticado
function UserDashboard({ user, login, logout }) {
  const navigate = useNavigate();
  
  // Portafolio de fotos (para profesionales)
  const [portfolio, setPortfolio] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Estados para edición del perfil del cliente
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone_number || '');
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [updateFeedback, setUpdateFeedback] = useState(null);

  // Sincronizar campos cuando cambia el objeto 'user'
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
      setEditPhone(user.phone_number || '');
    }
  }, [user]);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch(window.API_URL + '/api/professionals/my-portfolio', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
      }
    } catch (err) {
      console.error('Error al cargar portafolio:', err);
    }
  };

  useEffect(() => {
    if (user && user.user_type === 'professional') {
      fetchPortfolio();
    }
  }, [user]);

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('portfolioPhoto', file);

    try {
      const response = await fetch(window.API_URL + '/api/professionals/portfolio', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al subir foto.');

      setFeedback({ type: 'success', text: data.message });
      fetchPortfolio();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta foto de tu portafolio?')) return;
    try {
      const response = await fetch(`${window.API_URL}/api/professionals/portfolio/${photoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        fetchPortfolio();
      }
    } catch (err) {
      console.error('Error al eliminar foto:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/home'); // Redirige a la página de inicio después de cerrar sesión
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      '¿ESTÁS ABSOLUTAMENTE SEGURO? Esta acción es irreversible y eliminará todos tus datos personales, historial de trabajos y credenciales en cumplimiento con el Aviso de Privacidad (Art. 21 CPE).'
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(window.API_URL + '/api/users/delete-account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al eliminar cuenta.');

      alert(data.message);
      logout();
      navigate('/home');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFile(file);
      setEditPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUpdateFeedback(null);

    const formData = new FormData();
    formData.append('name', editName);
    formData.append('email', editEmail);
    formData.append('phone_number', editPhone);
    if (editFile) {
      formData.append('avatar', editFile);
    }

    try {
      const response = await fetch(window.API_URL + '/api/users/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al actualizar el perfil.');

      // Actualizar token en AuthContext
      login(data.token);
      setUpdateFeedback({ type: 'success', text: 'Perfil actualizado con éxito.' });
      setTimeout(() => {
        setIsEditing(false);
        setUpdateFeedback(null);
        setEditPreview(null);
        setEditFile(null);
      }, 1500);
    } catch (err) {
      setUpdateFeedback({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 justify-between border-b border-primary/10 dark:border-slate-700">
        <h2 className="text-primary dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Mi Perfil</h2>
      </header>

      <main className="flex-1 p-6 lg:p-8 pb-32 animate-page-entry space-y-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block relative mb-4">
            {user.imageUrl ? (
              <img 
                src={getAbsoluteImageUrl(user.imageUrl)} 
                onError={handleImageError}
                alt={user.name} 
                className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20 shadow-xl" 
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 text-primary dark:bg-slate-700 dark:text-teal-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl">person</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-primary dark:text-slate-100">{user.name}</h1>
          <p className="text-sm text-primary/60 dark:text-slate-455">{user.user_type === 'professional' ? 'Profesional' : user.user_type === 'admin' ? 'Administrador' : 'Cliente'}</p>
        </div>

        {/* Formulario de edición o panel de navegación */}
        {isEditing ? (
          <div className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-2xl border border-primary/5 dark:border-slate-700 space-y-4 animate-feedback">
            <h3 className="font-bold text-lg text-primary/95 dark:text-slate-100 mb-2">Editar Datos Personales</h3>
            
            {updateFeedback && (
              <div className={`p-3 rounded-xl text-xs font-semibold text-center ${updateFeedback.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                {updateFeedback.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-primary/20 overflow-hidden flex items-center justify-center">
                    {editPreview ? (
                      <img src={editPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : user.imageUrl ? (
                      <img src={getAbsoluteImageUrl(user.imageUrl)} onError={handleImageError} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-primary/45">add_a_photo</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </div>
                  </div>
                  <input type="file" accept="image/*" onChange={handleEditFileChange} className="hidden" />
                </label>
                <span className="text-xs text-primary/60 dark:text-slate-400">Actualizar Foto de Perfil</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-primary/80 dark:text-slate-350">Nombre Completo <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  required 
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-transparent text-sm focus:ring-2 focus:ring-primary dark:focus:ring-teal-500 text-primary dark:text-slate-100" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-primary/80 dark:text-slate-350">Correo Electrónico <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                  required 
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-transparent text-sm focus:ring-2 focus:ring-primary dark:focus:ring-teal-500 text-primary dark:text-slate-100" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-primary/80 dark:text-slate-350">Número de Celular</label>
                <input 
                  type="tel" 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value)} 
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-transparent text-sm focus:ring-2 focus:ring-primary dark:focus:ring-teal-500 text-primary dark:text-slate-100" 
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setIsEditing(false); setUpdateFeedback(null); setEditPreview(null); setEditFile(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors border-none cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs transition-colors border-none cursor-pointer disabled:opacity-50"
                >
                  {uploading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {user.user_type === 'admin' && (
              <Link to="/admin/dashboard" className="block bg-teal-500/10 border border-teal-500/20 p-4 rounded-xl hover:border-teal-500/40 transition-colors">
                <h3 className="font-bold text-teal-800 dark:text-teal-400">Consola de Administración</h3>
                <p className="text-sm text-teal-900/70 dark:text-slate-300 mt-2">Gestionar verificaciones, buzón de reclamos, chats de soporte y estadísticas.</p>
              </Link>
            )}

            <Link to="/chats" className="block bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-primary/5 dark:border-slate-700 hover:border-primary/20 dark:hover:bg-slate-600 transition-colors">
              <h3 className="font-bold text-primary/95 dark:text-slate-100">Mis Chats</h3>
              <p className="text-sm text-primary/70 dark:text-slate-300 mt-2">Ver tus conversaciones con clientes y profesionales.</p>
            </Link>

            {user.user_type === 'professional' ? (
              <>
                <Link to={`/profile/${user.id}`} className="block bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-primary/5 dark:border-slate-700 hover:border-primary/20 dark:hover:bg-slate-600 transition-colors">
                  <h3 className="font-bold text-primary/95 dark:text-slate-100">Ver Mi Perfil Público</h3>
                  <p className="text-sm text-primary/70 dark:text-slate-300 mt-2">Revisar cómo visualizan los clientes tu perfil y reseñas.</p>
                </Link>
                
                <Link to={`/profile/edit/${user.id}`} className="block bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-primary/5 dark:border-slate-700 hover:border-primary/20 dark:hover:bg-slate-600 transition-colors">
                  <h3 className="font-bold text-primary/95 dark:text-slate-100">Ajustes del Perfil Profesional</h3>
                  <p className="text-sm text-primary/70 dark:text-slate-300 mt-2">Modificar tu biografía, catalogar tus servicios, actualizar ubicación y estado en línea.</p>
                </Link>

                {/* Portafolio Sección */}
                <div className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-2xl border border-primary/5 dark:border-slate-700 space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h3 className="font-bold text-primary/95 dark:text-slate-100 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary/60 dark:text-teal-400">photo_library</span>
                        Mi Galería de Trabajos
                      </h3>
                      <p className="text-xs text-primary/70 dark:text-slate-300 mt-1; }">Sube hasta 6 fotos de tus trabajos anteriores para que los clientes las vean.</p>
                    </div>
                    
                    {portfolio.length < 6 && (
                      <label className={`cursor-pointer px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <span className="material-symbols-outlined text-sm">upload</span>
                        Subir Foto
                        <input type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" />
                      </label>
                    )}
                  </div>

                  {feedback && (
                    <div className={`p-3 rounded-xl text-xs font-semibold text-center ${feedback.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                      {feedback.text}
                    </div>
                  )}

                  {portfolio.length === 0 ? (
                    <p className="text-xs text-primary/50 dark:text-slate-450 italic text-center py-6">Aún no has subido fotos de tus trabajos.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {portfolio.map(photo => {
                        let badgeClass = 'bg-slate-100 text-slate-700';
                        let statusText = 'Pendiente';
                        if (photo.status === 'approved') {
                          badgeClass = 'bg-green-500/10 text-green-600 dark:text-green-400';
                          statusText = 'Aprobada';
                        } else if (photo.status === 'rejected') {
                          badgeClass = 'bg-red-500/10 text-red-600 dark:text-red-400';
                          statusText = 'Rechazada';
                        }

                        return (
                          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-primary/10 group bg-slate-50 dark:bg-slate-900">
                            <img src={getAbsoluteImageUrl(photo.image_url)} onError={handleGalleryError} alt="Trabajo" className="w-full h-full object-cover" />
                            
                            {/* Badge de Estado */}
                            <span className={`absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-bold rounded shadow-sm ${badgeClass}`}>
                              {statusText}
                            </span>

                            {/* Botón de Borrar */}
                            <button
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="absolute top-2 right-2 bg-red-500 text-white size-7 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Eliminar foto"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full text-left block bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-primary/5 dark:border-slate-700 hover:border-primary/20 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                <h3 className="font-bold text-primary/95 dark:text-slate-100">Ajustes de la Cuenta</h3>
                <p className="text-sm text-primary/70 dark:text-slate-300 mt-2">Modificar tu foto de perfil, nombre, correo y teléfono de contacto.</p>
              </button>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-200 px-6 py-3 rounded-lg font-bold transition-colors border-none cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            Cerrar Sesión
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-650 dark:text-red-400 px-6 py-3 rounded-lg font-bold transition-colors border-none cursor-pointer"
          >
            <span className="material-symbols-outlined">delete_forever</span>
            Eliminar Cuenta
          </button>
        </div>
      </main>
    </>
  );
}

// Componente para la vista del usuario no autenticado
function GuestPrompt() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center bg-background-light dark:bg-background-dark">
      <div className="w-24 h-24 rounded-full bg-primary/10 text-primary dark:bg-slate-700 dark:text-teal-400 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-5xl">lock</span>
      </div>
      <h1 className="text-2xl font-bold text-primary dark:text-slate-100 mb-2">Desbloquea tu Perfil</h1>
      <p className="text-primary/70 dark:text-slate-300 max-w-sm mb-8">
        Para ver tu historial, gestionar tus datos y acceder a más acciones, por favor inicia sesión o crea una cuenta.
      </p>
      <div className="w-full max-w-xs space-y-4">
        <Link
          to="/login"
          className="w-full bg-primary dark:bg-teal-600 hover:bg-primary/90 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"
        >
          Iniciar Sesión
        </Link>
        <Link
          to="/register"
          className="w-full bg-white/80 dark:bg-slate-800/80 border border-primary/20 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-primary dark:text-slate-100 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"
        >
          Registrarse
        </Link>
      </div>
    </div>
  );
}

// Componente principal que decide qué vista mostrar
function MyProfilePage() {
  const { isAuthenticated, user, login, logout } = useAuth();

  return isAuthenticated && user ? <UserDashboard user={user} login={login} logout={logout} /> : <GuestPrompt />;
}

export default MyProfilePage;