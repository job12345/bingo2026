import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('✅ WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        client.emit('authentication_failed', { message: 'Missing token' });
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload?.sub as string | undefined;
      if (!userId) {
        client.emit('authentication_failed', { message: 'Invalid token' });
        client.disconnect(true);
        return;
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, displayName: true, avatarUrl: true, role: true },
      });

      if (!user) {
        client.emit('authentication_failed', { message: 'User not found' });
        client.disconnect(true);
        return;
      }

      client.data.user = user;
      client.emit('authenticated', { userId: user.id, role: user.role });
      console.log(`🔌 Client connected: ${client.id} (user=${user.id})`);
    } catch (error: any) {
      client.emit('authentication_failed', { message: 'Invalid or expired token' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    return { event: 'pong', data: { timestamp: new Date().toISOString() } };
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(client: Socket, payload: { roomId: string }) {
    const user = client.data.user as
      | { id: string; displayName: string; avatarUrl?: string | null; role: string }
      | undefined;
    if (!user) {
      client.emit('error', { message: 'Unauthenticated' });
      return;
    }

    const roomId = payload?.roomId;
    if (!roomId) {
      client.emit('error', { message: 'Missing roomId' });
      return;
    }

    client.join(roomId);

    this.server.to(roomId).emit('player_joined', {
      userId: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl || undefined,
      role: user.role,
    });
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(client: Socket, payload: { roomId: string }) {
    const user = client.data.user as
      | { id: string; displayName: string; avatarUrl?: string | null; role: string }
      | undefined;
    if (!user) {
      client.emit('error', { message: 'Unauthenticated' });
      return;
    }

    const roomId = payload?.roomId;
    if (!roomId) {
      client.emit('error', { message: 'Missing roomId' });
      return;
    }

    client.leave(roomId);
    this.server.to(roomId).emit('player_left', { userId: user.id });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(client: Socket, payload: { roomId: string; content: string }) {
    const user = client.data.user as
      | { id: string; displayName: string; avatarUrl?: string | null; role: string }
      | undefined;
    if (!user) {
      client.emit('error', { message: 'Unauthenticated' });
      return;
    }

    const roomId = payload?.roomId;
    const content = payload?.content?.trim();
    if (!roomId || !content) {
      client.emit('error', { message: 'Invalid message' });
      return;
    }

    await this.prisma.chatMessage.create({
      data: {
        roomId,
        userId: user.id,
        content,
        messageType: 'text',
      },
    });

    this.server.to(roomId).emit('new_message', {
      userId: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl || undefined,
      content,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('manual_draw')
  async handleManualDraw(
    client: Socket,
    payload: { gameId: string; number?: number },
  ) {
    const user = client.data.user as { id: string } | undefined;
    if (!user) {
      client.emit('error', { message: 'Unauthenticated' });
      return;
    }

    // The actual draw logic is in GameService
    // This event is just for real-time notification
    // The actual draw is done via REST API /api/game/:gameId/manual-draw
    client.emit('manual_draw_acknowledged', {
      gameId: payload.gameId,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast to specific room
  broadcastToRoom(roomId: string, event: string, data: any) {
    this.server.to(roomId).emit(event, data);
  }

  // Broadcast to specific game
  broadcastToGame(gameId: string, event: string, data: any) {
    this.server.to(`game:${gameId}`).emit(event, data);
  }
}
