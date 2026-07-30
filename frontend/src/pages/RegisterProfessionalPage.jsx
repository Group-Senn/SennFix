import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LocationPicker from '../components/LocationPicker';
import SpecialtyCombobox from '../components/SpecialtyCombobox';
import DatePicker from '../components/DatePicker';

function RegisterProfessionalPage() {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    bio: '',
    birth_date: '',
    customSpecialty: '',
    identity_card: '',
    phone_number: '',
    services_offered: '',
    has_store: false,
    store_address: '',
    latitude: null,
    longitude: null,
    action_radius: 10, // Valor por defecto en km
    legal_accepted: false,
    tutor_name: '',
    tutor_phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [defensoriaPermitFile, setDefensoriaPermitFile] = useState(null);
  const [ciFrontFile, setCiFrontFile] = useState(null);
  const [felccRejapFile, setFelccRejapFile] = useState(null);
  const [ciBackFile, setCiBackFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProfileSectionEnabled, setIsProfileSectionEnabled] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (formData.birth_date) {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setIsMinor(age < 18);
    }
  }, [formData.birth_date]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Restrict to numbers for specific fields
    if (name === 'identity_card' || name === 'phone_number') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }

    // Habilitar la sección del perfil solo si la contraseña tiene contenido
    if (name === 'password') {
      setIsProfileSectionEnabled(value.trim().length > 0);
    }
  };

  const handleSpecialtyChange = (specialty) => {
    setFormData(prev => ({ ...prev, specialty }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePermitChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDefensoriaPermitFile(e.target.files[0]);
    }
  };

  const handleCiFrontChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCiFrontFile(e.target.files[0]);
    }
  };

  const handleCiBackChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCiBackFile(e.target.files[0]);
    }
  };

  const handleFelccRejapChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFelccRejapFile(e.target.files[0]);
    }
  };

  const handleLocationChange = (latlng) => {
    setFormData(prev => ({
      ...prev,
      latitude: latlng.lat,
      longitude: latlng.lng,
    }));
  };

  const handleAddressChange = (address) => {
    setFormData(prev => ({
      ...prev,
      store_address: address,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Validación del lado del cliente para una mejor UX ---
    const requiredFields = {
      name: 'Nombre Completo',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      birth_date: 'Fecha de Nacimiento',
      identity_card: 'Carnet de Identidad',
      phone_number: 'Número de Celular',
      specialty: 'Especialidad Principal',
      bio: 'Biografía',
    };

    const validatePassword = (pwd) => {
      if (pwd.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres.';
      }
      if (!/[A-Z]/.test(pwd)) {
        return 'La contraseña debe incluir al menos una letra mayúscula.';
      }
      if (!/[a-z]/.test(pwd)) {
        return 'La contraseña debe incluir al menos una letra minúscula.';
      }
      if (!/\d/.test(pwd)) {
        return 'La contraseña debe incluir al menos un número.';
      }
      if (!/[@$!%*?&._-]/.test(pwd)) {
        return 'La contraseña debe incluir al menos un carácter especial (ej: @, $, !, %, *, ?, &, ., _, -).';
      }
      return null;
    };

    for (const field in requiredFields) {
      if (!formData[field] || !formData[field].toString().trim()) {
        return setError(`El campo "${requiredFields[field]}" es obligatorio.`);
      }
    }

    const pwdError = validatePassword(formData.password);
    if (pwdError) return setError(pwdError);

    if (!ciFrontFile) return setError('Debes adjuntar la imagen del anverso del carnet.');
    if (!ciBackFile) return setError('Debes adjuntar la imagen del reverso del carnet.');

    if (isMinor) {
      if (!formData.tutor_name.trim()) return setError('El campo "Nombre del Tutor" es obligatorio para menores de edad.');
      if (!formData.tutor_phone.trim()) return setError('El campo "Celular del Tutor" es obligatorio para menores de edad.');
      if (!defensoriaPermitFile) return setError('Debes adjuntar el permiso de la defensoría para menores de edad.');
    }

    if (!formData.legal_accepted) return setError('Debes aceptar la Política de No Relación Laboral.');

    const submissionData = new FormData();

    // Añadimos todos los campos del formulario al objeto FormData
    for (const key in formData) {
      submissionData.append(key, formData[key]);
    }

    // Si la especialidad es "Otro", usamos el valor personalizado
    if (formData.specialty === 'Otro') {
      submissionData.set('specialty', formData.customSpecialty);
    }
    // Eliminamos el campo temporal que no necesita el backend
    submissionData.delete('customSpecialty');

    // Añadimos el archivo de imagen si existe
    if (profileImageFile) {
      submissionData.append('profileImage', profileImageFile);
    }

    // Añadimos el archivo de permiso si existe
    if (defensoriaPermitFile) {
      submissionData.append('defensoriaPermit', defensoriaPermitFile);
    }

    // Añadimos las imágenes del CI
    if (ciFrontFile) {
      submissionData.append('ci_front', ciFrontFile);
    }
    if (ciBackFile) {
      submissionData.append('ci_back', ciBackFile);
    }
    
    // Añadimos el archivo FELCC/REJAP si existe
    if (felccRejapFile) {
      submissionData.append('felcc_rejap', felccRejapFile);
    }

    try {
      const response = await fetch('http://localhost:3000/api/register-professional', {
        method: 'POST',
        // No establecemos 'Content-Type', el navegador lo hará por nosotros con FormData
        body: submissionData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro.');
      }

      setSuccess('¡Registro profesional exitoso! Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <header className="absolute top-0 left-0 w-full p-4 z-10">
        <Link to="/" className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full bg-white/50 hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 backdrop-blur-sm transition-colors">
          <span className="material-symbols-outlined">close</span>
        </Link>
      </header>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background-light dark:bg-background-dark">
        <div className="w-full max-w-md lg:max-w-3xl p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">Únete como Profesional</h1>
            <p className="text-primary/70">Crea tu perfil para que miles de clientes te encuentren.</p>
          </div>

          {/* Selector de imagen de perfil */}
          <div className="flex flex-col items-center pt-4">
            <label htmlFor="profileImage" className="cursor-pointer group">
              <div className="w-24 h-24 rounded-full bg-background-light dark:bg-slate-700 flex items-center justify-center text-primary/40 ring-4 ring-primary/10 overflow-hidden relative">
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
            <p className="text-sm text-primary/60 mt-2">Añadir foto de perfil</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm font-bold text-primary/80 -mb-2 pt-2">Información de la Cuenta</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-primary/80 block mb-2">Nombre Completo o de Empresa <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40">person</span>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full pl-11 pr-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-primary/80 block mb-2">Correo Electrónico (para iniciar sesión) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40">alternate_email</span>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-11 pr-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-primary/80 block mb-2">Contraseña <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40">lock</span>
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required className="w-full pl-11 pr-12 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary/80 transition-colors">
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div>
              <DatePicker
                value={formData.birth_date}
                onChange={(dateStr) => setFormData(prev => ({ ...prev, birth_date: dateStr }))}
              />
            </div>

            <hr className="border-primary/10" />

            <fieldset disabled={!isProfileSectionEnabled}>
              <div className={`space-y-4 transition-opacity duration-500 ${!isProfileSectionEnabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}>
                <p className="text-sm font-bold text-primary/80 -mb-2 pt-2">Información del Perfil Profesional</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-primary/80 block mb-2">Carnet de Identidad <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40">badge</span>
                      <input type="text" inputMode="numeric" name="identity_card" value={formData.identity_card} onChange={handleChange} required className="w-full pl-11 pr-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="mt-2">
                      <label className="text-xs font-bold text-primary/80 block mb-1">Anverso del Carnet <span className="text-red-500">*</span></label>
                      <input type="file" name="ci_front" onChange={handleCiFrontChange} required accept="image/*" className="w-full text-sm text-primary/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                    </div>
                    <div className="mt-2">
                      <label className="text-xs font-bold text-primary/80 block mb-1">Reverso del Carnet <span className="text-red-500">*</span></label>
                      <input type="file" name="ci_back" onChange={handleCiBackChange} required accept="image/*" className="w-full text-sm text-primary/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-primary/80 block mb-2">Número de Celular <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40">call</span>
                      <input type="tel" inputMode="numeric" name="phone_number" value={formData.phone_number} onChange={handleChange} required className="w-full pl-11 pr-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-primary/80 block mb-2">Especialidad Principal <span className="text-red-500">*</span></label>
                  <SpecialtyCombobox onSpecialtyChange={handleSpecialtyChange} />
                </div>

                {formData.specialty === 'Otro' && (
                  <div>
                    <label className="text-sm font-bold text-primary/80 block mb-2">Escribe tu especialidad</label>
                    <input type="text" name="customSpecialty" value={formData.customSpecialty} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary" placeholder="Ej: Instalador de paneles solares" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-bold text-primary/80 block mb-2">Biografía o Descripción del Servicio <span className="text-red-500">*</span></label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} required rows="4" className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary" placeholder="Describe tu experiencia, qué te hace diferente, etc."></textarea>
                </div>
                <div>
                  <label className="text-sm font-bold text-primary/80 block mb-2">Otros servicios que ofreces (Opcional)</label>
                  <textarea name="services_offered" value={formData.services_offered} onChange={handleChange} rows="3" className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary" placeholder="Ej: Instalaciones eléctricas, mantenimiento de jardines, etc."></textarea>
                </div>
                <div>
                  <label className="text-sm font-bold text-primary/80 block mb-2">Certificado FELCC/REJAP (Opcional)</label>
                  <input type="file" name="felcc_rejap" onChange={handleFelccRejapChange} accept=".pdf,.jpg,.jpeg,.png" className="w-full text-sm text-primary/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                </div>
                <div className="flex items-center gap-3 p-3 bg-background-light dark:bg-slate-700/50 rounded-lg">
                  <input type="checkbox" name="has_store" id="has_store" checked={formData.has_store} onChange={handleChange} className="size-5 rounded text-primary focus:ring-primary" />
                  <label htmlFor="has_store" className="text-sm font-bold text-primary/80">Tengo una tienda o local físico</label>
                </div>
                {formData.has_store && (
                  <div>
                    <label className="text-sm font-bold text-primary/80 block mb-2">Ubicación de la Tienda o Local</label>
                    <p className="text-xs text-primary/60 mb-2 -mt-2">Busca una dirección o arrastra el marcador en el mapa para mayor precisión.</p>
                    <LocationPicker
                      onLocationChange={handleLocationChange}
                      address={formData.store_address}
                      onAddressChange={handleAddressChange}
                    />
                  </div>
                )}
                <label className="text-sm font-bold text-primary/80 block mb-2">
                  Radio de Acción (km) (Opcional)
                </label>
                <input
                  type="number"
                  name="action_radius"
                  value={formData.action_radius}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary"
                  placeholder="Ej: 10 (km)"
                />
              </div>
            </fieldset>

            {isMinor && (
              <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-r-lg space-y-4 my-4">
                <p className="font-bold text-yellow-800 dark:text-yellow-300">Información Requerida para Menores de Edad</p>
                <div>
                  <label className="text-sm font-bold text-primary/80 block mb-2">Nombre Completo del Padre/Madre o Tutor <span className="text-red-500">*</span></label>
                  <input type="text" name="tutor_name" value={formData.tutor_name} onChange={handleChange} required={isMinor} className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm font-bold text-primary/80 block mb-2">Celular del Padre/Madre o Tutor <span className="text-red-500">*</span></label>
                  <input type="tel" name="tutor_phone" value={formData.tutor_phone} onChange={handleChange} required={isMinor} className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 border-transparent focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-sm font-bold text-primary/80 block mb-2">Permiso de la Defensoría (PDF o Imagen) <span className="text-red-500">*</span></label>
                  <input type="file" name="defensoriaPermit" onChange={handlePermitChange} required={isMinor} accept=".pdf,.jpg,.jpeg,.png" className="w-full text-sm text-primary/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-background-light dark:bg-slate-700/50 rounded-lg">
              <input type="checkbox" name="legal_accepted" id="legal_accepted" checked={formData.legal_accepted} onChange={handleChange} required className="size-5 rounded text-primary focus:ring-primary mt-1 shrink-0" />
              <label htmlFor="legal_accepted" className="text-sm text-primary/80 dark:text-slate-350">
                He leído y acepto la <button type="button" onClick={() => setShowTermsModal(true)} className="font-bold text-primary dark:text-teal-400 hover:underline bg-transparent border-none p-0 inline cursor-pointer">Política de No Relación Laboral</button>. <span className="text-red-500">*</span>
              </label>
            </div>

            {error && (
              <div className="animate-feedback flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-semibold">
                <span className="material-symbols-outlined shrink-0 text-xl">error</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="animate-feedback flex items-center gap-3 p-3 bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 rounded-lg text-sm font-semibold">
                <span className="material-symbols-outlined shrink-0 text-xl">check_circle</span>
                <span>{success}</span>
              </div>
            )}
            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-bold text-lg transition-all active:scale-95">Crear Perfil Profesional</button>
          </form>
          <p className="text-sm text-center text-primary/60 dark:text-slate-400">¿Ya tienes una cuenta? <Link to="/login" className="font-bold text-primary dark:text-teal-400 hover:underline">Inicia Sesión</Link></p>
        </div>
      </div>

      {/* Modal de Términos y Condiciones */}
      {showTermsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowTermsModal(false)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-6 rounded-2xl shadow-2xl flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="font-display text-lg font-bold text-primary dark:text-slate-100">Política de No Relación Laboral</h3>
              <button 
                type="button" 
                onClick={() => setShowTermsModal(false)} 
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4 text-sm leading-relaxed overflow-y-auto pr-2 max-h-[60vh]">
              <h4 className="font-display font-semibold text-base text-primary dark:text-slate-100">
                Política de No Relación Laboral y Términos de Servicio Independiente
              </h4>
              <p className="text-xs text-primary/60 dark:text-slate-400">
                Última actualización: Julio 2026
              </p>
              
              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">1. Declaración de Independencia</h5>
                <p>
                  El presente documento regula los términos y condiciones de la relación entre los profesionales independientes y la plataforma <strong>SENN</strong> (Senn soluciones). Al registrarse como profesional, usted reconoce y acepta expresamente que <strong>SENN</strong> actúa únicamente como una plataforma de intermediación tecnológica que conecta a prestadores de servicios independientes con clientes que demandan dichos servicios.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">2. Ausencia de Vínculo Laboral (No Relación de Dependencia)</h5>
                <p>
                  Bajo ninguna circunstancia se considerará que existe un contrato de trabajo, relación de dependencia, subordinación ni vínculo laboral de ningún tipo entre el profesional y <strong>SENN</strong>.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Autonomía Técnica:</strong> El profesional tiene absoluta libertad para decidir el método, los materiales y la forma de ejecución de los servicios solicitados por el cliente.</li>
                  <li><strong>Autonomía de Horarios:</strong> El profesional define libremente sus horas de disponibilidad, el número de horas que permanece en línea y los trabajos que decide aceptar o rechazar.</li>
                  <li><strong>Herramientas Propias:</strong> El profesional deberá proveerse de sus propias herramientas, vehículos, equipos y recursos necesarios para ejecutar el servicio acordado.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">3. Pagos y Responsabilidades Fiscales</h5>
                <p>
                  Los precios o tarifas del servicio son pactados de mutuo acuerdo entre el profesional y el cliente. El profesional es el único responsable de declarar y pagar cualquier impuesto, arancel o contribución social que corresponda según la legislación vigente en Bolivia. <strong>SENN</strong> no realiza retenciones de ley asociadas a salarios ni provee seguro médico, beneficios sociales, aguinaldos o vacaciones.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">4. Deslinde de Responsabilidad Legal</h5>
                <p>
                  Dado que <strong>SENN</strong> no tiene control directo sobre la calidad, el tiempo, la seguridad o la legalidad de los servicios provistos, la plataforma queda exonerada de toda responsabilidad por daños civiles, penales, laborales o comerciales que surjan de la interacción, negociación o contratación directa entre el cliente y el profesional.
                </p>
              </section>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-700">
              <button 
                type="button" 
                onClick={() => setShowTermsModal(false)} 
                className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border-none cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RegisterProfessionalPage;