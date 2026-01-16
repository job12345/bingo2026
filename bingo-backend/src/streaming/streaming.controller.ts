import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StreamingService } from './streaming.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('streaming')
@ApiBearerAuth()
@Controller('streaming')
export class StreamingController {
    constructor(private readonly streamingService: StreamingService) { }

    /**
     * Start stream for a room
     */
    @Post(':roomId/start')
    async startStream(
        @CurrentUser('id') userId: string,
        @Param('roomId') roomId: string,
        @Body()
        dto: {
            platform: 'youtube' | 'facebook' | 'twitch' | 'custom';
            streamUrl: string;
            title?: string;
        },
    ) {
        return this.streamingService.startStream(
            roomId,
            userId,
            dto.platform,
            dto.streamUrl,
            dto.title,
        );
    }

    /**
     * Stop stream for a room
     */
    @Delete(':roomId/stop')
    async stopStream(
        @CurrentUser('id') userId: string,
        @Param('roomId') roomId: string,
    ) {
        return this.streamingService.stopStream(roomId, userId);
    }

    /**
     * Get stream info for a room
     */
    @Get(':roomId')
    getStreamInfo(@Param('roomId') roomId: string) {
        const stream = this.streamingService.getStreamInfo(roomId);
        return stream || { isLive: false };
    }

    /**
     * Get all active streams
     */
    @Get()
    getActiveStreams() {
        return this.streamingService.getActiveStreams();
    }

    /**
     * Check if room is streaming
     */
    @Get(':roomId/status')
    getStreamStatus(@Param('roomId') roomId: string) {
        return { isLive: this.streamingService.isStreaming(roomId) };
    }
}
