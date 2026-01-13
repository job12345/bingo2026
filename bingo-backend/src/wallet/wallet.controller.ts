import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DepositRequestDto } from './dto/deposit-request.dto';
import { WithdrawRequestDto } from './dto/withdraw-request.dto';

@ApiTags('wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'ดูยอดเงิน Point ปัจจุบัน' })
  async getBalance(@CurrentUser('id') userId: string) {
    return this.walletService.getBalance(userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'ดูประวัติธุรกรรม' })
  async getTransactionHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.walletService.getTransactionHistory(
      userId,
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 20,
    );
  }

  @Post('deposit')
  @ApiOperation({ summary: 'ขอเติมเงิน (Deposit Request)' })
  async requestDeposit(@CurrentUser('id') userId: string, @Body() dto: DepositRequestDto) {
    return this.walletService.requestDeposit(userId, dto);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'ขอถอนเงิน (Withdraw Request)' })
  async requestWithdraw(@CurrentUser('id') userId: string, @Body() dto: WithdrawRequestDto) {
    return this.walletService.requestWithdraw(userId, dto);
  }

  @Get('pending')
  @ApiOperation({ summary: 'ดูรายการรอ Admin อนุมัติ' })
  async getPendingRequests(@CurrentUser('id') userId: string) {
    return this.walletService.getPendingRequests(userId);
  }

  @Post('cancel/:transactionId')
  @ApiOperation({ summary: 'ยกเลิกคำขอ (เฉพาะ Pending)' })
  async cancelRequest(
    @CurrentUser('id') userId: string,
    @Param('transactionId') transactionId: string,
  ) {
    return this.walletService.cancelRequest(userId, transactionId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'ดูสรุปการเงิน' })
  async getFinancialSummary(@CurrentUser('id') userId: string) {
    return this.walletService.getFinancialSummary(userId);
  }
}
