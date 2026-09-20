import { Navigate, Route, Routes } from 'react-router-dom';
import { EmergencyBanner } from './components/EmergencyBanner';
import { Disclaimer } from './components/Disclaimer';
import { useProfile } from './context/ProfileContext';
import Home from './modules/Home';
import Onboarding from './modules/Onboarding';
import Session from './modules/Session';
import Orientation from './modules/Orientation';
import Memory from './modules/Memory';
import Attention from './modules/Attention';
import Executive from './modules/Executive';
import Aphasia from './modules/Aphasia';
import Neglect from './modules/Neglect';
import Adl from './modules/Adl';
import Mood from './modules/Mood';
import Caregiver from './modules/Caregiver';
import Dashboard from './modules/Dashboard';
import Evidence from './modules/Evidence';
import Settings from './modules/Settings';

export default function App() {
  const { profile, ready } = useProfile();
  const onboarded = profile.createdAt !== '';

  return (
    <div className="app">
      <EmergencyBanner />
      <main className="app-main" id="main">
        {!ready ? (
          <p className="loading">Loading…</p>
        ) : (
          <Routes>
            <Route
              path="/"
              element={onboarded ? <Home /> : <Navigate to="/onboarding" replace />}
            />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/session" element={<Session />} />
            <Route path="/orientation" element={<Orientation />} />
            <Route path="/memory" element={<Memory />} />
            <Route path="/attention" element={<Attention />} />
            <Route path="/executive" element={<Executive />} />
            <Route path="/aphasia" element={<Aphasia />} />
            <Route path="/neglect" element={<Neglect />} />
            <Route path="/adl" element={<Adl />} />
            <Route path="/mood" element={<Mood />} />
            <Route path="/caregiver" element={<Caregiver />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/evidence" element={<Evidence />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
      <Disclaimer />
    </div>
  );
}
