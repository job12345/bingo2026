import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  HomeOutlined,
  WalletOutlined,
  UserOutlined,
  LogoutOutlined,
  CrownOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores';
import { useWalletStore } from '@/stores';

const { Header, Content } = AntLayout;
const { Text } = Typography;

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main Layout Component - Gaming Theme
 * - แสดง Header พร้อมข้อมูล User
 * - เมนูนำทาง
 * - ยอดเงิน
 */
export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { balance } = useWalletStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // User Dropdown Menu
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'โปรไฟล์',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'wallet',
      icon: <WalletOutlined />,
      label: 'กระเป๋าเงิน',
      onClick: () => navigate('/wallet'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ออกจากระบบ',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <AntLayout style={{ minHeight: '100vh', background: '#0a0a1a' }}>
      {/* Header */}
      <Header
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(30, 30, 60, 0.95) 100%)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
          borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Logo & Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/lobby')}
        >
          <div 
            style={{ 
              fontSize: '28px',
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
            }}
          >
            🎯
          </div>
          <Text
            strong
            style={{
              fontSize: '22px',
              background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            BINGO PARTY
          </Text>
        </div>

        {/* Navigation Menu (Desktop) */}
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          marginLeft: '32px',
        }}>
          <div
            onClick={() => navigate('/lobby')}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              background: isActive('/lobby') ? 'rgba(255, 215, 0, 0.2)' : 'transparent',
              border: isActive('/lobby') ? '1px solid rgba(255, 215, 0, 0.5)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
            }}
          >
            <HomeOutlined style={{ color: isActive('/lobby') ? '#ffd700' : 'rgba(255,255,255,0.8)' }} />
            <Text style={{ color: isActive('/lobby') ? '#ffd700' : 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
              ล็อบบี้
            </Text>
          </div>
          <div
            onClick={() => navigate('/wallet')}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              background: isActive('/wallet') ? 'rgba(255, 215, 0, 0.2)' : 'transparent',
              border: isActive('/wallet') ? '1px solid rgba(255, 215, 0, 0.5)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
            }}
          >
            <WalletOutlined style={{ color: isActive('/wallet') ? '#ffd700' : 'rgba(255,255,255,0.8)' }} />
            <Text style={{ color: isActive('/wallet') ? '#ffd700' : 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
              กระเป๋าเงิน
            </Text>
          </div>
          {user?.role === 'admin' && (
            <div
              onClick={() => navigate('/admin')}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                background: isActive('/admin') ? 'rgba(255, 215, 0, 0.2)' : 'transparent',
                border: isActive('/admin') ? '1px solid rgba(255, 215, 0, 0.5)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
              }}
            >
              <SettingOutlined style={{ color: isActive('/admin') ? '#ffd700' : 'rgba(255,255,255,0.8)' }} />
              <Text style={{ color: isActive('/admin') ? '#ffd700' : 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                Admin
              </Text>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User Info & Menu */}
        <Space size="middle">
          {/* Balance Display */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 140, 0, 0.2) 100%)',
              padding: '8px 20px',
              borderRadius: '25px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)',
            }}
            onClick={() => navigate('/wallet')}
          >
            <CrownOutlined style={{ color: '#ffd700', fontSize: '18px' }} />
            <Text strong style={{ 
              color: '#ffd700', 
              fontSize: '16px',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
            }}>
              {balance?.toLocaleString() || '0'} ฿
            </Text>
          </div>

          {/* User Dropdown */}
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                src={user?.avatarUrl}
                icon={!user?.avatarUrl && <UserOutlined />}
                size={40}
                style={{ 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                  border: '2px solid rgba(255, 215, 0, 0.5)',
                  boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)',
                }}
              />
            </Space>
          </Dropdown>
        </Space>
      </Header>

      {/* Content */}
      <Content className="game-bg" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </Content>
    </AntLayout>
  );
}
