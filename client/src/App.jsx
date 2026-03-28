import React from "react";
import { Route, Routes } from "react-router-dom";

import Landing from "./pages/Landing";


const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />

          <Route path="resume-engine" element={<ResumeAnalysis />} />

          <Route path="build" element={<ResumeBuilder />} />

          <Route path="settings" element={<SettingsPage />} />

        
              <Route path="off" element={<ConfidenceLens />} />

          <Route path="admin" element={<Admin />} />

          <Route path="prepare" element={<MockInterview />} />

          {/* Broken dashboard routes */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {/* Chatbot visible globally */}
      <ChatBot />
    </>
  );
};

export default App;