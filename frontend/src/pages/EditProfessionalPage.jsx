import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LocationPicker from '../components/LocationPicker';
import { useAuth } from '../context/AuthContext';

function EditProfessionalPage() {
  const { id } = useParams();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [felccRejapFile, setFelccRejapFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [locationInterval, setLocationInterval] = useState(null); // Para el intervalo de envío de ubicación

  useEffect(() => {
    // Redirigir si el usuario no es el dueño del perfil
    if (user && user.id.toString() !== id) {
      navigate('/home');
    }

    const fetchProfileData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/professionals/${id}`);
        if (!response.ok) throw new Error('No se pudo cargar la información del perfil.');
        const data = await response.json();
        setFormData(data);
        setImagePreview(data.imageUrl);
        // Si el profesional está online al cargar, iniciar el envío de ubicación
        if (data.is_online) {
          const token = localStorage.getItem('token');
          startLocationUpdates(id, token);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target; // eslint-disable-next-line
    if (name === 'identity_card' || name === 'phone_number') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  // Función para iniciar el envío de ubicación cada 30 segundos
  const startLocationUpdates = (professionalId, authToken) => {
    if (locationInterval) clearInterval(locationInterval); // Limpiar cualquier intervalo existente

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await fetch(`http://localhost:3000/api/professionals/${professionalId}/location`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({ latitude, longitude })
            });
            console.log('Ubicación actualizada:', latitude, longitude);
          } catch (err) {
            console.error('Error al enviar ubicación:', err);
          }
        },
        (err) => {
          console.error('Error al obtener ubicación:', err);
          // Si hay un error de permisos, detener el envío de ubicación
          if (err.code === err.PERMISSION_DENIED) {
            alert('Permiso de ubicación denegado. No se podrá actualizar tu ubicación en tiempo real.');
            clearInterval(interval);
            setLocationInterval(null);
            setFormData(prev => ({ ...prev, is_online: false })); // Poner offline si no hay permisos
          }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 10000 }
      );
    }, 30000); // Cada 30 segundos

    setLocationInterval(interval);
  };

  // Manejar el cambio de estado online/offline
  const handleOnlineStatusChange = async (e) => {
    const newIsOnline = e.target.checked;
    setFormData(prev => ({ ...prev, is_online: newIsOnline }));
    setError('');
    try {
      const authToken = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/professionals/${id}/online-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ is_online: newIsOnline })
      });
      if (!response.ok) throw new Error('Error al actualizar estado online.');
      if (newIsOnline) {
        startLocationUpdates(id, authToken); // Iniciar envío de ubicación
      } else {
        if (locationInterval) clearInterval(locationInterval); // Detener envío de ubicación
        setLocationInterval(null);
      }
    } catch (err) { setError(err.message); }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFelccRejapChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFelccRejapFile(e.target.files[0]);
    }
  };

  const handleLocationChange = (latlng) => {
    setFormData(prev => ({ ...prev, latitude: latlng.lat, longitude: latlng.lng }));
  };

  const handleAddressChange = (address) => {
    setFormData(prev => ({ ...prev, store_address: address }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const submissionData = new FormData();
    Object.keys(formData).forEach(key => {
      submissionData.append(key, formData[key]);
    });
    if (profileImageFile) {
      submissionData.append('profileImage', profileImageFile);
    }
    if (felccRejapFile) {
      submissionData.append('felcc_rejap', felccRejapFile);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/professionals/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: submissionData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al actualizar el perfil.');

      // Si el backend devuelve un nuevo token, lo actualizamos en el contexto.
      if (data.token) {
        login(data.token);
      }

      setSuccess('¡Perfil actualizado con éxito! Redirigiendo a tu perfil...');
      setTimeout(() => navigate('/my-profile', { replace: true }), 2000);

    } catch (err) {
      setError(err.message);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/profile/${id}`);
    }
  };

  useEffect(() => {
    // Limpiar el intervalo al desmontar el componente
    return () => { if (locationInterval) clearInterval(locationInterval); };
  }, [locationInterval]);

  if (loading) return <div className="p-8 text-center">Cargando editor...</div>;
  if (error && !formData) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <>
      <header className="absolute top-0 left-0 w-full p-4 z-10">
        <button 
          type="button"
          onClick={handleBack} 
          className="text-primary dark:text-slate-200 flex size-10 shrink-0 items-center justify-center rounded-full bg-white/50 hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 backdrop-blur-sm transition-colors border-none cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </header>
      <div className="flex flex-col items-center justify-start min-h-screen pt-20 pb-32 px-4 bg-background-light dark:bg-background-dark">
        <div className="w-full max-w-md lg:max-w-3xl p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary dark:text-slate-100">Editar Perfil Profesional</h1>
          </div>

          <div className="flex flex-col items-center pt-4">
            <label htmlFor="profileImage" className="cursor-pointer group">
              <div className="w-24 h-24 rounded-full bg-background-light dark:bg-slate-700 flex items-center justify-center text-primary/40 dark:text-slate-400 ring-4 ring-primary/10 dark:ring-slate-700 overflow-hidden relative">
                {imagePreview ? (
                  <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-5xl">add_a_photo</span>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined">edit</span>
                </div>
              </div>
            </label>
            <input id="profileImage" name="profileImage" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-primary/80 dark:text-slate-200 block mb-2">Nombre Completo o de Empresa</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-400">person</span>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full pl-11 pr-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 border-transparent focus:ring-2 focus:ring-primary dark:focus:ring-teal-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-primary/80 dark:text-slate-200 block mb-2">Número de Celular</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-400">call</span>
                  <input type="tel" inputMode="numeric" name="phone_number" value={formData.phone_number} onChange={handleChange} required className="w-full pl-11 pr-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 border-transparent focus:ring-2 focus:ring-primary dark:focus:ring-teal-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-primary/80 dark:text-slate-200 block mb-2">Especialidad Principal</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-400">work</span>
                <input type="text" name="specialty" value={formData.specialty} onChange={handleChange} required className="w-full pl-11 pr-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 border-transparent focus:ring-2 focus:ring-primary dark:focus:ring-teal-500" />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-primary/80 dark:text-slate-200 block mb-2">Biografía o Descripción del Servicio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} required rows="4" className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 border-transparent focus:ring-2 focus:ring-primary dark:focus:ring-teal-500"></textarea>
            </div>
            <div>
              <label className="text-sm font-bold text-primary/80 dark:text-slate-200 block mb-2">Otros servicios que ofreces (Opcional)</label>
              <textarea name="services_offered" value={formData.services_offered} onChange={handleChange} rows="3" className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 border-transparent focus:ring-2 focus:ring-primary dark:focus:ring-teal-500"></textarea>
            </div>
            <div>
              <label className="text-sm font-bold text-primary/80 dark:text-slate-200 block mb-2">Certificado FELCC/REJAP (Opcional)</label>
              <input type="file" name="felcc_rejap" onChange={handleFelccRejapChange} accept=".pdf,.jpg,.jpeg,.png" className="w-full text-sm text-primary/80 dark:text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 dark:file:bg-teal-500/20 file:text-primary dark:file:text-teal-400 hover:file:bg-primary/20 dark:hover:file:bg-teal-500/30" />
              {formData.felcc_rejap_url && (
                <p className="text-xs text-primary/60 dark:text-slate-400 mt-1">
                  Archivo actual: <a href={formData.felcc_rejap_url} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-teal-400 hover:underline">Ver certificado</a>
                  <span className="ml-2 text-red-500 dark:text-red-400 cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, felcc_rejap_url: null }))}>[X] Eliminar</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 p-3 bg-background-light dark:bg-slate-700/50 rounded-lg">
              <input type="checkbox" name="has_store" id="has_store" checked={formData.has_store} onChange={handleChange} className="size-5 rounded text-primary dark:text-teal-500 focus:ring-primary dark:focus:ring-teal-500 dark:bg-slate-800 border-transparent" />
              <label htmlFor="has_store" className="text-sm font-bold text-primary/80 dark:text-slate-200">Tengo una tienda o local físico</label>
            </div>
            {formData.has_store && (
              <div>
                <label className="text-sm font-bold text-primary/80 dark:text-slate-200 block mb-2">Ubicación de la Tienda o Local</label>
                <LocationPicker
                  onLocationChange={handleLocationChange}
                  address={formData.store_address}
                  onAddressChange={handleAddressChange}
                />
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-background-light dark:bg-slate-700/50 rounded-lg">
              <input type="checkbox" name="is_online" id="is_online" checked={formData.is_online} onChange={handleOnlineStatusChange} className="size-5 rounded text-primary dark:text-teal-500 focus:ring-primary dark:focus:ring-teal-500 dark:bg-slate-800 border-transparent" />
              <label htmlFor="is_online" className="text-sm font-bold text-primary/80 dark:text-slate-200">Estoy disponible y online</label>
              {formData.is_online && <span className="text-xs text-primary/60 dark:text-slate-400">(Tu ubicación se actualizará cada 30s)</span>}
            </div>
            <div>
              <label className="text-sm font-bold text-primary/80 dark:text-slate-200 block mb-2">
                Radio de Acción (km) (Opcional)
              </label>
              <input
                type="number"
                name="action_radius"
                value={formData.action_radius}
                onChange={handleChange}
                min="1"
                max="100"
                className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 border-transparent focus:ring-2 focus:ring-primary dark:focus:ring-teal-500"
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-green-500 text-sm text-center">{success}</p>}
            <div className="text-center pt-4">
              <button type="submit" className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 dark:bg-teal-650 dark:hover:bg-teal-600 text-white px-10 py-3 rounded-lg font-bold text-lg transition-all active:scale-95 border-none cursor-pointer">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditProfessionalPage;