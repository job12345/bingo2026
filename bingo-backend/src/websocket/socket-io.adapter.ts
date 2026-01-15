import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext } from '@nestjs/common';
import { ServerOptions } from 'socket.io';

export class SocketIoAdapter extends IoAdapter {
  constructor(app: INestApplicationContext) {
    super(app);
  }

  createIOServer(_port: number, options?: ServerOptions): any {
    const wsPort = parseInt(process.env.WEBSOCKET_PORT || '8002', 10);

    const cors = {
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      credentials: true,
    };

    return super.createIOServer(wsPort, {
      ...options,
      cors,
    });
  }
}
