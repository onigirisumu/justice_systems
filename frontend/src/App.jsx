import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import CitizenLayout from './components/CitizenLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AppealsList from './pages/AppealsList';
import AppealDetail from './pages/AppealDetail';
import AppealForm from './pages/AppealForm';
import DocumentsList from './pages/DocumentsList';
import DocumentDetail from './pages/DocumentDetail';
import DocumentForm from './pages/DocumentForm';
import Users from './pages/Users';
import Appointments from './pages/Appointments';
import PublicTrack from './pages/PublicTrack';
import CitizenLogin from './pages/CitizenLogin';
import CitizenRegister from './pages/CitizenRegister';
import CitizenDashboard from './pages/CitizenDashboard';
import CitizenAppealNew from './pages/CitizenAppealNew';
import CitizenAppealDetail from './pages/CitizenAppealDetail';
import CitizenAppointments from './pages/CitizenAppointments';
import CitizenAppointmentNew from './pages/CitizenAppointmentNew';

function StaffRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'citizen') return <Navigate to="/portal" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function CitizenRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/portal/login" />;
  if (user.role !== 'citizen') return <Navigate to="/" />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/track" element={<PublicTrack />} />
      <Route path="/login" element={user && user.role !== 'citizen' ? <Navigate to="/" /> : <Login />} />
      <Route path="/portal/login" element={user?.role === 'citizen' ? <Navigate to="/portal" /> : <CitizenLogin />} />
      <Route path="/portal/register" element={user?.role === 'citizen' ? <Navigate to="/portal" /> : <CitizenRegister />} />

      <Route path="/portal" element={<CitizenRoute><CitizenLayout /></CitizenRoute>}>
        <Route index element={<CitizenDashboard />} />
        <Route path="new" element={<CitizenAppealNew />} />
        <Route path="appeals/:id" element={<CitizenAppealDetail />} />
        <Route path="appointments" element={<CitizenAppointments />} />
        <Route path="appointments/new" element={<CitizenAppointmentNew />} />
      </Route>

      <Route path="/" element={<StaffRoute><Layout /></StaffRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="appeals" element={<AppealsList />} />
        <Route path="appeals/new" element={<AppealForm />} />
        <Route path="appeals/:id" element={<AppealDetail />} />
        <Route path="appeals/:id/edit" element={<AppealForm />} />
        <Route path="documents" element={<DocumentsList />} />
        <Route path="documents/new" element={<DocumentForm />} />
        <Route path="documents/:id" element={<DocumentDetail />} />
        <Route path="documents/:id/edit" element={<DocumentForm />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="users" element={<StaffRoute roles={['admin']}><Users /></StaffRoute>} />
      </Route>
    </Routes>
  );
}
