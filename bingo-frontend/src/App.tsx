import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';

// Placeholder Pages (จะสร้างจริงทีหลัง)
const LobbyPage = () => <div style={{ padding: '2rem' }}><h1>Lobby Page</h1><p>รายการห้องบิงโก</p></div>;
const GameRoomPage = () => <div style={{ padding: '2rem' }}><h1>Game Room Page</h1><p>ห้องเกม</p></div>;
const WalletPage = () => <div style={{ padding: '2rem' }}><h1>Wallet Page</h1><p>กระเป๋าเงิน</p></div>;
const ProfilePage = () => <div style={{ padding: '2rem' }}><h1>Profile Page</h1><p>โปรไฟล์</p></div>;
const AdminPage = () => <div style={{ padding: '2rem' }}><h1>Admin Page</h1><p>หน้าผู้ดูแลระบบ</p></div>;
const NotFoundPage = () => <div style={{ padding: '2rem' }}><h1>404 Not Found</h1><p>ไม่พบหน้าที่คุณต้องการ</p></div>;

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Private Routes (ต้อง Login) */}
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/room/:roomId" element={<GameRoomPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#3f8600',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#cf1322',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
