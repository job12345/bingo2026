import { IsString, IsEnum, IsInt, IsOptional, Min, Max, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DrawMode {
  AUTO = 'auto',
  MANUAL_ROTATE = 'manual_rotate',
}

export enum BallSet {
  BALL_75 = 'BALL_75',
  BALL_90 = 'BALL_90',
}

export class CreateRoomDto {
  @ApiProperty({
    description: 'ชื่อห้อง',
    example: 'ห้องมือใหม่',
  })
  @IsString()
  @MinLength(3, { message: 'ชื่อห้องต้องมีอย่างน้อย 3 ตัวอักษร' })
  name: string;

  @ApiProperty({
    description: 'โหมดจับฉลาก',
    enum: DrawMode,
    example: DrawMode.AUTO,
  })
  @IsEnum(DrawMode)
  drawMode: DrawMode;

  @ApiProperty({
    description: 'ชุดลูกบอล',
    enum: BallSet,
    example: BallSet.BALL_75,
  })
  @IsEnum(BallSet)
  ballSet: BallSet;

  @ApiProperty({
    description: 'จำนวนผู้เล่นสูงสุด',
    example: 10,
  })
  @IsInt()
  @Min(2)
  @Max(50)
  maxPlayers: number;

  @ApiProperty({
    description: 'จำนวนรอบสูงสุด',
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  maxRounds: number;

  @ApiProperty({
    description: 'ราคาการ์ด (บาท)',
    example: 10,
  })
  @IsInt()
  @Min(1)
  @Max(1000)
  cardPrice: number;

  @ApiPropertyOptional({
    description: 'จำนวนการ์ดสูงสุดต่อผู้เล่น',
    example: 4,
    default: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxCardsPerPlayer?: number;

  @ApiPropertyOptional({
    description: 'เปอร์เซ็นต์ค่าธรรมเนียม',
    example: 5,
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  feePercentage?: number;
}
