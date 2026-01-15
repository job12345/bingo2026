import { useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Statistic, Button, Table, Space, Modal, InputNumber, Form, message } from 'antd';
import { 
  PlusOutlined, 
  MinusOutlined, 
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  TrophyOutlined,
  HistoryOutlined 
} from '@ant-design/icons';
import Layout from '@/components/Layout';
import { useWalletStore } from '@/stores';
import { formatCurrency, formatDate } from '@/utils';

const { Title, Text } = Typography;

/**
 * หน้ากระเป๋าเงิน (Wallet) - Gaming Theme
 */
export default function WalletPage() {
  const { balance, transactions, summary, fetchBalance, fetchTransactions, fetchSummary, isLoading, requestDeposit, requestWithdraw } =
    useWalletStore();
  const [depositModal, setDepositModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
    fetchSummary();
  }, []);

  const handleDeposit = async (values: { amount: number }) => {
    try {
      await requestDeposit(values.amount, '', '');
      message.success('สร้างรายการฝากเงินสำเร็จ');
      setDepositModal(false);
      form.resetFields();
    } catch {
      message.error('เกิดข้อผิดพลาด');
    }
  };

  const handleWithdraw = async (values: { amount: number }) => {
    try {
      await requestWithdraw(values.amount, '');
      message.success('สร้างรายการถอนเงินสำเร็จ');
      setWithdrawModal(false);
      form.resetFields();
    } catch {
      message.error('เกิดข้อผิดพลาด');
    }
  };

  // Table Columns
  const columns = [
    {
      title: 'วันที่',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Text style={{ color: 'rgba(255,255,255,0.7)' }}>{formatDate(date)}</Text>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
          deposit: { text: 'ฝากเงิน', color: '#52c41a', icon: <ArrowDownOutlined /> },
          withdraw: { text: 'ถอนเงิน', color: '#faad14', icon: <ArrowUpOutlined /> },
          card_purchase: { text: 'ซื้อการ์ด', color: '#8b5cf6', icon: <WalletOutlined /> },
          payout: { text: 'รับเงินรางวัล', color: '#ffd700', icon: <TrophyOutlined /> },
          refund: { text: 'คืนเงิน', color: '#52c41a', icon: <ArrowDownOutlined /> },
          fee: { text: 'ค่าธรรมเนียม', color: '#ff4d4f', icon: <MinusOutlined /> },
          adjustment: { text: 'ปรับปรุงยอด', color: '#1890ff', icon: <HistoryOutlined /> },
        };
        const config = typeMap[type] || { text: type, color: '#fff', icon: null };
        return (
          <Space>
            <span style={{ color: config.color }}>{config.icon}</span>
            <Text style={{ color: config.color }}>{config.text}</Text>
          </Space>
        );
      },
    },
    {
      title: 'จำนวนเงิน',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: { type: string }) => {
        const isPositive = ['deposit', 'payout', 'refund'].includes(record.type);
        return (
          <Text strong style={{ 
            color: isPositive ? '#52c41a' : '#ff4d4f',
            fontSize: '16px',
          }}>
            {isPositive ? '+' : '-'}
            {formatCurrency(amount)}
          </Text>
        );
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { text: string; bg: string; color: string }> = {
          pending: { text: 'รอดำเนินการ', bg: 'rgba(250, 173, 20, 0.2)', color: '#faad14' },
          approved: { text: 'อนุมัติ', bg: 'rgba(82, 196, 26, 0.2)', color: '#52c41a' },
          rejected: { text: 'ปฏิเสธ', bg: 'rgba(255, 77, 79, 0.2)', color: '#ff4d4f' },
          completed: { text: 'สำเร็จ', bg: 'rgba(82, 196, 26, 0.2)', color: '#52c41a' },
          cancelled: { text: 'ยกเลิก', bg: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255,255,255,0.5)' },
        };
        const { text, bg, color } = statusMap[status] || { text: status, bg: 'transparent', color: '#fff' };
        return (
          <span style={{ 
            padding: '4px 12px', 
            borderRadius: '12px', 
            background: bg, 
            color,
            fontSize: '12px',
          }}>
            {text}
          </span>
        );
      },
    },
  ];

  return (
    <Layout>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Page Title */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <Title level={2} style={{ 
              color: '#fff', 
              margin: 0,
              background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              <WalletOutlined style={{ marginRight: '12px' }} />
              กระเป๋าเงิน
            </Title>
          </div>

          {/* Main Balance Card */}
          <Card className="game-card" style={{ textAlign: 'center', padding: '24px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>
              ยอดเงินปัจจุบัน
            </Text>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '16px 0',
              textShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
            }}>
              ฿{balance?.toLocaleString() || '0'}
            </div>
            <Space size="large">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                size="large"
                onClick={() => setDepositModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                  border: 'none',
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px',
                  boxShadow: '0 4px 15px rgba(82, 196, 26, 0.4)',
                }}
              >
                ฝากเงิน
              </Button>
              <Button 
                icon={<MinusOutlined />} 
                size="large"
                onClick={() => setWithdrawModal(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#fff',
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px',
                }}
              >
                ถอนเงิน
              </Button>
            </Space>
          </Card>

          {/* Summary Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card className="game-card">
                <Statistic
                  title={<Text style={{ color: 'rgba(255,255,255,0.7)' }}>ฝากทั้งหมด</Text>}
                  value={summary?.totalDeposit || 0}
                  suffix="บาท"
                  prefix={<ArrowDownOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a', fontSize: 24 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="game-card">
                <Statistic
                  title={<Text style={{ color: 'rgba(255,255,255,0.7)' }}>ถอนทั้งหมด</Text>}
                  value={summary?.totalWithdraw || 0}
                  suffix="บาท"
                  prefix={<ArrowUpOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14', fontSize: 24 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="game-card">
                <Statistic
                  title={<Text style={{ color: 'rgba(255,255,255,0.7)' }}>กำไร/ขาดทุน</Text>}
                  value={summary?.netProfit || 0}
                  suffix="บาท"
                  prefix={<TrophyOutlined style={{ color: '#ffd700' }} />}
                  valueStyle={{ 
                    color: (summary?.netProfit || 0) >= 0 ? '#52c41a' : '#ff4d4f', 
                    fontSize: 24 
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Transaction History */}
          <Card 
            className="game-card" 
            title={
              <Space>
                <HistoryOutlined style={{ color: '#ffd700' }} />
                <Text style={{ color: '#fff', fontSize: '18px' }}>ประวัติธุรกรรม</Text>
              </Space>
            }
          >
            <Table
              dataSource={transactions}
              columns={columns}
              loading={isLoading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              style={{ background: 'transparent' }}
            />
          </Card>
        </Space>
      </div>

      {/* Deposit Modal */}
      <Modal
        title={<Text style={{ color: '#fff' }}>ฝากเงิน</Text>}
        open={depositModal}
        onCancel={() => setDepositModal(false)}
        footer={null}
        styles={{ content: { background: '#1e1e3c' }, header: { background: '#1e1e3c' } }}
      >
        <Form form={form} onFinish={handleDeposit} layout="vertical">
          <Form.Item
            name="amount"
            label={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>จำนวนเงิน (บาท)</Text>}
            rules={[{ required: true, message: 'กรุณาระบุจำนวนเงิน' }]}
          >
            <InputNumber
              min={100}
              max={100000}
              style={{ width: '100%' }}
              size="large"
              placeholder="ระบุจำนวนเงิน (ขั้นต่ำ 100 บาท)"
            />
          </Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            size="large"
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              border: 'none',
            }}
          >
            ยืนยันการฝากเงิน
          </Button>
        </Form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        title={<Text style={{ color: '#fff' }}>ถอนเงิน</Text>}
        open={withdrawModal}
        onCancel={() => setWithdrawModal(false)}
        footer={null}
        styles={{ content: { background: '#1e1e3c' }, header: { background: '#1e1e3c' } }}
      >
        <Form form={form} onFinish={handleWithdraw} layout="vertical">
          <Form.Item
            name="amount"
            label={<Text style={{ color: 'rgba(255,255,255,0.8)' }}>จำนวนเงิน (บาท)</Text>}
            rules={[{ required: true, message: 'กรุณาระบุจำนวนเงิน' }]}
          >
            <InputNumber
              min={100}
              max={balance || 0}
              style={{ width: '100%' }}
              size="large"
              placeholder={`ยอดคงเหลือ: ${balance?.toLocaleString() || 0} บาท`}
            />
          </Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            size="large"
            style={{
              background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
              border: 'none',
            }}
          >
            ยืนยันการถอนเงิน
          </Button>
        </Form>
      </Modal>
    </Layout>
  );
}
