import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Typography, Space } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores';
import { AuthService } from '@/services';

const { Title, Paragraph } = Typography;

/**
 * หน้า Login (Google OAuth)
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // ถ้า Login แล้ว → Redirect ไป Lobby
    if (isAuthenticated) {
      navigate('/lobby');
      return;
    }

    // รับ Token จาก URL (หลัง Google OAuth Callback)
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      AuthService.saveTokens(accessToken, refreshToken);
      navigate('/lobby');
    }
  }, [isAuthenticated, searchParams, navigate]);

  /**
   * เริ่ม Google OAuth Login
   */
  const handleGoogleLogin = () => {
    AuthService.loginWithGoogle();
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          textAlign: 'center',
          borderRadius: 16,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Logo / Title */}
          <div>
            <Title level={1} style={{ marginBottom: 0, color: '#667eea' }}>
              🎯 Bingo Party
            </Title>
            <Paragraph type="secondary">เกมบิงโกออนไลน์ที่สนุกและหาเงินได้จริง</Paragraph>
          </div>

          {/* Login Button */}
          <Button
            type="primary"
            size="large"
            icon={<GoogleOutlined />}
            onClick={handleGoogleLogin}
            style={{ width: '100%', height: 48 }}
          >
            เข้าสู่ระบบด้วย Google
          </Button>

          {/* Features */}
          <div style={{ textAlign: 'left' }}>
            <Paragraph>
              <strong>คุณสมบัติ:</strong>
            </Paragraph>
            <ul style={{ paddingLeft: 20 }}>
              <li>เล่นบิงโกแบบ Real-time</li>
              <li>ระบบ Point แลกเป็นเงินจริง</li>
              <li>ปลอดภัย โปร่งใส ตรวจสอบได้</li>
              <li>เล่นง่าย สนุก ได้เงินจริง</li>
            </ul>
          </div>

          {/* Terms */}
          <Paragraph type="secondary" style={{ fontSize: 12 }}>
            การเข้าสู่ระบบแสดงว่าคุณยอมรับ <a href="/terms">ข้อกำหนดการใช้งาน</a>
          </Paragraph>
        </Space>
      </Card>
    </div>
  );
}
