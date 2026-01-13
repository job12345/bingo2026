import { useEffect } from 'react';
import { Layout, Typography, Card, Row, Col, Statistic, Button, Table, Space } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '@/stores';
import { formatCurrency, formatDate } from '@/utils';

const { Header, Content } = Layout;
const { Title } = Typography;

/**
 * หน้ากระเป๋าเงิน (Wallet)
 */
export default function WalletPage() {
  const navigate = useNavigate();
  const { balance, transactions, summary, fetchBalance, fetchTransactions, fetchSummary, isLoading } =
    useWalletStore();

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
    fetchSummary();
  }, []);

  // Table Columns
  const columns = [
    {
      title: 'วันที่',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          deposit: 'ฝากเงิน',
          withdraw: 'ถอนเงิน',
          card_purchase: 'ซื้อการ์ด',
          payout: 'รับเงินรางวัล',
          refund: 'คืนเงิน',
          fee: 'ค่าธรรมเนียม',
          adjustment: 'ปรับปรุงยอด',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: 'จำนวนเงิน',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: any) => {
        const isPositive = ['deposit', 'payout', 'refund'].includes(record.type);
        return (
          <span style={{ color: isPositive ? '#3f8600' : '#cf1322' }}>
            {isPositive ? '+' : '-'}
            {formatCurrency(amount)}
          </span>
        );
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          pending: { text: 'รอดำเนินการ', color: '#faad14' },
          approved: { text: 'อนุมัติ', color: '#52c41a' },
          rejected: { text: 'ปฏิเสธ', color: '#f5222d' },
          completed: { text: 'สำเร็จ', color: '#52c41a' },
          cancelled: { text: 'ยกเลิก', color: '#d9d9d9' },
        };
        const { text, color } = statusMap[status] || { text: status, color: '#000' };
        return <span style={{ color }}>{text}</span>;
      },
    },
  ];

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
          กระเป๋าเงิน
        </Title>
        <Button onClick={() => navigate('/lobby')}>กลับไปหน้าหลัก</Button>
      </Header>

      {/* Content */}
      <Content style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Summary Cards */}
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="ยอดเงินปัจจุบัน"
                  value={balance}
                  suffix="บาท"
                  valueStyle={{ color: '#3f8600', fontSize: 28 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="ฝากทั้งหมด"
                  value={summary?.totalDeposit || 0}
                  suffix="บาท"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="ถอนทั้งหมด"
                  value={summary?.totalWithdraw || 0}
                  suffix="บาท"
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="กำไร/ขาดทุน"
                  value={summary?.netProfit || 0}
                  suffix="บาท"
                  valueStyle={{ color: (summary?.netProfit || 0) >= 0 ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Actions */}
          <Card>
            <Space size="large">
              <Button type="primary" icon={<PlusOutlined />} size="large">
                ฝากเงิน
              </Button>
              <Button icon={<MinusOutlined />} size="large">
                ถอนเงิน
              </Button>
            </Space>
          </Card>

          {/* Transaction History */}
          <Card title="ประวัติธุรกรรม">
            <Table
              dataSource={transactions}
              columns={columns}
              loading={isLoading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Space>
      </Content>
    </Layout>
  );
}
