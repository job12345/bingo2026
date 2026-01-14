import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Space, Row, Col, Card } from 'antd';
import {
  TrophyOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  RocketOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores';

const { Title, Paragraph } = Typography;

/**
 * หน้า Landing Page - แนะนำเกมบิงโก
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // ถ้า Login แล้ว → Redirect ไป Lobby
    if (isAuthenticated) {
      navigate('/lobby');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: <ThunderboltOutlined style={{ fontSize: 40, color: '#faad14' }} />,
      title: 'เล่นง่าย รวดเร็ว',
      description: 'ระบบ Real-time เล่นได้ทันที ไม่ต้องรอ',
    },
    {
      icon: <TrophyOutlined style={{ fontSize: 40, color: '#52c41a' }} />,
      title: 'รางวัลจริง',
      description: 'ลุ้นรางวัลทุกรอบ ถอนเงินได้จริง',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 40, color: '#1890ff' }} />,
      title: 'ปลอดภัย มั่นคง',
      description: 'ระบบรักษาความปลอดภัยระดับสูง',
    },
    {
      icon: <RocketOutlined style={{ fontSize: 40, color: '#eb2f96' }} />,
      title: 'สนุกไม่รู้จบ',
      description: 'ห้องเกมหลากหลาย เล่นได้ทั้งวัน',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Background Pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Bingo Ball Decorations */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          fontSize: '80px',
          opacity: 0.15,
          animation: 'float 6s ease-in-out infinite',
        }}
      >
        🎯
      </div>
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          fontSize: '60px',
          opacity: 0.15,
          animation: 'float 7s ease-in-out infinite 1s',
        }}
      >
        🎰
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '8%',
          fontSize: '70px',
          opacity: 0.15,
          animation: 'float 8s ease-in-out infinite 2s',
        }}
      >
        🎲
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '25%',
          right: '5%',
          fontSize: '90px',
          opacity: 0.15,
          animation: 'float 9s ease-in-out infinite 1.5s',
        }}
      >
        🏆
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
      `}</style>

      {/* Main Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '40px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ fontSize: '120px', marginBottom: '20px' }}>🎯</div>
          <Title
            level={1}
            style={{
              fontSize: '56px',
              margin: '0 0 16px 0',
              color: '#fff',
              textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            Bingo Party Enterprise
          </Title>
          <Paragraph
            style={{
              fontSize: '24px',
              color: '#fff',
              marginBottom: '32px',
              textShadow: '1px 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            เกมบิงโกออนไลน์ แบบ Real-time 🎰 สนุก เร้าใจ ลุ้นรางวัลได้จริง!
          </Paragraph>
          <Space size="large">
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={() => navigate('/login')}
              style={{
                height: '56px',
                fontSize: '18px',
                padding: '0 40px',
                borderRadius: '28px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}
            >
              เริ่มเล่นเลย
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/login')}
              style={{
                height: '56px',
                fontSize: '18px',
                padding: '0 40px',
                borderRadius: '28px',
                background: 'rgba(255,255,255,0.9)',
                border: 'none',
                color: '#667eea',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}
            >
              เข้าสู่ระบบ
            </Button>
          </Space>
        </div>

        {/* Bingo Card Preview */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Card
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <Title level={3} style={{ marginBottom: '16px', color: '#667eea' }}>
              🎲 ตัวอย่างกระดานบิงโก
            </Title>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px',
                width: '300px',
              }}
            >
              {/* Bingo Header */}
              {['B', 'I', 'N', 'G', 'O'].map((letter) => (
                <div
                  key={letter}
                  style={{
                    background: '#667eea',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '20px',
                  }}
                >
                  {letter}
                </div>
              ))}

              {/* Sample Numbers */}
              {[
                [7, 23, 35, 52, 68],
                [12, 19, 41, 58, 70],
                [3, 28, '⭐', 47, 63],
                [15, 21, 38, 60, 75],
                [9, 30, 44, 56, 72],
              ].flat().map((num, i) => (
                <div
                  key={i}
                  style={{
                    background: num === '⭐' ? '#faad14' : '#f0f0f0',
                    color: num === '⭐' ? '#fff' : '#333',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: num === '⭐' ? 'bold' : 'normal',
                    fontSize: num === '⭐' ? '24px' : '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {num}
                </div>
              ))}
            </div>
            <Paragraph
              type="secondary"
              style={{ marginTop: '16px', marginBottom: 0 }}
            >
              เลือกตัวเลขที่ถูกออก ครบแถว ครบแนวทแยง หรือ Full House ก่อน ชนะ! 🏆
            </Paragraph>
          </Card>
        </div>

        {/* Features Section */}
        <div style={{ marginBottom: '40px' }}>
          <Title
            level={2}
            style={{
              textAlign: 'center',
              color: '#fff',
              marginBottom: '40px',
              textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            ทำไมต้อง Bingo Party?
          </Title>
          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: '16px',
                    textAlign: 'center',
                    height: '100%',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    transition: 'transform 0.3s ease',
                  }}
                  hoverable
                  bodyStyle={{ padding: '32px 24px' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>{feature.icon}</div>
                  <Title level={4} style={{ marginBottom: '8px' }}>
                    {feature.title}
                  </Title>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Footer CTA */}
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Title level={3} style={{ color: '#fff', marginBottom: '16px' }}>
            พร้อมเริ่มเล่นแล้วหรือยัง?
          </Title>
          <Paragraph style={{ color: '#fff', fontSize: '16px', marginBottom: '24px' }}>
            สมัครสมาชิกวันนี้ รับโบนัสต้อนรับ 🎁
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={() => navigate('/login')}
            style={{
              height: '56px',
              fontSize: '18px',
              padding: '0 48px',
              borderRadius: '28px',
              background: '#fff',
              border: 'none',
              color: '#667eea',
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            สมัครสมาชิกฟรี
          </Button>
        </div>
      </div>
    </div>
  );
}
