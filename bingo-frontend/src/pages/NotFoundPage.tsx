import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * หน้า 404 Not Found
 */
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="ขออภัย ไม่พบหน้าที่คุณต้องการ"
        extra={
          <Button type="primary" onClick={() => navigate('/lobby')}>
            กลับไปหน้าหลัก
          </Button>
        }
      />
    </div>
  );
}
