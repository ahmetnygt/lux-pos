import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import WaiterScreen from './pages/WaiterScreen';
// Kendi dosya yollarına göre aşağıdaki importları düzeltirsin
import TableMap from './components/TableMap';
import Dashboard from './pages/Dashboard';
import PosScreen from './pages/PosScreen';
import MenuManagement from './pages/MenuManagement';
import PersonnelManagement from './pages/PersonnelManagement';

// SİSTEM BİLGİSİ: Kapıdaki Titiz Badigard (Güvenlik Kalkanı)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const userStr = localStorage.getItem('lux_user');

  // Adamın bileti yoksa direkt ana kapıya (/) fırlat
  if (!userStr) {
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    // Eğer adamın rolü, izin verilen roller listesinde yoksa siktiri çek
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      console.warn(`Güvenlik Uyarısı: ${user.role} yetkisi bu sayfaya giremez!`);
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (e) {
    // Veri bozuksa temizle, ana kapıya (/) at
    localStorage.removeItem('lux_user');
    return <Navigate to="/" replace />;
  }
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* SİSTEM BİLGİSİ: Ana dizin direkt Login (Giriş) ekranı yapıldı */}
        <Route path="/" element={<Login />} />

        {/* SAHA OPERASYONU: Sadece Garson ve Admin girebilir */}
        <Route path="/garson" element={
          <ProtectedRoute allowedRoles={['Garson', 'Admin']}>
            <WaiterScreen />
          </ProtectedRoute>
        } />

        {/* KASA OPERASYONU: Sadece Kasa ve Admin girebilir */}
        <Route path="/pos" element={
          <ProtectedRoute allowedRoles={['Kasa', 'Admin']}>
            <PosScreen />
          </ProtectedRoute>
        } />

        {/* YÖNETİM PANELİ: Sadece Patron (Admin) girebilir */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/menu-management" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MenuManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/personnel" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <PersonnelManagement />
          </ProtectedRoute>
        } />

        {/* Yanlış Linke Tıklayanı Direkt Ana Sayfaya (/) Fırlat */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;