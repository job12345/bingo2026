import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DepositRequestDto {
  @ApiProperty({ description: 'จำนวนเงิน (Point)', example: 1000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ description: 'URL สลิปการโอนเงิน (Optional - Admin สามารถ verify ได้)' })
  @IsString()
  @IsOptional()
  paymentSlipUrl?: string;

  @ApiPropertyOptional({ description: 'หมายเหตุ' })
  @IsString()
  @IsOptional()
  notes?: string;
}
