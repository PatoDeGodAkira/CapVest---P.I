import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/Login/LoginPage";
import HomePage from "../pages/Home/HomePage";
import ProfilePage from "../pages/Profile/ProfilePage";
import MaterialsPage from "../pages/Materials/MaterialsPage";
import VestibularPage from "../pages/Vestibular/VestibularPage";
import QuestionsPage from "../pages/Questions/QuestionsPage";
import LandingPage from "../pages/LandingPage/LandingPage";
import ExamPage from "../pages/Exam/ExamPage";
import ProtectedRoute from "./ProtectedRoute";
import RankingPage from "../pages/Ranking/RankingPage";
import WorkspacePage from "../pages/Workspace/WorkspacePage";
import SimuladosPage from "../pages/Workspace/SimuladosPage";
import SimulationPage from "../pages/Workspace/SimulationPage";
import SchedulePage from "../pages/Workspace/SchedulePage";

const privatePage = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={privatePage(<HomePage />)} />
      <Route path="/perfil" element={privatePage(<ProfilePage />)} />
      <Route path="/ranking" element={privatePage(<RankingPage />)} />
      <Route path="/simulados" element={privatePage(<SimuladosPage />)} />
      <Route path="/simulados/:id" element={privatePage(<SimulationPage />)} />
      <Route path="/redacoes" element={privatePage(<WorkspacePage type="essays" />)} />
      <Route path="/cronograma" element={privatePage(<SchedulePage />)} />
      <Route path="/desempenho" element={privatePage(<WorkspacePage type="analytics" />)} />
      <Route path="/comunidade" element={privatePage(<WorkspacePage type="community" />)} />
      <Route path="/materiais" element={privatePage(<MaterialsPage />)} />
      <Route path="/materiais/:id" element={privatePage(<VestibularPage />)} />
      <Route path="/questoes" element={privatePage(<QuestionsPage />)} />
      <Route path="/provas/:docId" element={privatePage(<ExamPage />)} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
