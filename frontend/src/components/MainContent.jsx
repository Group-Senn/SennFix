import React from 'react';
import SearchBar from './SearchBar';
import MainServices from './MainServices';
import AdBanner from './AdBanner';
import NearbyProfessionals from './NearbyProfessionals';

function MainContent() {
  return (
    <main className="px-4 lg:px-8 pb-32 lg:pb-12">
      <SearchBar />
      <MainServices />
      <AdBanner />
      <NearbyProfessionals />
    </main>
  );
}

export default MainContent;