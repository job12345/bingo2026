import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Space, Form, Input, Tabs, message } from 'antd';
import { PhoneOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores';
import { AuthService } from '@/services';

const { Title, Paragraph } = Typography;

interface LoginForm {
  phoneNumber: string;
  password: string;
}

interface RegisterForm {
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

/**
 * หน้า Login/Register (Phone + Password)
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm<LoginForm>();
  const [registerForm] = Form.useForm<RegisterForm>();

  useEffect(() => {
    // ถ้า Login แล้ว → Redirect ไป Lobby
    if (isAuthenticated) {
      navigate('/lobby');
    }
  }, [isAuthenticated, navigate]);

  /**
   * Login with Phone & Password
   */
  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      await AuthService.login(values.phoneNumber, values.password);
      message.success('เข้าสู่ระบบสำเร็จ!');
      navigate('/lobby');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register with Phone & Password
   */
  const handleRegister = async (values: RegisterForm) => {
    setLoading(true);
    try {
      await AuthService.register(
        values.phoneNumber,
        values.password,
        values.confirmPassword,
        values.displayName
      );
      message.success('สมัครสมาชิกสำเร็จ!');
      navigate('/lobby');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const loginTab = (
    <Form
      form={loginForm}
      layout="vertical"
      onFinish={handleLogin}
      autoComplete="off"
    >
      <Form.Item
        name="phoneNumber"
        label="เบอร์โทรศัพท์"
        rules={[
          { required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' },
          {
            pattern: /^0[0-9]{9}$/,
            message: 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก และขึ้นต้นด้วย 0',
          },
        ]}
      >
        <Input
          prefix={<PhoneOutlined />}
          placeholder="0812345678"
          size="large"
          maxLength={10}
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="รหัสผ่าน"
        rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="รหัสผ่าน"
          size="large"
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={loading}
          style={{ width: '100%' }}
        >
          เข้าสู่ระบบ
        </Button>
      </Form.Item>
    </Form>
  );

  const registerTab = (
    <Form
      form={registerForm}
      layout="vertical"
      onFinish={handleRegister}
      autoComplete="off"
    >
      <Form.Item
        name="phoneNumber"
        label="เบอร์โทรศัพท์"
        rules={[
          { required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' },
          {
            pattern: /^0[0-9]{9}$/,
            message: 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก และขึ้นต้นด้วย 0',
          },
        ]}
      >
        <Input
          prefix={<PhoneOutlined />}
          placeholder="0812345678"
          size="large"
          maxLength={10}
        />
      </Form.Item>

      <Form.Item
        name="displayName"
        label="ชื่อที่แสดง"
        rules={[
          { required: true, message: 'กรุณากรอกชื่อที่แสดง' },
          { min: 2, message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' },
          { max: 50, message: 'ชื่อต้องไม่เกิน 50 ตัวอักษร' },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="ชื่อที่แสดงในเกม"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="รหัสผ่าน"
        rules={[
          { required: true, message: 'กรุณากรอกรหัสผ่าน' },
          { min: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="ยืนยันรหัสผ่าน"
        dependencies={['password']}
        rules={[
          { required: true, message: 'กรุณายืนยันรหัสผ่าน' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('รหัสผ่านไม่ตรงกัน'));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="ยืนยันรหัสผ่าน"
          size="large"
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={loading}
          style={{ width: '100%' }}
        >
          สมัครสมาชิก
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: 450,
          maxWidth: '100%',
          borderRadius: 16,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Logo / Title */}
          <div style={{ textAlign: 'center' }}>
            <Title level={1} style={{ marginBottom: 0, color: '#667eea' }}>
              🎯 Bingo Party
            </Title>
            <Paragraph type="secondary">เกมบิงโกออนไลน์ที่สนุกและหาเงินได้จริง</Paragraph>
          </div>

          {/* Login/Register Tabs */}
          <Tabs
            defaultActiveKey="login"
            items={[
              {
                key: 'login',
                label: 'เข้าสู่ระบบ',
                children: loginTab,
              },
              {
                key: 'register',
                label: 'สมัครสมาชิก',
                children: registerTab,
              },
            ]}
          />

          {/* Terms */}
          <Paragraph type="secondary" style={{ fontSize: 12, textAlign: 'center', marginTop: -10 }}>
            การเข้าสู่ระบบแสดงว่าคุณยอมรับ <a href="/terms">ข้อกำหนดการใช้งาน</a>
          </Paragraph>
        </Space>
      </Card>
    </div>
  );
}
