import { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Card,
  Tabs,
  Table,
  Button,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  message,
  Modal,
  Badge,
  Input,
  Form,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DollarOutlined,
  UserOutlined,
  PlayCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  SettingOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/services/api';

const { Title, Text } = Typography;

interface DepositRequest {
  id: string;
  userId: string;
  method: string;
  requestedAmount: string;
  actualAmount: string;
  status: string;
  createdAt: string;
}

interface FraudAlert {
  id: string;
  userId: string;
  type: string;
  severity: number;
  description: string;
  status: string;
  createdAt: string;
}

interface RoomInfo {
  id: string;
  name: string;
  currentPlayers: number;
  maxPlayers: number;
  isActive: boolean;
}

interface SystemSetting {
  key: string;
  value: any;
  description: string;
  updatedAt: string;
}

/**
 * Admin Dashboard - สำหรับจัดการระบบ
 */
export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [pendingDeposits, setPendingDeposits] = useState<DepositRequest[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [activeRooms, setActiveRooms] = useState<RoomInfo[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    pendingDeposits: 0,
    fraudAlerts: 0,
    activeRooms: 0,
  });

  const [settingsForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch pending deposits
      const depositsRes = await apiClient.get<DepositRequest[]>('/deposit/pending');
      setPendingDeposits(depositsRes || []);

      // Fetch fraud alerts
      const fraudRes = await apiClient.get<FraudAlert[]>('/fraud/pending');
      setFraudAlerts(fraudRes || []);

      // Fetch active rooms
      const roomsRes = await apiClient.get<RoomInfo[]>('/rooms');
      setActiveRooms(roomsRes || []);

      // Fetch settings
      try {
        const settingsRes = await apiClient.get<SystemSetting[]>('/settings');
        setSettings(settingsRes || []);
      } catch (err) {
        console.warn('Failed to fetch settings', err);
      }

      // Calculate stats
      setStats({
        totalDeposits: (depositsRes || []).length + 100, // Mock total
        pendingDeposits: (depositsRes || []).filter((d: DepositRequest) => d.status === 'pending').length,
        fraudAlerts: (fraudRes || []).length,
        activeRooms: (roomsRes || []).filter((r: RoomInfo) => r.isActive).length,
      });
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveDeposit = async (id: string) => {
    try {
      await apiClient.post(`/deposit/${id}/approve`);
      message.success('อนุมัติสำเร็จ!');
      fetchData();
    } catch (error) {
      message.error('ไม่สามารถอนุมัติได้');
    }
  };

  const handleRejectDeposit = async (id: string) => {
    Modal.confirm({
      title: 'ยืนยันการปฏิเสธ?',
      onOk: async () => {
        try {
          await apiClient.post(`/deposit/${id}/reject`, { reason: 'Admin rejected' });
          message.success('ปฏิเสธสำเร็จ!');
          fetchData();
        } catch (error) {
          message.error('ไม่สามารถปฏิเสธได้');
        }
      },
    });
  };

  const handleReviewFraud = async (id: string, status: string) => {
    try {
      await apiClient.post(`/fraud/${id}/review`, { status, notes: 'Admin reviewed' });
      message.success('บันทึกสำเร็จ!');
      fetchData();
    } catch (error) {
      message.error('ไม่สามารถบันทึกได้');
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      await apiClient.put('/settings', { key, value: Number(value) }); // Assuming numeric values for now (percent, amounts)
      message.success('อัพเดทตั้งค่าสำเร็จ!');
      fetchData();
    } catch (error) {
      message.error('ไม่สามารถอัพเดทค่าได้');
    }
  };

  const depositColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', render: (id: string) => id.slice(0, 8) },
    { title: 'Method', dataIndex: 'method', key: 'method', render: (m: string) => m.replace('_', ' ').toUpperCase() },
    { title: 'Amount', dataIndex: 'requestedAmount', key: 'amount', render: (a: string) => `฿${parseFloat(a).toFixed(2)}` },
    { title: 'Actual', dataIndex: 'actualAmount', key: 'actual', render: (a: string) => `฿${parseFloat(a).toFixed(2)}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'pending' ? 'orange' : 'green'}>{s}</Tag> },
    { title: 'Date', dataIndex: 'createdAt', key: 'date', render: (d: string) => new Date(d).toLocaleString('th-TH') },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DepositRequest) => (
        <Space>
          <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleApproveDeposit(record.id)}>
            อนุมัติ
          </Button>
          <Button danger size="small" icon={<CloseOutlined />} onClick={() => handleRejectDeposit(record.id)}>
            ปฏิเสธ
          </Button>
        </Space>
      ),
    },
  ];

  const fraudColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', render: (id: string) => id.slice(0, 8) },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t: string) => t.replace(/_/g, ' ').toUpperCase() },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (s: number) => {
        const colors = ['', 'gray', 'green', 'gold', 'orange', 'red'];
        return <Tag color={colors[s]}>{s}/5</Tag>;
      },
    },
    { title: 'Description', dataIndex: 'description', key: 'desc', ellipsis: true },
    { title: 'Date', dataIndex: 'createdAt', key: 'date', render: (d: string) => new Date(d).toLocaleString('th-TH') },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FraudAlert) => (
        <Space>
          <Button size="small" onClick={() => handleReviewFraud(record.id, 'confirmed')}>
            ยืนยัน
          </Button>
          <Button size="small" onClick={() => handleReviewFraud(record.id, 'dismissed')}>
            ยกเลิก
          </Button>
        </Space>
      ),
    },
  ];

  const roomColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Players', key: 'players', render: (_: any, r: RoomInfo) => `${r.currentPlayers}/${r.maxPlayers}` },
    { title: 'Status', dataIndex: 'isActive', key: 'status', render: (a: boolean) => <Tag color={a ? 'green' : 'red'}>{a ? 'Active' : 'Inactive'}</Tag> },
  ];

  const settingsColumns = [
    { title: 'Key', dataIndex: 'key', key: 'key', render: (k: string) => <Tag>{k}</Tag> },
    { title: 'Description', dataIndex: 'description', key: 'desc' },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (val: any, record: SystemSetting) => (
        <Space>
          <Input
            defaultValue={val}
            style={{ width: 120 }}
            onBlur={(e) => {
              if (e.target.value !== String(val)) {
                handleUpdateSetting(record.key, e.target.value);
              }
            }}
            onPressEnter={(e: any) => handleUpdateSetting(record.key, e.target.value)}
          />
          <Text type="secondary">(Click out/Enter to save)</Text>
        </Space>
      )
    },
    { title: 'Last Updated', dataIndex: 'updatedAt', key: 'updatedAt', render: (d: string) => new Date(d).toLocaleString('th-TH') },
  ];

  const tabItems = [
    {
      key: 'deposits',
      label: (
        <Badge count={stats.pendingDeposits} offset={[10, 0]}>
          <span>💰 รายการฝากเงิน</span>
        </Badge>
      ),
      children: (
        <Table
          columns={depositColumns}
          dataSource={pendingDeposits}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'fraud',
      label: (
        <Badge count={stats.fraudAlerts} offset={[10, 0]}>
          <span>🔍 Fraud Alerts</span>
        </Badge>
      ),
      children: (
        <Table
          columns={fraudColumns}
          dataSource={fraudAlerts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'rooms',
      label: <span>🎮 ห้องเกม ({stats.activeRooms})</span>,
      children: (
        <Table
          columns={roomColumns}
          dataSource={activeRooms}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'settings',
      label: <span>⚙️ ตั้งค่าระบบ</span>,
      children: (
        <Card title="ตั้งค่าระบบ (Global Configuration)">
          <Table
            columns={settingsColumns}
            dataSource={settings}
            rowKey="key"
            loading={loading}
            pagination={false}
          />
        </Card>
      ),
    },
  ];

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ margin: 0, color: '#fff' }}>
              🛠️ Admin Dashboard
            </Title>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
              Refresh
            </Button>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Pending Deposits"
                value={stats.pendingDeposits}
                prefix={<DollarOutlined />}
                valueStyle={{ color: stats.pendingDeposits > 0 ? '#faad14' : '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Fraud Alerts"
                value={stats.fraudAlerts}
                prefix={<WarningOutlined />}
                valueStyle={{ color: stats.fraudAlerts > 0 ? '#ff4d4f' : '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Active Rooms"
                value={stats.activeRooms}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Rooms"
                value={activeRooms.length}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Card>
          <Tabs items={tabItems} />
        </Card>
      </div>
    </Layout>
  );
}
