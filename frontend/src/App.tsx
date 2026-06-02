import { FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar           from './components/Navbar';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import DashboardPage    from './pages/DashboardPage';
import RewardsPage      from './pages/RewardsPage';
import TransactionsPage from './pages/TransactionsPage';



const App: FC = () => (
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/"             element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"        element={<LoginPage />} />
      <Route path="/register"     element={<RegisterPage />} />
      <Route path="/dashboard"    element={<DashboardPage />} />
      <Route path="/rewards"      element={<RewardsPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
