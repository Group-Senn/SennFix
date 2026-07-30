import React from 'react';

function ProfileSkeleton() {
  return (
    <main className="flex-1 pb-32 md:pb-12 animate-pulse">
      <section className="p-6 lg:p-8">
        <div className="flex w-full flex-col md:flex-row md:items-start gap-6 md:gap-10">
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-32 w-32"></div>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 mt-4 md:mt-0">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="flex gap-1 mt-4">
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 py-4 mx-4 lg:mx-8 rounded-2xl">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
      </section>
    </main>
  );
}

export default ProfileSkeleton;