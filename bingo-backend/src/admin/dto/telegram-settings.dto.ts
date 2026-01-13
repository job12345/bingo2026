import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

/**
 * DTO สำหรับอัปเดตการตั้งค่า Telegram
 */
export class UpdateTelegramSettingsDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  botToken?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  chatId?: string;
}

/**
 * DTO สำหรับทดสอบส่งข้อความ Telegram
 */
export class TestTelegramDto {
  @IsOptional()
  @IsString()
  chatId?: string;
}
