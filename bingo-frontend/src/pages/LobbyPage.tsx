import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Button,
  Typography,
  Space,
  Badge,
  Empty,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  DollarOutlined,
  TrophyOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import Layout from '@/components/Layout';
import { useRoomStore } from '@/stores';
import { Room, DrawMode, BallSet, CreateRoomDto } from '@/types';

const { Title, Text, Paragraph } = Typography;

/**
 * Lobby Page - หน้าหลักหลัง Login
 * - แสดงรายการห้องบิงโก
 * - สร้างห้องใหม่
 * - เข้าร่วมห้อง
 */
export default function LobbyPage() {
  const navigate = useNavigate();
  const { rooms, isLoading, fetchRooms, createRoom } = useRoomStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm<CreateRoomDto>();

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Handle Create Room
  const handleCreateRoom = async (values: CreateRoomDto) => {
    try {
      const room = await createRoom(values);
      message.success('สร้างห้องสำเร็จ!');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      navigate(`/room/${room.id}`);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'ไม่สามารถสร้างห้องได้');
    }
  };

  // Handle Join Room
  const handleJoinRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Page Header */}
          <div className="slide-up" style={{ marginBottom: 32 }}>
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col>
                <Title level={2} style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 36 }}>🎯</span>
                  <span className="gradient-text">ล็อบบี้ห้องบิงโก</span>
                </Title>
                <Paragraph style={{ margin: '8px 0 0 0', color: 'rgba(255,255,255,0.65)' }}>
                  เลือกห้องที่ต้องการเข้าร่วม หรือสร้างห้องใหม่ของคุณเอง
                </Paragraph>
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<TrophyOutlined />}
                    onClick={() => navigate('/leaderboard')}
                    style={{
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      border: 'none',
                      color: '#000',
                      fontWeight: 600,
                    }}
                  >
                    Leaderboard
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchRooms()}
                    loading={isLoading}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                    }}
                  >
                    รีเฟรช
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-glow"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontWeight: 600,
                    }}
                  >
                    สร้างห้องใหม่
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={8}>
              <div className="stat-box slide-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 32, width: 48, height: 48, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlayCircleOutlined style={{ fontSize: 24, color: '#22c55e' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{rooms.filter((r) => r.isActive).length}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>ห้องที่เปิดอยู่</div>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="stat-box slide-up" style={{ animationDelay: '0.1s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 32, width: 48, height: 48, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserOutlined style={{ fontSize: 24, color: '#3b82f6' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{rooms.reduce((sum, r) => sum + r.currentPlayers, 0)}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>ผู้เล่นออนไลน์</div>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="stat-box slide-up" style={{ animationDelay: '0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 32, width: 48, height: 48, borderRadius: '50%', background: 'rgba(251, 191, 36, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrophyOutlined style={{ fontSize: 24, color: '#fbbf24' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#fbbf24' }}>฿{rooms.reduce((sum, r) => sum + r.totalPotCollected, 0).toLocaleString()}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>รางวัลรวม</div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Room List Header */}
          <div style={{ marginBottom: 20 }}>
            <Title level={4} style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CrownOutlined style={{ color: '#fbbf24' }} />
              ห้องที่เปิดให้บริการ
            </Title>
          </div>

          {/* Room List */}
          {isLoading && rooms.length === 0 ? (
            <div className="game-card" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <div style={{ color: 'rgba(255,255,255,0.6)' }}>กำลังโหลด...</div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="game-card" style={{ padding: 48, textAlign: 'center' }}>
              <Empty
                description={<span style={{ color: 'rgba(255,255,255,0.6)' }}>ยังไม่มีห้องเปิดให้บริการ</span>}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                  style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}
                >
                  สร้างห้องแรก
                </Button>
              </Empty>
            </div>
          ) : (
            <Row gutter={[20, 20]}>
              {rooms.map((room: Room, index: number) => (
                <Col xs={24} sm={12} lg={8} key={room.id}>
                  <div
                    className="room-card slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Room Header */}
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <Title level={5} style={{ margin: 0, color: '#fff', fontSize: 18 }}>
                          {room.name}
                        </Title>
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          <Badge
                            status={room.isActive ? 'success' : 'default'}
                            text={<span style={{ color: room.isActive ? '#22c55e' : 'rgba(255,255,255,0.4)', fontSize: 12 }}>{room.isActive ? 'เปิดให้บริการ' : 'ปิด'}</span>}
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                          borderRadius: 8,
                          padding: '6px 12px',
                          color: '#000',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        ฿{room.cardPrice}
                      </div>
                    </div>

                    {/* Room Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
                      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>
                          <UserOutlined /> ผู้เล่น
                        </div>
                        <div style={{ color: '#fff', fontWeight: 600 }}>
                          <span style={{ fontSize: 20, color: room.currentPlayers >= room.maxPlayers ? '#ef4444' : '#22c55e' }}>{room.currentPlayers}</span>
                          <span style={{ color: 'rgba(255,255,255,0.4)' }}>/{room.maxPlayers}</span>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>
                          <ThunderboltOutlined /> รอบ
                        </div>
                        <div style={{ color: '#fff', fontWeight: 600 }}>
                          <span style={{ fontSize: 20 }}>{room.currentRound}</span>
                          <span style={{ color: 'rgba(255,255,255,0.4)' }}>/{room.maxRounds}</span>
                        </div>
                      </div>
                    </div>

                    {/* Room Info Tags */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                        🎲 {room.ballSet === BallSet.BALL_75 ? '75 ลูก' : '90 ลูก'}
                      </span>
                      <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                        💰 ค่าธรรมเนียม {room.feePercentage || 5}%
                      </span>
                    </div>

                    {/* Join Button */}
                    <Button
                      type="primary"
                      block
                      size="large"
                      disabled={!room.isActive || room.currentPlayers >= room.maxPlayers}
                      onClick={() => handleJoinRoom(room.id)}
                      style={{
                        background: !room.isActive || room.currentPlayers >= room.maxPlayers
                          ? 'rgba(255,255,255,0.1)'
                          : 'linear-gradient(135deg, #22c55e, #15803d)',
                        border: 'none',
                        fontWeight: 600,
                        height: 48,
                        fontSize: 16,
                      }}
                    >
                      {!room.isActive
                        ? 'ห้องปิดแล้ว'
                        : room.currentPlayers >= room.maxPlayers
                          ? 'เต็มแล้ว'
                          : '🎮 เข้าร่วมเกม'}
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      <Modal
        title="🎯 สร้างห้องบิงโกใหม่"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateRoom}
          initialValues={{
            drawMode: DrawMode.auto,
            ballSet: BallSet.BALL_75,
            maxPlayers: 10,
            maxRounds: 5,
            cardPrice: 10,
            maxCardsPerPlayer: 4,

          }}
        >
          <Form.Item
            name="name"
            label="ชื่อห้อง"
            rules={[
              { required: true, message: 'กรุณากรอกชื่อห้อง' },
              { min: 3, message: 'ชื่อห้องต้องมีอย่างน้อย 3 ตัวอักษร' },
            ]}
          >
            <Input placeholder="เช่น: ห้องมือใหม่" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ballSet"
                label="จำนวนลูกบอล"
                rules={[{ required: true }]}
              >
                <Select size="large">
                  <Select.Option value={BallSet.BALL_75}>75 ลูก</Select.Option>
                  <Select.Option value={BallSet.BALL_90}>90 ลูก</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="drawMode" label="โหมดจับฉลาก" rules={[{ required: true }]}>
                <Select size="large">
                  <Select.Option value={DrawMode.auto}>อัตโนมัติ</Select.Option>
                  <Select.Option value={DrawMode.manual_rotate}>หมุนเอง</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxPlayers"
                label="ผู้เล่นสูงสุด"
                rules={[{ required: true }]}
              >
                <InputNumber min={2} max={50} size="large" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxRounds" label="จำนวนรอบ" rules={[{ required: true }]}>
                <InputNumber min={1} max={100} size="large" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cardPrice" label="ราคาการ์ด (฿)" rules={[{ required: true }]}>
                <InputNumber min={1} max={1000} size="large" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxCardsPerPlayer"
                label="การ์ดสูงสุด/คน"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={10} size="large" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsCreateModalOpen(false)}>ยกเลิก</Button>
              <Button type="primary" htmlType="submit">
                สร้างห้อง
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
