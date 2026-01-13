import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DepositRequestDto {
  @ApiProperty({ description: 'จำนวนเงิน (Point)', example: 1000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'URL สลิปการโอนเงิน' })
  @IsString()
  paymentSlipUrl: string;

  @ApiPropertyOptional({ description: 'หมายเหตุ' })
  @IsString()
  @IsOptional()
  notes?: string;
}
