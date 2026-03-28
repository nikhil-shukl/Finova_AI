import React from "react";
import { Route, Routes } from "react-router-dom";

import Landing from "./pages/Landing";
import DashboardLayout from "./components/layout/DashboardLayout";
import NewsInsight from "./pages/NewsInsight";
import TruthAgent from "./pages/TruthAgent";
import MyPort from "./pages/MyPort";
import Bot from "./pages/Bot";



const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<MyPort />} />

          <Route path="news" element={<NewsInsight />} />

          <Route path="true" element={<TruthAgent />} />
            <Route path="bot" element={<Bot />} />



        
          
        </Route>
      </Routes>
    
    </>
  );
};

export default App;