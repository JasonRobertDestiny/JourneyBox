import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateTripPage from './pages/CreateTripPage';
import CreateTripEnhanced from './pages/CreateTripEnhanced';
import TripDetailPage from './pages/TripDetailPage';
import ItineraryPage from './pages/ItineraryPage';
import ItineraryPageSimple from './pages/ItineraryPageSimple';
import ItineraryPageImproved from './pages/ItineraryPageImproved';
import EditTripPage from './pages/EditTripPage';
import DiscoverPage from './pages/DiscoverPage';
import CommunityPage from './pages/CommunityPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import GeneratingTripPage from './pages/GeneratingTripPage';
import WechatCallbackPage from './pages/WechatCallbackPage';
import MapTestPage from './pages/MapTestPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-trip" element={<CreateTripEnhanced />} />
        <Route path="/create-trip-old" element={<CreateTripPage />} />
        <Route path="/trip/:id" element={<TripDetailPage />} />
        <Route path="/itinerary/:id" element={<ItineraryPage />} />
        <Route path="/itinerary-simple/:id" element={<ItineraryPageSimple />} />
        <Route path="/itinerary-improved/:id" element={<ItineraryPageImproved />} />
        <Route path="/edit-trip/:id" element={<EditTripPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/post/:id" element={<PostDetailPage />} />
        <Route path="/community/create" element={<CreatePostPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/generating-trip" element={<GeneratingTripPage />} />
        <Route path="/auth/wechat-callback" element={<WechatCallbackPage />} />
        <Route path="/map-test" element={<MapTestPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App; 