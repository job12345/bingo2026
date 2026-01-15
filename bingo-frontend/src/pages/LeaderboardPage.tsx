import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tabs, Avatar, Spin, Typography, Tag, Space, Button } from 'antd';
import {
    TrophyOutlined,
    CrownFilled,
    FireOutlined,
    ThunderboltOutlined,
    ArrowLeftOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/services/api';

const { Title, Text } = Typography;

interface LeaderboardEntry {
    rank: number;
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    totalWins: number;
    totalGamesPlayed: number;
    totalWon: number;
    winRate: number;
}

/**
 * Leaderboard Page - แสดง ranking ผู้เล่น
 */
export default function LeaderboardPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('daily');
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        fetchLeaderboard(activeTab);
    }, [activeTab]);

    const fetchLeaderboard = async (period: string) => {
        setLoading(true);
        try {
            const response = await apiClient.get<LeaderboardEntry[]>(`/leaderboard/${period}`);
            setLeaderboard(response);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <CrownFilled style={{ color: '#ffd700', fontSize: 24 }} />;
            case 2:
                return <CrownFilled style={{ color: '#c0c0c0', fontSize: 20 }} />;
            case 3:
                return <CrownFilled style={{ color: '#cd7f32', fontSize: 18 }} />;
            default:
                return <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{rank}</span>;
        }
    };

    const columns = [
        {
            title: 'อันดับ',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            align: 'center' as const,
            render: (rank: number) => getRankIcon(rank),
        },
        {
            title: 'ผู้เล่น',
            dataIndex: 'displayName',
            key: 'displayName',
            render: (name: string, record: LeaderboardEntry) => (
                <Space>
                    <Avatar
                        src={record.avatarUrl}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#667eea' }}
                    />
                    <Text style={{ color: '#fff', fontWeight: record.rank <= 3 ? 700 : 400 }}>
                        {name}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'ชนะ',
            dataIndex: 'totalWins',
            key: 'totalWins',
            align: 'center' as const,
            render: (wins: number) => (
                <Tag color="gold" icon={<TrophyOutlined />}>
                    {wins}
                </Tag>
            ),
        },
        {
            title: 'เล่น',
            dataIndex: 'totalGamesPlayed',
            key: 'totalGamesPlayed',
            align: 'center' as const,
            render: (games: number) => (
                <Text style={{ color: 'rgba(255,255,255,0.65)' }}>{games} รอบ</Text>
            ),
        },
        {
            title: 'รายได้',
            dataIndex: 'totalWon',
            key: 'totalWon',
            align: 'right' as const,
            render: (amount: number) => (
                <Text style={{ color: '#22c55e', fontWeight: 600 }}>
                    ฿{amount.toLocaleString()}
                </Text>
            ),
        },
        {
            title: 'Win Rate',
            dataIndex: 'winRate',
            key: 'winRate',
            align: 'center' as const,
            render: (rate: number) => (
                <Tag color={rate >= 50 ? 'green' : rate >= 30 ? 'orange' : 'default'}>
                    {rate.toFixed(1)}%
                </Tag>
            ),
        },
    ];

    const tabItems = [
        {
            key: 'daily',
            label: (
                <span>
                    <FireOutlined style={{ marginRight: 8 }} />
                    วันนี้
                </span>
            ),
        },
        {
            key: 'weekly',
            label: (
                <span>
                    <ThunderboltOutlined style={{ marginRight: 8 }} />
                    สัปดาห์นี้
                </span>
            ),
        },
        {
            key: 'all-time',
            label: (
                <span>
                    <TrophyOutlined style={{ marginRight: 8 }} />
                    ตลอดกาล
                </span>
            ),
        },
    ];

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#0f0f23',
                padding: '24px',
            }}
        >
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/lobby')}
                        style={{ color: '#fff' }}
                    />
                    <Title level={2} style={{ color: '#fff', margin: 0 }}>
                        <TrophyOutlined style={{ marginRight: 12, color: '#ffd700' }} />
                        Leaderboard
                    </Title>
                </div>

                {/* Leaderboard Card */}
                <Card
                    className="game-card"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={tabItems}
                        style={{ marginBottom: 16 }}
                    />

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 60 }}>
                            <Spin size="large" />
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.45)' }}>
                            <TrophyOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                            <div>ยังไม่มีข้อมูล</div>
                        </div>
                    ) : (
                        <Table
                            dataSource={leaderboard}
                            columns={columns}
                            rowKey="userId"
                            pagination={false}
                            style={{ background: 'transparent' }}
                            className="leaderboard-table"
                        />
                    )}
                </Card>

                {/* Stats Info */}
                <div
                    style={{
                        marginTop: 24,
                        padding: 16,
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 12,
                        textAlign: 'center',
                    }}
                >
                    <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                        🏆 Leaderboard อัพเดททุก 5 นาที | เล่นเพิ่มเพื่อขึ้นอันดับ!
                    </Text>
                </div>
            </div>

            <style>{`
        .leaderboard-table .ant-table {
          background: transparent !important;
        }
        .leaderboard-table .ant-table-thead > tr > th {
          background: rgba(255,255,255,0.05) !important;
          color: rgba(255,255,255,0.65) !important;
          border-bottom: 1px solid rgba(255,255,255,0.1) !important;
        }
        .leaderboard-table .ant-table-tbody > tr > td {
          background: transparent !important;
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        }
        .leaderboard-table .ant-table-tbody > tr:hover > td {
          background: rgba(255,255,255,0.05) !important;
        }
        .leaderboard-table .ant-table-tbody > tr:nth-child(1) > td {
          background: rgba(255, 215, 0, 0.1) !important;
        }
        .leaderboard-table .ant-table-tbody > tr:nth-child(2) > td {
          background: rgba(192, 192, 192, 0.1) !important;
        }
        .leaderboard-table .ant-table-tbody > tr:nth-child(3) > td {
          background: rgba(205, 127, 50, 0.1) !important;
        }
      `}</style>
        </div>
    );
}
