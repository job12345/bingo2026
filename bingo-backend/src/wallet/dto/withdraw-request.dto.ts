import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WithdrawRequestDto {
  @ApiProperty({ description: 'จำนวนเงิน (Point)', example: 500 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ description: 'หมายเหตุ' })
  @IsString()
  @IsOptional()
  notes?: string;
}
