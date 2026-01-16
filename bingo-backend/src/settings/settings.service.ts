import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_SETTINGS = {
    fee_percentage: { value: 10, description: 'ค่าธรรมเนียมกลาง (%)' },
    min_deposit: { value: 20, description: 'ฝากขั้นต่ำ (บาท)' },
    max_deposit: { value: 50000, description: 'ฝากสูงสุด (บาท)' },
};

@Injectable()
export class SettingsService implements OnModuleInit {
    private cache: Map<string, any> = new Map();

    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit() {
        await this.loadSettings();
    }

    /**
     * Load all settings into cache
     */
    async loadSettings() {
        const settings = await this.prisma.systemSetting.findMany();
        settings.forEach((s) => {
            this.cache.set(s.key, s.value);
        });

        // Initialize defaults if missing
        for (const [key, config] of Object.entries(DEFAULT_SETTINGS)) {
            if (!this.cache.has(key)) {
                await this.updateSetting(key, config.value, config.description);
            }
        }
    }

    /**
     * Get setting value (from cache)
     */
    get<T>(key: string, defaultValue?: T): T {
        return this.cache.get(key) ?? defaultValue;
    }

    /**
     * Update setting value
     */
    async updateSetting(key: string, value: any, description?: string, userId?: string) {
        const setting = await this.prisma.systemSetting.upsert({
            where: { key },
            update: {
                value,
                description,
                updatedBy: userId,
            },
            create: {
                key,
                value,
                description,
                updatedBy: userId,
            },
        });

        this.cache.set(key, value);
        return setting;
    }

    /**
     * Get all settings
     */
    async getAllSettings() {
        return this.prisma.systemSetting.findMany({
            orderBy: { key: 'asc' },
        });
    }
}
