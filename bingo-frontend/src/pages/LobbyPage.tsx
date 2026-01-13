import { useEffect } from 'react';
import { Layout, Typography, Row, Col, Card, Statistic, Button, Space } from 'antd';
import { PlusOutlined, WalletOutlined, UserOutlined, TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useRoomStore, useWalletStore } from '@/stores';
import { formatCurrency } from '@/utils';

const { Header, Content } = Layout;
const { Title } = Typography;

/**
 * หน้า Lobby (ดูรายการห้อง)
 */
export default function LobbyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { rooms, fetchRooms, isLoading } = useRoomStore();
  const { balance, fetchBalance } = useWalletStore();

  useEffect(() => {
    fetchRooms(true); // ดูห้องที่ Active เท่านั้น
    fetchBalance();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Title level={3} style={{ margin: 0, color: '#667eea' }}>
          🎯 Bingo Party
        </Title>

        <Space size="large">
          {/* Balance */}
          <Statistic
            title="ยอดเงิน"
            value={balance}
            suffix="บาท"
            valueStyle={{ color: '#3f8600', fontSize: 20 }}
          />

          {/* Buttons */}
          <Button icon={<WalletOutlined />} onClick={() => navigate('/wallet')}>
            กระเป๋าเงิน
          </Button>
          <Button icon={<UserOutlined />} onClick={() => navigate('/profile')}>
            โปรไฟล์
          </Button>
          <Button onClick={logout}>ออกจากระบบ</Button>
        </Space>
      </Header>

      {/* Content */}
      <Content style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Welcome Section */}
          <Card>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="ยินดีต้อนรับ" value={user?.displayName || 'Guest'} />
              </Col>
              <Col span={12}>
                <Statistic
                  title="ห้องที่เปิดอยู่"
                  value={rooms.length}
                  suffix="ห้อง"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Rooms Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Title level={4}>รายการห้อง</Title>
              <Button type="primary" icon={<PlusOutlined />}>
                สร้างห้องใหม่
              </Button>
            </div>

            <Row gutter={[16, 16]}>
              {rooms.length === 0 ? (
                <Col span={24}>
                  <Card style={{ textAlign: 'center', padding: 40 }}>
                    <TrophyOutlined style={{ fontSize: 48, color: '#ccc' }} />
                    <Title level={4} style={{ marginTop: 16 }}>
                      ยังไม่มีห้องเปิดอยู่
                    </Title>
                    <p>สร้างห้องใหม่เพื่อเริ่มเล่นกันเลย!</p>
                  </Card>
                </Col>
              ) : (
                rooms.map((room) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={room.id}>
                    <Card
                      hoverable
                      onClick={() => navigate(`/room/${room.id}`)}
                      style={{ borderRadius: 12 }}
                    >
                      <Title level={5} ellipsis>
                        {room.name}
                      </Title>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <strong>ผู้เล่น:</strong> {room.currentPlayers}/{room.maxPlayers}
                        </div>
                        <div>
                          <strong>ราคาการ์ด:</strong> {formatCurrency(room.cardPrice)}
                        </div>
                        <div>
                          <strong>รอบที่:</strong> {room.currentRound}/{room.maxRounds}
                        </div>
                        <div>
                          <strong>โหมด:</strong> {room.drawMode === 'auto' ? 'Auto' : 'Manual Rotate'}
                        </div>
                      </Space>
                      <Button type="primary" block style={{ marginTop: 16 }}>
                        เข้าร่วม
                      </Button>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          </div>
        </Space>
      </Content>
    </Layout>
  );
}
