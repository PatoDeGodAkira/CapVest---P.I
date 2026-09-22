import {Routes, Route } from "react-router-dom";

import LoginPage from "../pages/Login/LoginPage";
import HomePage from "../pages/Home/HomePage";
import StartPage from "../pages/Start/StartPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import MaterialsPage from "../pages/Materials/MaterialsPage";
import VestibularPage from "../pages/Vestibular/VestibularPage";
import QuestionsPage from "../pages/Questions/QuestionsPage";
import LandingPage from "../pages/LandingPage/landingPage";

export default function AppRoutes() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/materiais" element={<MaterialsPage />} />
        <Route path="/materiais/:id" element={<VestibularPage />} />
        <Route path="/questoes" element={<QuestionsPage />} />
      </Routes>
  );
}