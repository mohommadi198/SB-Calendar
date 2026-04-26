import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route } from "react-router-dom";

import {
  fetchCalendarImages,
  CalendarImage
} from "../services/firebaseService";
import FullScreenViewer from "./FullScreenViewer";
import Navbar from "./Navbar";
import TodayView from "./pages/TodayView";
import ExploreView from "./pages/ExploreView";
import AdsBanner from "./AdsBanner";
import { db } from "../config/firebase";
interface UserAppProps {
  isAdmin?: boolean | null;
}

const UserApp: React.FC<UserAppProps> = ({ isAdmin }) => {
  const [months, setMonths] = useState<CalendarImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<CalendarImage | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
  const featuredMonth = months.find(m => m.month === currentMonthName);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedMonths = await fetchCalendarImages();
      setMonths(fetchedMonths);
    } catch (error) {
      console.error("Data loading error", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);



  const openMonthModal = (month: CalendarImage) => {
    setSelectedMonth(month);
    document.body.style.overflow = "hidden";
  };

  const closeMonthModal = () => {
    setSelectedMonth(null);
    document.body.style.overflow = "auto";
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <Navbar deferredPrompt={deferredPrompt} onInstall={handleInstallClick} isAdmin={isAdmin} />
      </header>

      <div className="content-area">
        <Routes>
          <Route 
            path="/" 
            element={
              <TodayView 
                loading={loading} 
                featuredMonth={featuredMonth} 
                currentMonthName={currentMonthName} 
                onOpen={openMonthModal} 
              />
            } 
          />
          <Route 
            path="/explore" 
            element={
              <ExploreView 
                loading={loading} 
                months={months} 
                onOpen={openMonthModal} 
              />
            } 
          />
        </Routes>
      </div>
      
      <AdsBanner />

      <FullScreenViewer
        selectedMonth={selectedMonth}
        allMonths={months}
        onMonthChange={setSelectedMonth}
        onClose={closeMonthModal}
      />
    </div>
  );
};

export default UserApp;
