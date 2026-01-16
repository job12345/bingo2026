import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface StreamInfo {
    id: string;
    roomId: string;
    platform: 'youtube' | 'facebook' | 'twitch' | 'custom';
    streamUrl: string;
    embedUrl: string;
    isLive: boolean;
    viewerCount?: number;
    title?: string;
    startedAt?: Date;
}

@Injectable()
export class StreamingService {
    // In-memory stream storage (can be moved to Redis for production)
    private activeStreams: Map<string, StreamInfo> = new Map();

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Convert platform URL to embed URL
     */
    private getEmbedUrl(platform: string, url: string): string {
        switch (platform) {
            case 'youtube':
                // Convert youtube.com/watch?v=xxx to embed URL
                const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
                if (ytMatch) {
                    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1`;
                }
                // Already embed URL
                if (url.includes('/embed/')) return url;
                break;

            case 'facebook':
                // Facebook Live embed
                return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&autoplay=true&mute=true`;

            case 'twitch':
                // Twitch channel embed
                const twitchMatch = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
                if (twitchMatch) {
                    return `https://player.twitch.tv/?channel=${twitchMatch[1]}&parent=${process.env.DOMAIN || 'localhost'}&muted=true`;
                }
                break;

            case 'custom':
                return url; // Direct embed URL
        }
        return url;
    }

    /**
     * Start streaming for a room
     */
    async startStream(
        roomId: string,
        userId: string,
        platform: 'youtube' | 'facebook' | 'twitch' | 'custom',
        streamUrl: string,
        title?: string,
    ): Promise<StreamInfo> {
        // Verify user is room creator
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            select: { creatorId: true },
        });

        if (!room) {
            throw new NotFoundException('Room not found');
        }

        if (room.creatorId !== userId) {
            throw new BadRequestException('Only room creator can start stream');
        }

        const embedUrl = this.getEmbedUrl(platform, streamUrl);
        const streamId = `stream_${roomId}_${Date.now()}`;

        const streamInfo: StreamInfo = {
            id: streamId,
            roomId,
            platform,
            streamUrl,
            embedUrl,
            isLive: true,
            viewerCount: 0,
            title: title || `Live Stream - Room ${roomId}`,
            startedAt: new Date(),
        };

        this.activeStreams.set(roomId, streamInfo);
        return streamInfo;
    }

    /**
     * Stop streaming for a room
     */
    async stopStream(roomId: string, userId: string): Promise<{ success: boolean }> {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            select: { creatorId: true },
        });

        if (!room) {
            throw new NotFoundException('Room not found');
        }

        if (room.creatorId !== userId) {
            throw new BadRequestException('Only room creator can stop stream');
        }

        this.activeStreams.delete(roomId);
        return { success: true };
    }

    /**
     * Get stream info for a room
     */
    getStreamInfo(roomId: string): StreamInfo | null {
        return this.activeStreams.get(roomId) || null;
    }

    /**
     * Get all active streams
     */
    getActiveStreams(): StreamInfo[] {
        return Array.from(this.activeStreams.values());
    }

    /**
     * Update viewer count
     */
    updateViewerCount(roomId: string, count: number): void {
        const stream = this.activeStreams.get(roomId);
        if (stream) {
            stream.viewerCount = count;
            this.activeStreams.set(roomId, stream);
        }
    }

    /**
     * Check if room has active stream
     */
    isStreaming(roomId: string): boolean {
        return this.activeStreams.has(roomId);
    }
}
