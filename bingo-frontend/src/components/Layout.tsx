import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Space, Typography, Badge } from 'antd';
import {
  HomeOutlined,
  WalletOutlined,
  UserOutlined,
  LogoutOutlined,
  DollarOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores';
import { useWalletStore } from '@/stores';

const { Header, Content } = AntLayout;
const { Text } = Typography;

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main Layout Component
 * - แสดง Header พร้อมข้อมูล User
 * - เมนูนำทาง
 * - ยอดเงิน
 */
export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
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

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        {/* Logo & Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/lobby')}
        >
          <div style={{ fontSize: '32px' }}>🎯</div>
          <Text
            strong
            style={{
              fontSize: '20px',
              color: '#fff',
              display: window.innerWidth < 768 ? 'none' : 'block',
            }}
          >
            Bingo Party
          </Text>
        </div>

        {/* Navigation Menu (Desktop) */}
        <Menu
          mode="horizontal"
          style={{
            flex: 1,
            marginLeft: '32px',
            background: 'transparent',
            border: 'none',
            display: window.innerWidth < 768 ? 'none' : 'flex',
          }}
          items={[
            {
              key: 'lobby',
              icon: <HomeOutlined />,
              label: 'ล็อบบี้',
              onClick: () => navigate('/lobby'),
              style: { color: '#fff' },
            },
            {
              key: 'wallet',
              icon: <WalletOutlined />,
              label: 'กระเป๋าเงิน',
              onClick: () => navigate('/wallet'),
              style: { color: '#fff' },
            },
          ]}
        />

        {/* User Info & Menu */}
        <Space size="large">
          {/* Balance Display */}
          <Badge count={0} showZero={false}>
            <div
              style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '6px 16px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/wallet')}
            >
              <DollarOutlined style={{ color: '#ffd700', fontSize: '18px' }} />
              <Text strong style={{ color: '#fff' }}>
                {balance?.toLocaleString() || '0'} ฿
              </Text>
            </div>
          </Badge>

          {/* User Dropdown */}
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                src={user?.avatarUrl}
                icon={!user?.avatarUrl && <UserOutlined />}
                style={{ background: '#fff', color: '#667eea' }}
              />
              <Text
                strong
                style={{
                  color: '#fff',
                  display: window.innerWidth < 768 ? 'none' : 'block',
                }}
              >
                {user?.displayName || 'ผู้เล่น'}
              </Text>
            </Space>
          </Dropdown>
        </Space>
      </Header>

      {/* Content */}
      <Content
        style={{
          background: '#f0f2f5',
          padding: window.innerWidth < 768 ? '16px' : '24px',
        }}
      >
        {children}
      </Content>
    </AntLayout>
  );
}
