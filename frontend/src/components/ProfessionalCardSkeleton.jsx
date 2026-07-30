import React from 'react';

function ProfessionalCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-40 md:w-48">
      <div className="relative overflow-hidden rounded-2xl shadow-lg">
        <div className="w-full h-56 bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 p-3 w-full">
          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4 mb-2 animate-pulse"></div>
          <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalCardSkeleton;