import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LocationPicker from '../components/LocationPicker';
import SpecialtyCombobox from '../components/SpecialtyCombobox';
import DatePicker from '../components/DatePicker';
import PhoneVerification from '../components/PhoneVerification';
import { compressImage } from '../utils/imageCompressor';

function RegisterProfessionalPage() {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showConditionsModal, setShowConditionsModal] = useState(false);
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
    action_radius: 10,
    legal_accepted: false,
    tutor_name: '',
    tutor_phone: '',
    hashtags: '',
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
  const [showVerificationModal, setShowVerificationModal] = useState(false);
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

    if (name === 'identity_card' || name === 'phone_number') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 8) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
    } else if (name === 'hashtags') {
      const prevValue = formData.hashtags || '';
      let formatted = value;

      if (value.length >= prevValue.length && value.length > 0) {
        // Si no empieza con '#', le agregamos el '#' al principio
        if (!formatted.startsWith('#')) {
          formatted = '#' + formatted;
        }
        
        // Si termina con un espacio, agregamos ' #'
        if (formatted.endsWith(' ')) {
          if (!formatted.endsWith('  ') && !formatted.endsWith('# ')) {
            formatted = formatted.trim() + ' #';
          }
        }
        
        // Asegurar que cada palabra empiece con '#'
        const parts = formatted.split(' ');
        const processedParts = parts.map(part => {
          if (part.length > 0 && !part.startsWith('#')) {
            return '#' + part;
          }
          return part;
        });
        formatted = processedParts.join(' ');
        // Reemplazar múltiples '#' seguidos por uno solo
        formatted = formatted.replace(/#+/g, '#');
      }
      
      setFormData(prev => ({ ...prev, hashtags: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }

    if (name === 'password') {
      setIsProfileSectionEnabled(value.trim().length > 0);
    }
  };

  const handleSpecialtyChange = (specialty) => {
    setFormData(prev => ({ ...prev, specialty }));
  };

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressed = await compressImage(file);
      setProfileImageFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    }
  };

  const handlePermitChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressed = await compressImage(file);
      setDefensoriaPermitFile(compressed);
    }
  };

  const handleCiFrontChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressed = await compressImage(file);
      setCiFrontFile(compressed);
    }
  };

  const handleCiBackChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressed = await compressImage(file);
      setCiBackFile(compressed);
    }
  };

  const handleFelccRejapChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressed = await compressImage(file);
      setFelccRejapFile(compressed);
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

  const handleSubmit = (e) => {
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

    if (formData.phone_number.length !== 8 || !/^[67]\d{7}$/.test(formData.phone_number)) {
      return setError('El número de celular debe ser un celular válido de Bolivia (8 dígitos, empezando con 6 o 7).');
    }

    const pwdError = validatePassword(formData.password);
    if (pwdError) return setError(pwdError);

    if (!profileImageFile) return setError('La foto de perfil del rostro es obligatoria para tu verificación KYC.');
    if (!ciFrontFile) return setError('Debes adjuntar la imagen del anverso del carnet.');
    if (!ciBackFile) return setError('Debes adjuntar la imagen del reverso del carnet.');

    if (isMinor) {
      if (!formData.tutor_name.trim()) return setError('El campo "Nombre del Tutor" es obligatorio para menores de edad.');
      if (!formData.tutor_phone.trim()) return setError('El campo "Celular del Tutor" es obligatorio para menores de edad.');
      if (!defensoriaPermitFile) return setError('Debes adjuntar el permiso de la defensoría para menores de edad.');
    }

    if (!formData.legal_accepted) return setError('Debes aceptar la Política de No Relación Laboral.');

    // Abrir el modal de verificación (enviará el SMS automáticamente)
    setShowVerificationModal(true);
  };

  const handleVerificationSuccess = async () => {
    setShowVerificationModal(false);
    setError('');
    setSuccess('Celular verificado. Creando perfil profesional...');

    const submissionData = new FormData();
    const fullPhoneNumber = `+591${formData.phone_number}`;

    for (const key in formData) {
      if (key === 'phone_number') {
        submissionData.append(key, fullPhoneNumber);
      } else {
        submissionData.append(key, formData[key]);
      }
    }

    if (formData.specialty === 'Otro') {
      submissionData.set('specialty', formData.customSpecialty);
    }
    submissionData.delete('customSpecialty');

    if (profileImageFile) {
      submissionData.append('profileImage', profileImageFile);
    }

    if (defensoriaPermitFile) {
      submissionData.append('defensoriaPermit', defensoriaPermitFile);
    }

    if (ciFrontFile) {
      submissionData.append('ci_front', ciFrontFile);
    }
    if (ciBackFile) {
      submissionData.append('ci_back', ciBackFile);
    }

    if (felccRejapFile) {
      submissionData.append('felcc_rejap', felccRejapFile);
    }

    try {
      const response = await fetch(window.API_URL + '/api/register-professional', {
        method: 'POST',
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
      setSuccess('');
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
        <div className="w-full max-w-md lg:max-w-3xl p-6 sm:p-8 space-y-5 bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-primary/5 dark:shadow-black/20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary dark:text-slate-100">Únete como Profesional</h1>
            <p className="text-sm text-primary/60 dark:text-slate-400 mt-2 font-medium">Crea tu perfil para que miles de clientes te encuentren.</p>
          </div>

          {/* Selector de imagen de perfil */}
          <div className="flex flex-col items-center pt-2">
            <label htmlFor="profileImage" className="cursor-pointer group">
              <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-primary/40 dark:text-slate-400 ring-4 ring-primary/10 dark:ring-slate-700 overflow-hidden relative">
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
            <p className="text-xs font-bold text-primary/50 dark:text-slate-455 mt-2 uppercase tracking-wider">Añadir foto de perfil</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs font-bold text-primary/50 dark:text-slate-455 uppercase tracking-wider pt-2 border-b border-primary/5 pb-1">Información de la Cuenta</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Nombre Completo o de Empresa <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 dark:text-slate-400 text-lg">person</span>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200" 
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Correo Electrónico <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 dark:text-slate-400 text-lg">alternate_email</span>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200" 
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Contraseña <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 dark:text-slate-400 text-lg">lock</span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  className="w-full pl-11 pr-12 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200" 
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-455 hover:text-primary dark:hover:text-slate-200 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>

              {formData.password && formData.password.length > 0 && (
                <div className="mt-2 text-xs space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-primary/5 dark:border-slate-700 animate-feedback">
                  <p className="font-semibold text-primary/80 dark:text-slate-350 mb-1">Requisitos de la contraseña:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    <div className={`flex items-center gap-1.5 ${formData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      <span className="material-symbols-outlined text-[14px] font-bold">{formData.password.length >= 8 ? 'check' : 'close'}</span>
                      <span>Mínimo 8 caracteres</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      <span className="material-symbols-outlined text-[14px] font-bold">{/[A-Z]/.test(formData.password) ? 'check' : 'close'}</span>
                      <span>Una mayúscula (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/[a-z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      <span className="material-symbols-outlined text-[14px] font-bold">{/[a-z]/.test(formData.password) ? 'check' : 'close'}</span>
                      <span>Una minúscula (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/\d/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      <span className="material-symbols-outlined text-[14px] font-bold">{/\d/.test(formData.password) ? 'check' : 'close'}</span>
                      <span>Un número (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/[@$!%*?&._-]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      <span className="material-symbols-outlined text-[14px] font-bold">{/[@$!%*?&._-]/.test(formData.password) ? 'check' : 'close'}</span>
                      <span>Carácter especial (@$!%*?&._-)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <DatePicker
                value={formData.birth_date}
                onChange={(dateStr) => setFormData(prev => ({ ...prev, birth_date: dateStr }))}
              />
            </div>

            <hr className="border-primary/5" />

            <fieldset disabled={!isProfileSectionEnabled}>
              <div className={`space-y-4 transition-opacity duration-500 ${!isProfileSectionEnabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}>
                <p className="text-xs font-bold text-primary/50 dark:text-slate-455 uppercase tracking-wider border-b border-primary/5 pb-1">Información del Perfil Profesional</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">C.I. <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 dark:text-slate-400 text-lg">badge</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        name="identity_card"
                        maxLength={8}
                        value={formData.identity_card}
                        onChange={handleChange}
                        placeholder="12345678"
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200"
                      />
                    </div>
                    <div className="mt-2">
                      <label className="text-xs font-bold text-primary/85 dark:text-slate-350 block mb-1">Anverso del C.I. <span className="text-red-500">*</span></label>
                      <input type="file" name="ci_front" onChange={handleCiFrontChange} required accept="image/*" className="w-full text-xs text-primary/80 dark:text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 dark:file:bg-white/10 file:text-primary dark:file:text-white hover:file:bg-primary/20 dark:hover:file:bg-white/20 transition-all cursor-pointer" />
                    </div>
                    <div className="mt-2">
                      <label className="text-xs font-bold text-primary/85 dark:text-slate-350 block mb-1">Reverso del C.I. <span className="text-red-500">*</span></label>
                      <input type="file" name="ci_back" onChange={handleCiBackChange} required accept="image/*" className="w-full text-xs text-primary/80 dark:text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 dark:file:bg-white/10 file:text-primary dark:file:text-white hover:file:bg-primary/20 dark:hover:file:bg-white/20 transition-all cursor-pointer" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Número de Celular <span className="text-red-500">*</span></label>
                    <div className="flex rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 focus-within:ring-4 focus-within:ring-primary/10 dark:focus-within:ring-teal-500/10 focus-within:border-primary dark:focus-within:border-teal-500 transition-all overflow-hidden">
                      <div className="flex items-center gap-1.5 px-3 bg-slate-200/40 dark:bg-slate-700 border-r border-primary/10 text-primary dark:text-slate-100 font-bold select-none text-sm">
                        <span>🇧🇴</span>
                        <span>+591</span>
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder="7XXXXXXX"
                        required
                        className="w-full px-4 py-3 bg-transparent text-primary dark:text-slate-100 border-none outline-none focus:ring-0 text-sm"
                      />
                    </div>
                    <span className="text-[10px] text-primary/50 dark:text-slate-450 block mt-1 leading-tight">
                      Ingrese los 8 dígitos de su celular. Se enviará un SMS para verificar.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Especialidad Principal <span className="text-red-500">*</span></label>
                  <SpecialtyCombobox onSpecialtyChange={handleSpecialtyChange} />
                </div>

                {formData.specialty === 'Otro' && (
                  <div>
                    <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Escribe tu especialidad</label>
                    <input 
                      type="text" 
                      name="customSpecialty" 
                      value={formData.customSpecialty} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200" 
                      placeholder="Ej: Instalador de paneles solares"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Biografía o Descripción del Servicio <span className="text-red-500">*</span></label>
                  <textarea 
                    name="bio" 
                    value={formData.bio} 
                    onChange={handleChange} 
                    required 
                    rows="4" 
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200"
                    placeholder="Describe tu experiencia, qué te hace diferente, etc."
                  ></textarea>
                </div>
                <div>
                  <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Otros servicios que ofreces (Opcional)</label>
                  <textarea 
                    name="services_offered" 
                    value={formData.services_offered} 
                    onChange={handleChange} 
                    rows="3" 
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200"
                    placeholder="Ej: Instalaciones eléctricas, mantenimiento de jardines, etc."
                  ></textarea>
                </div>
                <div>
                  <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Hashtags / Trabajos Especiales (Opcional)</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 dark:text-slate-400 text-lg">tag</span>
                    <input
                      type="text"
                      name="hashtags"
                      value={formData.hashtags}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200"
                      placeholder="ej: #carpinteriaFina #reparacionNeveras"
                    />
                  </div>
                  <p className="text-[10px] text-primary/50 dark:text-slate-450 mt-1 leading-tight">Añade palabras clave precedidas de # para destacar en servicios específicos.</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-primary/85 dark:text-slate-350 block mb-1">Certificado FELCC/REJAP (Opcional)</label>
                  <input type="file" name="felcc_rejap" onChange={handleFelccRejapChange} accept=".pdf,.jpg,.jpeg,.png" className="w-full text-xs text-primary/80 dark:text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 dark:file:bg-white/10 file:text-primary dark:file:text-white hover:file:bg-primary/20 dark:hover:file:bg-white/20 transition-all cursor-pointer" />
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-primary/5 dark:border-slate-750">
                  <input type="checkbox" name="has_store" id="has_store" checked={formData.has_store} onChange={handleChange} className="size-5 rounded text-primary focus:ring-primary" />
                  <label htmlFor="has_store" className="text-sm font-bold text-primary/80 dark:text-slate-250">Tengo una tienda o local físico</label>
                </div>
                {formData.has_store && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase block">Ubicación de la Tienda o Local</label>
                    <p className="text-[11px] text-primary/55 dark:text-slate-400 mb-2 leading-tight">Busca una dirección o arrastra el marcador en el mapa para mayor precisión.</p>
                    <LocationPicker
                      onLocationChange={handleLocationChange}
                      address={formData.store_address}
                      onAddressChange={handleAddressChange}
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">
                    Radio de Acción (km) (Opcional)
                  </label>
                  <input
                    type="number"
                    name="action_radius"
                    value={formData.action_radius}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200"
                  />
                  <span className="text-[10px] text-primary/50 dark:text-slate-450 block mt-1">Ej: 10 (km)</span>
                </div>
              </div>
            </fieldset>

            {isMinor && (
              <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 rounded-r-2xl space-y-4 my-4">
                <p className="font-bold text-yellow-800 dark:text-yellow-300">Información Requerida para Menores de Edad</p>
                <div>
                  <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Nombre Completo del Padre/Madre o Tutor <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="tutor_name" 
                    value={formData.tutor_name} 
                    onChange={handleChange} 
                    required={isMinor} 
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200"
                    placeholder="Nombre completo del tutor"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-primary/80 dark:text-slate-350 tracking-wider uppercase mb-1.5 block">Celular del Padre/Madre o Tutor <span className="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    name="tutor_phone" 
                    value={formData.tutor_phone} 
                    onChange={handleChange} 
                    required={isMinor} 
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-primary/10 dark:border-slate-700 text-primary dark:text-slate-100 placeholder:text-primary/30 dark:placeholder:text-slate-500 focus:border-primary dark:focus:border-teal-500 focus:ring-4 focus:ring-primary/10 dark:focus:ring-teal-500/10 focus:outline-none transition-all duration-200"
                    placeholder="7XXXXXXX"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-primary/85 dark:text-slate-350 block mb-1">Permiso de la Defensoría (PDF o Imagen) <span className="text-red-500">*</span></label>
                  <input type="file" name="defensoriaPermit" onChange={handlePermitChange} required={isMinor} accept=".pdf,.jpg,.jpeg,.png" className="w-full text-xs text-primary/80 dark:text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 dark:file:bg-white/10 file:text-primary dark:file:text-white hover:file:bg-primary/20 dark:hover:file:bg-white/20 transition-all cursor-pointer" />
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-primary/5 dark:border-slate-750">
              <input type="checkbox" name="legal_accepted" id="legal_accepted" checked={formData.legal_accepted} onChange={handleChange} required className="size-5 rounded text-primary focus:ring-primary mt-0.5 shrink-0" />
              <label htmlFor="legal_accepted" className="text-sm text-primary/70 dark:text-slate-350">
                He leído y acepto la{' '}
                <button type="button" onClick={() => setShowPrivacyModal(true)} className="font-bold text-primary dark:text-teal-400 underline hover:opacity-80 transition-opacity bg-transparent border-none p-0 inline cursor-pointer">
                  Política de Privacidad
                </button>
                , los{' '}
                <button type="button" onClick={() => setShowConditionsModal(true)} className="font-bold text-primary dark:text-teal-400 underline hover:opacity-80 transition-opacity bg-transparent border-none p-0 inline cursor-pointer">
                  Términos y Condiciones
                </button>{' '}
                y la{' '}
                <button type="button" onClick={() => setShowTermsModal(true)} className="font-bold text-primary dark:text-teal-400 underline hover:opacity-80 transition-opacity bg-transparent border-none p-0 inline cursor-pointer">
                  Política de No Relación Laboral
                </button>{' '}
                de SENN FIX. <span className="text-red-500">*</span>
              </label>
            </div>

            {error && (
              <div className="animate-feedback flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-xl text-sm font-semibold">
                <span className="material-symbols-outlined shrink-0 text-xl">error</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="animate-feedback flex items-center gap-3 p-3 bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:teal-400 rounded-xl text-sm font-semibold">
                <span className="material-symbols-outlined shrink-0 text-xl">check_circle</span>
                <span>{success}</span>
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-primary to-teal-800 dark:from-teal-600 dark:to-teal-700 text-white rounded-2xl font-bold text-base transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-teal-500/10 active:scale-95 border-none cursor-pointer"
            >
              Crear Perfil Profesional
            </button>
          </form>
          <div className="text-sm text-center space-y-3">
            <p className="text-primary/60 dark:text-slate-400">¿Ya tienes una cuenta? <Link to="/login" className="font-bold text-primary dark:text-teal-400 hover:underline">Inicia Sesión</Link></p>
            <p className="text-xs text-primary/50 dark:text-slate-455">¿Buscas ayuda o contratar un servicio? <Link to="/register" className="font-bold text-primary dark:text-teal-400 hover:underline">Regístrate como Cliente aquí</Link></p>
          </div>
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

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">5. Protección de Datos y Privacidad (Art. 21 CPE)</h5>
                <p>
                  De acuerdo con el Artículo 21 de la Constitución Política del Estado de Bolivia, <strong>SENN FIX</strong> se compromete a resguardar de forma estrictamente privada y confidencial las imágenes de su Cédula de Identidad (anverso/reverso) y Certificados cargados en servidores seguros sin acceso público. Se aplicará de forma automática una marca de agua a sus documentos de identidad para evitar cualquier uso indebido de los mismos.
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

      {/* Modal de Política de Privacidad */}
      {showPrivacyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-6 rounded-2xl shadow-2xl flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="font-display text-lg font-bold text-primary dark:text-slate-100">Política de Privacidad</h3>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4 text-sm leading-relaxed overflow-y-auto pr-2 max-h-[60vh] text-left">
              <h4 className="font-display font-semibold text-base text-primary dark:text-slate-100">
                Política de Privacidad y Protección de Datos Personales
              </h4>
              <p className="text-xs text-primary/60 dark:text-slate-400">
                Última actualización: Julio 2026
              </p>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-205">1. Compromiso de Privacidad (Art. 21 CPE)</h5>
                <p>
                  De conformidad con el Artículo 21 de la Constitución Política del Estado Plurinacional de Bolivia, <strong>SENN FIX</strong> (Senn soluciones) se compromete a salvaguardar la intimidad, privacidad, honra y propia imagen de sus usuarios. Este documento describe cómo recolectamos, procesamos y resguardamos la información personal recopilada a través de la aplicación.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-205">2. Datos recopilados</h5>
                <p>
                  Para registrarse y utilizar el servicio de manera segura, recabamos los siguientes datos:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Identificación:</strong> Nombre completo, correo electrónico, cédula de identidad y fecha de nacimiento.</li>
                  <li><strong>Contacto:</strong> Número de celular.</li>
                  <li><strong>Ubicación:</strong> Coordenadas geográficas a fin de ubicar profesionales locales cercanos en el mapa.</li>
                  <li><strong>Verificación KYC (Profesionales):</strong> Fotos del carnet de identidad, certificados de antecedentes (FELCC/REJAP) y foto de perfil del rostro.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-205">3. Finalidad del tratamiento de datos</h5>
                <p>
                  Los datos personales proporcionados se procesan con los siguientes fines exclusivos:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Facilitar la intermediación y contratación de servicios autónomos entre clientes y profesionales.</li>
                  <li>Cumplir con las obligaciones legales de verificación de identidad KYC para prevenir fraudes e inseguridad.</li>
                  <li>Enviar alertas, notificaciones transaccionales y actualizaciones sobre el estado de las solicitudes.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-205">4. Resguardo y Seguridad de los Datos</h5>
                <p>
                  Los archivos de verificación de identidad (fotos de cédulas de identidad, certificados de antecedentes) se almacenan de manera encriptada y segura, y solo están accesibles para auditorías internas de seguridad administrativa por parte de nuestro equipo autorizado. <strong>SENN FIX</strong> no venderá, cederá ni distribuirá sus datos personales a terceros sin su consentimiento expreso, excepto por mandamiento de ley de autoridad judicial competente.
                </p>
              </section>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border-none cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Términos y Condiciones */}
      {showConditionsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowConditionsModal(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-6 rounded-2xl shadow-2xl flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="font-display text-lg font-bold text-primary dark:text-slate-100">Términos y Condiciones</h3>
              <button
                type="button"
                onClick={() => setShowConditionsModal(false)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4 text-sm leading-relaxed overflow-y-auto pr-2 max-h-[60vh] text-left">
              <h4 className="font-display font-semibold text-base text-primary dark:text-slate-100">
                Términos y Condiciones de Uso
              </h4>
              <p className="text-xs text-primary/60 dark:text-slate-440">
                Última actualización: Julio 2026
              </p>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">1. Aceptación de los Términos</h5>
                <p>
                  Al descargar, registrarse o utilizar la plataforma tecnológica <strong>SENN FIX</strong> (Senn soluciones), usted acepta quedar vinculado de manera incondicional por los presentes Términos y Condiciones de Uso. Si usted no está de acuerdo con alguno de los puntos establecidos aquí, debe abstenerse de utilizar o acceder a los servicios de la plataforma.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">2. Objeto de la Plataforma</h5>
                <p>
                  <strong>SENN FIX</strong> actúa como un mero intermediario tecnológico facilitando el contacto entre clientes que buscan contratar asistencia y profesionales independientes debidamente calificados que ofrecen sus servicios de forma autónoma. <strong>SENN FIX</strong> no asume responsabilidad directa por el servicio prestado, la calidad del mismo ni los acuerdos privados a los que lleguen ambas partes.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">3. Cuentas de Usuario y Seguridad</h5>
                <p>
                  Al registrarse, usted se compromete a proporcionar información verídica, exacta y actualizada. Es su responsabilidad salvaguardar la confidencialidad de su contraseña y notificar inmediatamente a soporte técnico ante cualquier uso no autorizado de su cuenta.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">4. Regulación para Menores de Edad (Ley 548)</h5>
                <p>
                  Conforme a la Ley 548 del Código Niña, Niño y Adolescente del Estado Plurinacional de Bolivia, los menores entre 14 y 17 años podrán ofrecer sus servicios únicamente si cuentan con la autorización legal correspondiente de sus padres, madres o tutores legales y de la Defensoría de la Niñez. Los menores tienen prohibido registrarse para realizar cualquier tipo de trabajo considerado de alto riesgo (construcción pesada, alta tensión, etc.).
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-display font-semibold text-primary dark:text-slate-200">5. Modificaciones y Actualizaciones</h5>
                <p>
                  Nos reservamos el derecho de enmendar o actualizar estos Términos y Condiciones en cualquier momento. El uso continuado de la plataforma tras dichas modificaciones constituirá su pleno consentimiento a las mismas.
                </p>
              </section>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowConditionsModal(false)}
                className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border-none cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      {showVerificationModal && (
        <PhoneVerification
          phoneNumber={formData.phone_number}
          onVerified={handleVerificationSuccess}
          onClose={() => setShowVerificationModal(false)}
        />
      )}
    </>
  );
}

export default RegisterProfessionalPage;