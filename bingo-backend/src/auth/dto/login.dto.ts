import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
    description: 'รหัสผ่าน',
    example: 'password123'
  })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  password: string;
}
