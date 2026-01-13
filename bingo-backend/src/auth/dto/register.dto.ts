import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'เบอร์โทรศัพท์ (10 หลัก)',
    example: '0812345678'
  })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกเบอร์โทรศัพท์' })
  @Matches(/^0[0-9]{9}$/, {
    message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก และขึ้นต้นด้วย 0'
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'รหัสผ่าน (ขั้นต่ำ 6 ตัวอักษร)',
    example: 'password123'
  })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  @MinLength(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
  password: string;

  @ApiProperty({
    description: 'ยืนยันรหัสผ่าน',
    example: 'password123'
  })
  @IsString()
  @IsNotEmpty({ message: 'กรุณายืนยันรหัสผ่าน' })
  confirmPassword: string;

  @ApiProperty({
    description: 'ชื่อที่แสดง',
    example: 'ผู้เล่น123'
  })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อที่แสดง' })
  @MinLength(2, { message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' })
  @MaxLength(50, { message: 'ชื่อต้องไม่เกิน 50 ตัวอักษร' })
  displayName: string;
}
