import { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Button,
  Tabs,
  InputNumber,
  Select,
  Form,
  Table,
  Tag,
  Statistic,
  message,
  Modal,
  Space,
  Alert,
  Divider,
} from 'antd';
import {
  WalletOutlined,
  BankOutlined,
  QrcodeOutlined,
  GlobalOutlined,
  HistoryOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import Layout from '@/components/Layout';
import { apiClient } from '@/services/api';
import { useAuthStore } from '@/stores';

const { Title, Text, Paragraph } = Typography;

interface Transaction {
  id: string;
  type: string;
  amount: string;
  status: string;
  createdAt: string;
  metadata?: any;
}

interface DepositResponse {
  id: string;
  method: string;
  actualAmount: number;
  bankRef?: string;
  promptPayQR?: string; // base64 or url
  address?: string; // crypto
  expiresAt?: string;
  message: string;
}

export default function WalletPage() {
  const { user, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositResult, setDepositResult] = useState<DepositResponse | null>(null);

  // Forms
  const [bankForm] = Form.useForm();
  const [promptPayForm] = Form.useForm();
  const [cryptoForm] = Form.useForm();
  const [withdrawForm] = Form.useForm();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Mock history endpoint if not exists, assume GET /transactions
      // If backend doesn't have it, we might need to rely on deposit history /deposit/history
      // Let's try /deposit/history for now as that was in API list
      const res = await apiClient.get<Transaction[]>('/deposit/history');
      setTransactions(res || []);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(); // update balance
    fetchTransactions();
  }, []);

  const handleDepositBank = async (values: { amount: number }) => {
    try {
      const res = await apiClient.post<DepositResponse>('/deposit/bank', values);
      setDepositResult(res);
      message.success('สร้างรายการฝากเงินสำเร็จ');
      fetchTransactions();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'ทำรายการไม่สำเร็จ');
    }
  };

  const handleDepositPromptPay = async (values: { amount: number }) => {
    try {
      const res = await apiClient.post<DepositResponse>('/deposit/promptpay', values);
      setDepositResult(res);
      message.success('สร้างรายการ QR Code สำเร็จ');
      fetchTransactions();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'ทำรายการไม่สำเร็จ');
    }
  };

  const handleDepositCrypto = async (values: { amount: number; network: string; currency: string }) => {
    try {
      const res = await apiClient.post<DepositResponse>('/deposit/crypto', values);
      setDepositResult(res);
      message.success('สร้างรายการ Crypto สำเร็จ');
      fetchTransactions();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'ทำรายการไม่สำเร็จ');
    }
  };

  const handleWithdraw = async (values: any) => {
    // Note: Assuming endpoint exists or Mocking for now as Phase 3 didn't specify user withdraw endpoint details
    // But logically it should be POST /payout/request or similar.
    // Since PayoutModule handles auto-payout, let's assume we need manual request for now.
    // Fallback: Notify user to contact admin line due to security in beta.
    Modal.info({
      title: 'แจ้งถอนเงิน',
      content: (
        <div>
          <p>ระบบถอนเงินอัตโนมัติปิดปรับปรุงชั่วคราว</p>
          <p>กรุณาติดต่อ Admin เพื่อถอนเงิน: <a href="https://line.me/ti/p/@bingo2026" target="_blank">Line: @bingo2026</a></p>
        </div>
      )
    });
  };

  const columns = [
    { title: 'Date', dataIndex: 'createdAt', key: 'date', render: (d: string) => new Date(d).toLocaleString('th-TH') },
    { title: 'Type', dataIndex: 'method', key: 'type', render: (t: string) => <Tag color="blue">{t?.toUpperCase()}</Tag> },
    {
      title: 'Amount',
      dataIndex: 'actualAmount',
      key: 'amount',
      render: (a: string) => <Text type="success" strong>+{Number(a).toLocaleString()} ฿</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        let color = 'default';
        if (s === 'confirmed' || s === 'completed') color = 'success';
        if (s === 'pending') color = 'processing';
        if (s === 'rejected' || s === 'expired') color = 'error';
        return <Tag color={color}>{s.toUpperCase()}</Tag>;
      }
    },
  ];

  return (
    <Layout>
      <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
        <Title level={2} style={{ color: '#fff', marginBottom: 24 }}>
          <WalletOutlined /> กระเป๋าเงิน
        </Title>

        {/* Balance Card */}
        <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none' }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>ยอดเงินคงเหลือ</Text>
              <div style={{ fontSize: 48, fontWeight: 700, color: '#fff' }}>
                ฿{Number(user?.pointBalance || 0).toLocaleString()}
              </div>
            </Col>
            <Col>
              <Button size="large" type="default" ghost style={{ marginRight: 12 }}>
                ประวัติ
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Action Tabs */}
        <Card bodyStyle={{ padding: 0 }}>
          <Tabs
            size="large"
            type="card"
            style={{ width: '100%' }}
            items={[
              {
                key: 'deposit',
                label: <span><ArrowUpOutlined /> ฝากเงิน</span>,
                children: (
                  <div style={{ padding: 24 }}>
                    <Tabs
                      tabPosition="left"
                      items={[
                        {
                          key: 'bank',
                          label: <span><BankOutlined /> โอนธนาคาร</span>,
                          children: (
                            <div style={{ maxWidth: 400 }}>
                              <Title level={4}>ฝากเงินผ่านธนาคาร</Title>
                              <Form form={bankForm} layout="vertical" onFinish={handleDepositBank}>
                                <Form.Item name="amount" label="จำนวนเงิน (บาท)" rules={[{ required: true, type: 'number', min: 20 }]}>
                                  <InputNumber style={{ width: '100%' }} size="large" placeholder="ขั้นต่ำ 20 บาท" />
                                </Form.Item>
                                <Button type="primary" htmlType="submit" block size="large">
                                  แจ้งฝากเงิน
                                </Button>
                              </Form>
                            </div>
                          ),
                        },
                        {
                          key: 'promptpay',
                          label: <span><QrcodeOutlined /> PromptPay</span>,
                          children: (
                            <div style={{ maxWidth: 400 }}>
                              <Title level={4}>สแกน QR PromptPay</Title>
                              <Form form={promptPayForm} layout="vertical" onFinish={handleDepositPromptPay}>
                                <Form.Item name="amount" label="จำนวนเงิน (บาท)" rules={[{ required: true, type: 'number', min: 20 }]}>
                                  <InputNumber style={{ width: '100%' }} size="large" placeholder="ขั้นต่ำ 20 บาท" />
                                </Form.Item>
                                <Button type="primary" htmlType="submit" block size="large">
                                  สร้าง QR Code
                                </Button>
                              </Form>
                            </div>
                          ),
                        },
                        {
                          key: 'crypto',
                          label: <span><GlobalOutlined /> Crypto</span>,
                          children: (
                            <div style={{ maxWidth: 400 }}>
                              <Title level={4}>ฝากเหรียญ Crypto</Title>
                              <Form form={cryptoForm} layout="vertical" onFinish={handleDepositCrypto} initialValues={{ network: 'BSC', currency: 'USDT' }}>
                                <Form.Item name="amount" label="จำนวน (USDT)" rules={[{ required: true, type: 'number', min: 1 }]}>
                                  <InputNumber style={{ width: '100%' }} size="large" />
                                </Form.Item>
                                <Form.Item name="network" label="Network">
                                  <Select>
                                    <Select.Option value="BSC">BSC (BEP20)</Select.Option>
                                  </Select>
                                </Form.Item>
                                <Form.Item name="currency" label="Currency">
                                  <Select>
                                    <Select.Option value="USDT">USDT</Select.Option>
                                  </Select>
                                </Form.Item>
                                <Button type="primary" htmlType="submit" block size="large">
                                  รับ Address
                                </Button>
                              </Form>
                            </div>
                          ),
                        },
                      ]}
                    />

                    {/* Deposit Result Modal/Display */}
                    {depositResult && (
                      <Modal
                        open={!!depositResult}
                        onCancel={() => setDepositResult(null)}
                        footer={null}
                        title="รายละเอียดการฝากเงิน"
                      >
                        <Alert
                          message={depositResult.message}
                          description="กรุณาโอนยอดเงินให้ตรงจุดทศนิยมเพื่อให้ระบบตรวจสอบอัตโนมัติ"
                          type="warning"
                          showIcon
                          style={{ marginBottom: 16 }}
                        />
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                          <Title level={2} style={{ color: '#3b82f6', margin: 0 }}>
                            ฿{depositResult.actualAmount.toFixed(2)}
                          </Title>
                          <Text type="secondary">ยอดที่ต้องโอน</Text>
                        </div>

                        {depositResult.method === 'bank_transfer' && (
                          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                              <Text>ธนาคาร:</Text>
                              <Text strong>KBANK (กสิกรไทย)</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                              <Text>เลขบัญชี:</Text>
                              <Text strong copyable>123-4-56789-0</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text>ชื่อบัญชี:</Text>
                              <Text strong>บจก. บิงโกปาร์ตี้</Text>
                            </div>
                          </div>
                        )}

                        {depositResult.method === 'promptpay' && (
                          <div style={{ textAlign: 'center' }}>
                            {/* Mock QR display */}
                            <div style={{ width: 200, height: 200, background: '#fff', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' }}>
                              <QrcodeOutlined style={{ fontSize: 100 }} />
                            </div>
                            <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>PromptPay QR Mockup</Text>
                          </div>
                        )}

                        {depositResult.method === 'crypto' && (
                          <div>
                            <Text>Wallet Address:</Text>
                            <Paragraph copyable style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, marginTop: 4 }}>
                              {depositResult.address}
                            </Paragraph>
                            <Alert message="โอนเฉพาะ USDT (BEP20) เท่านั้น" type="info" showIcon />
                          </div>
                        )}

                        <Divider />
                        <div style={{ textAlign: 'center' }}>
                          <Button type="primary" onClick={() => setDepositResult(null)}>เข้าใจแล้ว</Button>
                        </div>
                      </Modal>
                    )}
                  </div>
                ),
              },
              {
                key: 'withdraw',
                label: <span><ArrowDownOutlined /> ถอนเงิน</span>,
                children: (
                  <div style={{ padding: 24, maxWidth: 500, margin: '0 auto' }}>
                    <Alert
                      message="การถอนเงิน"
                      description="ถอนขั้นต่ำ 300 บาท - เงินจะเข้าบัญชีภายใน 5-15 นาที"
                      type="info"
                      showIcon
                      style={{ marginBottom: 24 }}
                    />
                    <Form form={withdrawForm} layout="vertical" onFinish={handleWithdraw}>
                      <Form.Item name="amount" label="จำนวนเงินที่ต้องการถอน" rules={[{ required: true, type: 'number', min: 300, max: Number(user?.pointBalance || 0) }]}>
                        <InputNumber style={{ width: '100%' }} size="large" addonAfter="฿" />
                      </Form.Item>
                      <Form.Item name="bank" label="ธนาคารปลายทาง" rules={[{ required: true }]}>
                        <Select placeholder="เลือกธนาคาร">
                          <Select.Option value="kbank">กสิกรไทย</Select.Option>
                          <Select.Option value="scb">ไทยพาณิชย์</Select.Option>
                          <Select.Option value="ktb">กรุงไทย</Select.Option>
                          <Select.Option value="bbl">กรุงเทพ</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item name="accountNo" label="เลขบัญชี" rules={[{ required: true, len: 10 }]}>
                        <InputNumber style={{ width: '100%' }} stringMode placeholder="xxxxxxxxxx" />
                      </Form.Item>
                      <Button type="primary" htmlType="submit" block size="large" danger>
                        แจ้งถอนเงิน
                      </Button>
                    </Form>
                  </div>
                ),
              },
              {
                key: 'history',
                label: <span><HistoryOutlined /> ประวัติธุรกรรม</span>,
                children: (
                  <Table
                    columns={columns}
                    dataSource={transactions}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                  />
                ),
              },
            ]}
          />
        </Card>
      </div>
    </Layout>
  );
}
