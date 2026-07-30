import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function JobCompletionPage() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('question'); // 'question', 'success', 'dispute'
  const [apiResponse, setApiResponse] = useState('');
  const [mediationLoading, setMediationLoading] = useState(false);

  // Verifica que el usuario sea el cliente del trabajo
  useEffect(() => {
    const verifyClient = async () => {
      if (!user) return;
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:3000/api/jobs/${jobId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo cargar la información del trabajo.');
        const data = await response.json();

        if (user.id !== data.client_id) {
          setError('No tienes permiso para acceder a esta página.');
          setTimeout(() => navigate('/home'), 3000);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    verifyClient();
  }, [jobId, user, navigate]);

  const handlePeaceAnswer = async (answer) => {
    setError('');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/jobs/${jobId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ broughtPeace: answer })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Ocurrió un error.');

      setApiResponse(data.message);
      if (data.status === 'completed') {
        setView('success');
      } else if (data.status === 'needs_mediation') {
        setView('dispute');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRequestMediation = async () => {
    setError('');
    setMediationLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/jobs/${jobId}/request-mediation`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Ocurrió un error.');
      
      // Actualiza el mensaje en pantalla y deshabilita el botón permanentemente
      setApiResponse(data.message);

    } catch (err) {
      setError(err.message);
    } finally {
      setMediationLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-primary/70">Verificando...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500 p-4 text-center">{error}</div>;
  }

  const renderContent = () => {
    switch (view) {
      case 'success':
        return (
          <div className="text-center">
            <span className="material-symbols-outlined text-7xl text-green-500">task_alt</span>
            <h1 className="text-2xl font-bold text-primary mt-4">¡Misión cumplida!</h1>
            <p className="text-primary/80 mt-2 max-w-md">{apiResponse}</p>
            <Link to="/home" className="mt-8 inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg">Volver al Inicio</Link>
          </div>
        );
      case 'dispute':
        return (
          <div className="text-center">
            <span className="material-symbols-outlined text-7xl text-amber-500">support_agent</span>
            <h1 className="text-2xl font-bold text-primary mt-4">Mediación Iniciada</h1>
            <p className="text-primary/80 mt-2 max-w-md">{apiResponse}</p>
            <button 
              onClick={handleRequestMediation}
              disabled={mediationLoading}
              className="mt-8 inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-amber-300 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">gavel</span>
              {mediationLoading ? 'Enviando...' : 'Solicitar Mediación SENN'}
            </button>
          </div>
        );
      default: // 'question'
        return (
          <div className="text-center">
            <span className="material-symbols-outlined text-7xl text-primary/50">sentiment_calm</span>
            <h1 className="text-3xl font-bold text-primary mt-4">¿Este servicio te trajo paz?</h1>
            <p className="text-primary/70 mt-2 max-w-md">Tu respuesta nos ayuda a mantener la calidad y confianza en nuestra comunidad.</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button onClick={() => handlePeaceAnswer('yes')} className="w-full sm:w-auto flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg">Sí</button>
              <button onClick={() => handlePeaceAnswer('no')} className="w-full sm:w-auto flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg">No</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4">
      <div className="w-full max-w-2xl p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
        {renderContent()}
      </div>
    </div>
  );
}

export default JobCompletionPage;