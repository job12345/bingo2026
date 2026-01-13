import { Layout, Typography, Card, Avatar, Descriptions, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { formatDate } from '@/utils';

const { Header, Content } = Layout;
const { Title } = Typography;

/**
 * หน้าโปรไฟล์ผู้ใช้
 */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user) return null;

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
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          โปรไฟล์
        </Title>
        <Button onClick={() => navigate('/lobby')}>กลับไปหน้าหลัก</Button>
      </Header>

      {/* Content */}
      <Content style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Avatar size={100} src={user.avatarUrl} icon={<UserOutlined />} />
            <Title level={4} style={{ marginTop: 16 }}>
              {user.displayName}
            </Title>
          </div>

          <Descriptions bordered column={1}>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="บทบาท">{user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้เล่น'}</Descriptions.Item>
            <Descriptions.Item label="ยอดเงิน">{user.pointBalance} บาท</Descriptions.Item>
            <Descriptions.Item label="เล่นไปแล้ว">{user.totalGamesPlayed} เกม</Descriptions.Item>
            <Descriptions.Item label="ชนะ">{user.totalWins} ครั้ง</Descriptions.Item>
            <Descriptions.Item label="Win Rate">
              {user.totalGamesPlayed > 0
                ? ((user.totalWins / user.totalGamesPlayed) * 100).toFixed(2)
                : 0}
              %
            </Descriptions.Item>
            <Descriptions.Item label="สมัครเมื่อ">{formatDate(user.createdAt)}</Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: 24 }}>
            <Button type="primary" style={{ marginRight: 8 }}>
              แก้ไขโปรไฟล์
            </Button>
            <Button>เปลี่ยนข้อมูลธนาคาร</Button>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}
