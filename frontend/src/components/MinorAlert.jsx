import React from 'react';

function MinorAlert() {
  return (
    <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-300 p-4 mx-4 lg:mx-8 rounded-r-lg shadow-sm" role="alert">
      <div className="flex items-center">
        <div className="py-1">
          <span className="material-symbols-outlined mr-3">warning</span>
        </div>
        <div>
          <p className="text-sm font-bold">
            Usted está contactando a un menor de edad con permiso laboral vigente. Se recomienda la supervisión de un adulto.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MinorAlert;