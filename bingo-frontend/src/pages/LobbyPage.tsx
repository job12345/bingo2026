import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
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
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  DollarOutlined,
  TrophyOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
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
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div
          style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                🎯 ล็อบบี้ห้องบิงโก
              </Title>
              <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
                เลือกห้องที่ต้องการเข้าร่วม หรือสร้างห้องใหม่ของคุณเอง
              </Paragraph>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchRooms()}
                  loading={isLoading}
                >
                  รีเฟรช
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  สร้างห้องใหม่
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="ห้องที่เปิดอยู่"
                value={rooms.filter((r) => r.isActive).length}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="ผู้เล่นออนไลน์"
                value={rooms.reduce((sum, r) => sum + r.currentPlayers, 0)}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="รางวัลรวม"
                value={rooms.reduce((sum, r) => sum + r.totalPotCollected, 0)}
                prefix={<TrophyOutlined />}
                suffix="฿"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Room List */}
        <Title level={4} style={{ marginBottom: '16px' }}>
          ห้องที่เปิดให้บริการ
        </Title>

        {isLoading && rooms.length === 0 ? (
          <Card loading={true} />
        ) : rooms.length === 0 ? (
          <Card>
            <Empty
              description="ยังไม่มีห้องเปิดให้บริการ"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
                สร้างห้องแรก
              </Button>
            </Empty>
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {rooms.map((room: Room) => (
              <Col xs={24} sm={12} lg={8} key={room.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: room.isActive ? '2px solid #52c41a' : '1px solid #d9d9d9',
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  {/* Room Header */}
                  <div style={{ marginBottom: '12px' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Title level={5} style={{ margin: 0 }}>
                        {room.name}
                      </Title>
                      <Badge
                        status={room.isActive ? 'success' : 'default'}
                        text={room.isActive ? 'เปิด' : 'ปิด'}
                      />
                    </Space>
                  </div>

                  {/* Room Info */}
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">
                        <UserOutlined /> ผู้เล่น
                      </Text>
                      <Text strong>
                        {room.currentPlayers}/{room.maxPlayers}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">
                        <DollarOutlined /> ราคาการ์ด
                      </Text>
                      <Text strong>{room.cardPrice} ฿</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">🎲 ลูกบอล</Text>
                      <Text>{room.ballSet === BallSet.BALL_75 ? '75 ลูก' : '90 ลูก'}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">🎮 รอบ</Text>
                      <Text>
                        {room.currentRound}/{room.maxRounds}
                      </Text>
                    </div>
                  </Space>

                  {/* Join Button */}
                  <Button
                    type="primary"
                    block
                    style={{ marginTop: '16px' }}
                    disabled={!room.isActive || room.currentPlayers >= room.maxPlayers}
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    {!room.isActive
                      ? 'ห้องปิดแล้ว'
                      : room.currentPlayers >= room.maxPlayers
                      ? 'เต็มแล้ว'
                      : 'เข้าร่วม'}
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        )}
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
            drawMode: DrawMode.AUTO,
            ballSet: BallSet.BALL_75,
            maxPlayers: 10,
            maxRounds: 5,
            cardPrice: 10,
            maxCardsPerPlayer: 4,
            feePercentage: 5,
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
                  <Select.Option value={DrawMode.AUTO}>อัตโนมัติ</Select.Option>
                  <Select.Option value={DrawMode.MANUAL_ROTATE}>หมุนเอง</Select.Option>
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

          <Form.Item
            name="feePercentage"
            label="ค่าธรรมเนียม (%)"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              max={20}
              size="large"
              style={{ width: '100%' }}
              addonAfter="%"
            />
          </Form.Item>

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
