import { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Button,
  Tabs,
  InputNumber,
  Form,
  Table,
  Tag,
  message,
  Spin,
  Empty,
} from 'antd';
import {
  WalletOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  HistoryOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/services/api';

const { Title, Text } = Typography;

interface Transaction {
  id: string;
  type: string;
  amount: number | string;
  status: string;
  createdAt: string;
  notes?: string;
}

/**
 * Wallet Page - Clean and Simple Version
 */
export default function WalletPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [depositForm] = Form.useForm();
  const [withdrawForm] = Form.useForm();

  // Load transactions only
  const loadTransactions = useCallback(async () => {
    try {
      const response = await apiClient.get<any>('/wallet/transactions');
      const list = response?.transactions || response?.data || response?.items || [];
      setTransactions(Array.isArray(list) ? list : []);
    } catch (error: any) {
      console.error('Failed to load transactions:', error);
      // Silent fail - just show empty list
      setTransactions([]);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await loadTransactions();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loadTransactions]);

  // Handle Deposit
  const handleDeposit = async (values: { amount: number }) => {
    try {
      setActionLoading(true);
      await apiClient.post('/wallet/deposit', {
        amount: values.amount,
        method: 'promptpay',
      });
      message.success('สร้างคำขอฝากเงินสำเร็จ!');
      depositForm.resetFields();
      await loadTransactions();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'ไม่สามารถฝากเงินได้');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Withdraw
  const handleWithdraw = async (values: { amount: number }) => {
    try {
      setActionLoading(true);
      await apiClient.post('/wallet/withdraw', {
        amount: values.amount,
      });
      message.success('สร้างคำขอถอนเงินสำเร็จ!');
      withdrawForm.resetFields();
      await loadTransactions();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'ไม่สามารถถอนเงินได้');
    } finally {
      setActionLoading(false);
    }
  };

  // Refresh handler
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await loadTransactions();
    } finally {
      setLoading(false);
    }
  };

  // Transaction columns
  const columns = [
    {
      title: 'วันที่',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => {
        try {
          return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        } catch {
          return '-';
        }
      },
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const config: Record<string, { color: string; label: string }> = {
          deposit: { color: 'green', label: 'ฝากเงิน' },
          withdraw: { color: 'red', label: 'ถอนเงิน' },
          win: { color: 'gold', label: 'ชนะเกม' },
          bet: { color: 'blue', label: 'เดิมพัน' },
        };
        const { color, label } = config[type] || { color: 'default', label: type };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'จำนวน',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number | string, record: Transaction) => {
        const num = Number(amount) || 0;
        const isPositive = ['deposit', 'win'].includes(record.type);
        return (
          <Text style={{ color: isPositive ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
            {isPositive ? '+' : '-'}฿{Math.abs(num).toLocaleString()}
          </Text>
        );
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: Record<string, { color: string; label: string }> = {
          completed: { color: 'success', label: 'สำเร็จ' },
          pending: { color: 'warning', label: 'รอดำเนินการ' },
          cancelled: { color: 'error', label: 'ยกเลิก' },
          failed: { color: 'error', label: 'ล้มเหลว' },
        };
        const { color, label } = config[status] || { color: 'default', label: status };
        return <Tag color={color}>{label}</Tag>;
      },
    },
  ];

  const tabItems = [
    {
      key: 'deposit',
      label: (
        <span>
          <PlusCircleOutlined /> ฝากเงิน
        </span>
      ),
      children: (
        <Card className="game-card" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
          <Title level={4} style={{ color: '#22c55e', marginBottom: 24 }}>
            💳 ฝากเงินเข้ากระเป๋า
          </Title>
          <Form form={depositForm} layout="vertical" onFinish={handleDeposit}>
            <Form.Item
              name="amount"
              label={<Text style={{ color: '#fff' }}>จำนวนเงิน (บาท)</Text>}
              rules={[
                { required: true, message: 'กรุณาระบุจำนวนเงิน' },
                { type: 'number', min: 10, message: 'ขั้นต่ำ 10 บาท' },
              ]}
            >
              <InputNumber
                size="large"
                min={10}
                max={100000}
                style={{ width: '100%' }}
                placeholder="เช่น 100"
                formatter={(value) => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={actionLoading}
              block
              style={{
                background: 'linear-gradient(135deg, #22c55e, #15803d)',
                border: 'none',
                height: 50,
                fontWeight: 600,
              }}
            >
              ฝากเงิน
            </Button>
          </Form>
        </Card>
      ),
    },
    {
      key: 'withdraw',
      label: (
        <span>
          <MinusCircleOutlined /> ถอนเงิน
        </span>
      ),
      children: (
        <Card className="game-card" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
          <Title level={4} style={{ color: '#ef4444', marginBottom: 24 }}>
            💸 ถอนเงินออกจากกระเป๋า
          </Title>
          <Form form={withdrawForm} layout="vertical" onFinish={handleWithdraw}>
            <Form.Item
              name="amount"
              label={<Text style={{ color: '#fff' }}>จำนวนเงิน (บาท)</Text>}
              rules={[
                { required: true, message: 'กรุณาระบุจำนวนเงิน' },
                { type: 'number', min: 100, message: 'ขั้นต่ำ 100 บาท' },
              ]}
            >
              <InputNumber
                size="large"
                min={100}
                max={user?.balance || 0}
                style={{ width: '100%' }}
                placeholder="เช่น 500"
                formatter={(value) => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={actionLoading}
              block
              danger
              style={{ height: 50, fontWeight: 600 }}
            >
              ถอนเงิน
            </Button>
          </Form>
        </Card>
      ),
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined /> ประวัติ
        </span>
      ),
      children: (
        <Card className="game-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              📋 ประวัติธุรกรรม
            </Title>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              รีเฟรช
            </Button>
          </div>
          <Table
            dataSource={transactions}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={loading}
            locale={{
              emptyText: <Empty description="ยังไม่มีประวัติธุรกรรม" />,
            }}
            style={{ background: 'transparent' }}
          />
        </Card>
      ),
    },
  ];

  // Calculate summary from transactions
  const totalDeposit = transactions
    .filter((t) => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalWithdraw = transactions
    .filter((t) => t.type === 'withdraw' && t.status === 'completed')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <Layout>
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div className="slide-up" style={{ marginBottom: 32 }}>
          <Title level={2} style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <WalletOutlined style={{ color: '#fbbf24' }} />
            <span className="gradient-text">กระเป๋าเงิน</span>
          </Title>
        </div>

        {/* Balance Card */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} md={12}>
            <Card
              className="game-card slide-up"
              style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(168, 85, 247, 0.2))',
                borderColor: 'rgba(168, 85, 247, 0.3)',
              }}
            >
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>ยอดเงินคงเหลือ</Text>
                <div style={{ marginTop: 8 }}>
                  <Title level={1} style={{ margin: 0, color: '#fbbf24', fontSize: 48 }}>
                    ฿{(user?.balance || 0).toLocaleString()}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="game-card slide-up" style={{ animationDelay: '0.1s' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)' }}>ฝากทั้งหมด</Text>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e', marginTop: 8 }}>
                      ฿{totalDeposit.toLocaleString()}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)' }}>ถอนทั้งหมด</Text>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444', marginTop: 8 }}>
                      ฿{totalWithdraw.toLocaleString()}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Card className="game-card slide-up" style={{ animationDelay: '0.2s' }}>
          <Tabs items={tabItems} size="large" defaultActiveKey="deposit" />
        </Card>
      </div>
    </Layout>
  );
}
