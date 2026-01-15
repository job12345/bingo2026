import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Row, Col, Space } from 'antd';
import {
  TrophyOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  RocketOutlined,
  GoogleOutlined,
  PlayCircleFilled,
  StarFilled,
  CrownFilled,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores';
import { AuthService } from '@/services';

const { Title, Paragraph } = Typography;

/**
 * หน้า Landing Page - แนะนำเกมบิงโก (Gaming Theme)
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [animatedBalls] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      number: Math.floor(Math.random() * 75) + 1,
      left: `${10 + Math.random() * 80}%`,
      top: `${10 + Math.random() * 80}%`,
      delay: Math.random() * 5,
      size: 40 + Math.random() * 40,
    }))
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/lobby');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: <ThunderboltOutlined style={{ fontSize: 48, color: '#fbbf24' }} />,
      title: 'เล่นง่าย รวดเร็ว',
      description: 'ระบบ Real-time สุดล้ำ เล่นได้ทันที ไม่ต้องรอ',
      color: '#fbbf24',
    },
    {
      icon: <TrophyOutlined style={{ fontSize: 48, color: '#22c55e' }} />,
      title: 'รางวัลใหญ่',
      description: 'ลุ้นรางวัลทุกรอบ ถอนเงินได้จริง 100%',
      color: '#22c55e',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 48, color: '#3b82f6' }} />,
      title: 'ปลอดภัย มั่นคง',
      description: 'ระบบรักษาความปลอดภัยระดับ Enterprise',
      color: '#3b82f6',
    },
    {
      icon: <RocketOutlined style={{ fontSize: 48, color: '#ec4899' }} />,
      title: 'สนุกไม่มีที่สิ้นสุด',
      description: 'ห้องเกมหลากหลาย เล่นได้ 24 ชั่วโมง',
      color: '#ec4899',
    },
  ];

  const handleGoogleLogin = () => {
    AuthService.loginWithGoogle();
  };

  return (
    <div className="game-bg" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Animated Bingo Balls */}
      {animatedBalls.map((ball) => (
        <div
          key={ball.id}
          className="floating-ball"
          style={{
            position: 'absolute',
            left: ball.left,
            top: ball.top,
            width: ball.size,
            height: ball.size,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: ball.size * 0.35,
            opacity: 0.15,
            animation: `float 6s ease-in-out infinite`,
            animationDelay: `${ball.delay}s`,
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
          }}
        >
          {ball.number}
        </div>
      ))}

      {/* Floating Decorations */}
      <div style={{ position: 'absolute', top: '8%', left: '5%', fontSize: '80px', opacity: 0.08 }} className="floating-ball">
        🎯
      </div>
      <div style={{ position: 'absolute', bottom: '15%', right: '8%', fontSize: '100px', opacity: 0.08 }} className="floating-ball">
        🏆
      </div>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '60px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <div className="slide-up">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(168, 85, 247, 0.2)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                borderRadius: 50,
                padding: '10px 28px',
                marginBottom: 32,
              }}
            >
              <StarFilled style={{ color: '#fbbf24' }} />
              <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>เกมบิงโกออนไลน์อันดับ 1 ของไทย</span>
              <StarFilled style={{ color: '#fbbf24' }} />
            </div>
          </div>

          <Title
            level={1}
            className="slide-up"
            style={{
              fontSize: 'clamp(42px, 10vw, 90px)',
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.1,
              color: '#fff',
              textShadow: '0 4px 30px rgba(0,0,0,0.3)',
            }}
          >
            <span className="gradient-text">BINGO PARTY</span>
            <br />
            <span style={{ 
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>ENTERPRISE</span>
          </Title>

          <Paragraph
            className="slide-up"
            style={{
              fontSize: 'clamp(18px, 3vw, 26px)',
              color: 'rgba(255,255,255,0.85)',
              margin: '28px auto 44px',
              maxWidth: 650,
              lineHeight: 1.6,
            }}
          >
            🎯 บิงโกออนไลน์แบบ Real-time พร้อมรางวัลจริง!
            <br />
            <span style={{ color: 'rgba(255,255,255,0.65)' }}>เล่นง่าย ถอนไว ปลอดภัย 100%</span>
          </Paragraph>

          {/* CTA Buttons */}
          <Space size="large" wrap className="slide-up" style={{ justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
              className="btn-glow"
              style={{
                height: 64,
                paddingLeft: 48,
                paddingRight: 48,
                fontSize: 18,
                fontWeight: 700,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 10px 50px rgba(102, 126, 234, 0.5)',
              }}
            >
              เข้าสู่ระบบด้วย Google
            </Button>
            <Button
              size="large"
              icon={<PlayCircleFilled />}
              style={{
                height: 64,
                paddingLeft: 48,
                paddingRight: 48,
                fontSize: 18,
                fontWeight: 600,
                borderRadius: 20,
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.25)',
                color: '#fff',
              }}
            >
              ดูวิธีเล่น
            </Button>
          </Space>

          {/* Trust Indicators */}
          <div className="slide-up" style={{ marginTop: 56 }}>
            <Row gutter={[24, 16]} justify="center">
              <Col>
                <div className="stat-box" style={{ padding: '16px 32px', minWidth: 140 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#fbbf24' }}>10K+</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>ผู้เล่นออนไลน์</div>
                </div>
              </Col>
              <Col>
                <div className="stat-box" style={{ padding: '16px 32px', minWidth: 140 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#22c55e' }}>฿5M+</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>แจกรางวัลแล้ว</div>
                </div>
              </Col>
              <Col>
                <div className="stat-box" style={{ padding: '16px 32px', minWidth: 140 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#3b82f6' }}>24/7</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>เปิดบริการ</div>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Title level={2} style={{ color: '#fff', margin: 0, fontSize: 36 }}>
              <CrownFilled style={{ color: '#fbbf24', marginRight: 16 }} />
              ทำไมต้องเล่นกับเรา?
            </Title>
          </div>

          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <div
                  className="game-card slide-up"
                  style={{
                    height: '100%',
                    textAlign: 'center',
                    padding: 32,
                    cursor: 'default',
                  }}
                >
                  <div
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: '50%',
                      background: `${feature.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                      border: `2px solid ${feature.color}30`,
                      boxShadow: `0 0 30px ${feature.color}20`,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <Title level={4} style={{ color: '#fff', marginBottom: 12, fontSize: 20 }}>
                    {feature.title}
                  </Title>
                  <Paragraph style={{ color: 'rgba(255,255,255,0.65)', margin: 0, fontSize: 15 }}>
                    {feature.description}
                  </Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* How to Play Section */}
        <div
          className="game-card"
          style={{
            textAlign: 'center',
            padding: '56px 32px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(168, 85, 247, 0.15))',
            marginBottom: 60,
          }}
        >
          <Title level={2} style={{ color: '#fff', marginBottom: 40, fontSize: 32 }}>
            🎮 วิธีเล่นง่ายๆ 3 ขั้นตอน
          </Title>

          <Row gutter={[48, 32]}>
            {[
              { step: 1, gradient: 'linear-gradient(135deg, #667eea, #764ba2)', title: 'สมัคร & เติมเงิน', desc: 'ล็อกอินด้วย Google แล้วเติม Point เข้าบัญชี' },
              { step: 2, gradient: 'linear-gradient(135deg, #22c55e, #10b981)', title: 'เลือกห้อง & ซื้อการ์ด', desc: 'เลือกห้องที่ต้องการ แล้วซื้อการ์ดบิงโก' },
              { step: 3, gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)', title: 'กดบิงโก & รับรางวัล!', desc: 'ลุ้นเลขที่ออก แล้วกดบิงโกเพื่อรับรางวัล!' },
            ].map((item) => (
              <Col xs={24} md={8} key={item.step}>
                <div
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    background: item.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: 28,
                    fontWeight: 800,
                    color: item.step === 3 ? '#000' : '#fff',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                  }}
                >
                  {item.step}
                </div>
                <Title level={4} style={{ color: '#fff', marginBottom: 8 }}>
                  {item.title}
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.65)', margin: 0 }}>
                  {item.desc}
                </Paragraph>
              </Col>
            ))}
          </Row>

          <Button
            type="primary"
            size="large"
            icon={<GoogleOutlined />}
            onClick={handleGoogleLogin}
            className="btn-glow"
            style={{
              marginTop: 44,
              height: 60,
              paddingLeft: 56,
              paddingRight: 56,
              fontSize: 18,
              fontWeight: 700,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            เริ่มเล่นเลย! 🚀
          </Button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Paragraph style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: 14 }}>
            © 2026 Bingo Party Enterprise. All rights reserved.
            <br />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>พัฒนาด้วย ❤️ สำหรับผู้เล่นที่รักในเกม</span>
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
