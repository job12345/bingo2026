import { Layout, Typography, Card } from 'antd';

const { Content } = Layout;
const { Title } = Typography;

/**
 * หน้า Admin Dashboard
 */
export default function AdminPage() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Card>
          <Title level={3}>Admin Dashboard</Title>
          <p>TODO: สร้าง Admin UI (อนุมัติธุรกรรม, ดูรายงาน, จัดการผู้ใช้, Bot Control)</p>
        </Card>
      </Content>
    </Layout>
  );
}
