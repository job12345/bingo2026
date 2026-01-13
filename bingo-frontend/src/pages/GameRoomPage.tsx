import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Typography, Card, Spin } from 'antd';
import { useRoomStore, useGameStore, useWebSocketStore } from '@/stores';
import { useWebSocketEvents } from '@/hooks';

const { Content } = Layout;
const { Title } = Typography;

/**
 * หน้าห้องเกม (Main Game UI)
 */
export default function GameRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { currentRoom, fetchRoomById, isLoading } = useRoomStore();
  const { joinRoom } = useWebSocketStore();

  // ฟัง WebSocket Events
  useWebSocketEvents(roomId || null);

  useEffect(() => {
    if (roomId) {
      fetchRoomById(roomId);
      joinRoom(roomId);
    }
  }, [roomId]);

  if (isLoading || !currentRoom) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip="กำลังโหลดห้อง..." />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Card>
          <Title level={3}>{currentRoom.name}</Title>
          <p>
            <strong>Room ID:</strong> {roomId}
          </p>
          <p>TODO: สร้าง UI หน้าเกม (BingoCard, NumberDisplay, PlayerList, etc.)</p>
        </Card>
      </Content>
    </Layout>
  );
}
