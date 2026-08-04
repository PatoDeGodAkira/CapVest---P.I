import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../pages/Login/LoginPage";
import HomePage from "../pages/Home/HomePage";
import StartPage from "../pages/Start/StartPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import MaterialsPage from "../pages/Materials/MaterialsPage";
import VestibularPage from "../pages/Vestibular/VestibularPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/materiais" element={<MaterialsPage />} />
        <Route path="/materiais/:id" element={<VestibularPage />} />
      </Routes>
    </BrowserRouter>
  );
}