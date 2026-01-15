import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Result } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores';

/**
 * Auth Callback Page - รับ token จาก Google OAuth และบันทึก
 */
export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { fetchCurrentUser } = useAuthStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            // ดึง tokens จาก URL params
            const accessToken = searchParams.get('accessToken');
            const refreshToken = searchParams.get('refreshToken');

            if (!accessToken) {
                setError('ไม่พบ Access Token กรุณาลองใหม่อีกครั้ง');
                return;
            }

            try {
                // บันทึก tokens ลง localStorage
                localStorage.setItem('accessToken', accessToken);
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }

                // ดึงข้อมูล user profile
                await fetchCurrentUser();

                // Redirect ไป Lobby
                navigate('/lobby', { replace: true });
            } catch (err) {
                console.error('Auth callback error:', err);
                setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่');
                // ลบ tokens ที่อาจไม่ถูกต้อง
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        };

        handleCallback();
    }, [searchParams, navigate, fetchCurrentUser]);

    if (error) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: '#0f0f23',
                }}
            >
                <Result
                    status="error"
                    title="เข้าสู่ระบบไม่สำเร็จ"
                    subTitle={error}
                    extra={
                        <a href="/" style={{ color: '#667eea', fontWeight: 600 }}>
                            กลับไปหน้าหลัก
                        </a>
                    }
                />
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: '#0f0f23',
                gap: 24,
            }}
        >
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#667eea' }} spin />} />
            <div style={{ color: '#fff', fontSize: 18 }}>กำลังเข้าสู่ระบบ...</div>
        </div>
    );
}
