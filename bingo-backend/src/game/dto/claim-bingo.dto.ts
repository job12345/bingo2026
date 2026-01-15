import { IsEnum, IsUUID } from 'class-validator';

export enum BingoPatternDto {
  horizontal_1 = 'horizontal_1',
  horizontal_2 = 'horizontal_2',
  horizontal_3 = 'horizontal_3',
  horizontal_4 = 'horizontal_4',
  horizontal_5 = 'horizontal_5',
  vertical_1 = 'vertical_1',
  vertical_2 = 'vertical_2',
  vertical_3 = 'vertical_3',
  vertical_4 = 'vertical_4',
  vertical_5 = 'vertical_5',
  diagonal_1 = 'diagonal_1',
  diagonal_2 = 'diagonal_2',
  four_corners = 'four_corners',
}

export class ClaimBingoDto {
  @IsUUID()
  cardId: string;

  @IsEnum(BingoPatternDto)
  pattern: BingoPatternDto;
}
