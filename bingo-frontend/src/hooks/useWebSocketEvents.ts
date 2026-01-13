import { useEffect } from 'react';
import { websocketService } from '@/services';
import { useGameStore, useWebSocketStore } from '@/stores';
import { NumberDrawnEvent, BingoClaimedEvent, GameEndedEvent, PayoutCompletedEvent } from '@/types';
import { soundManager, SOUND_EVENTS } from '@/utils';

/**
 * Custom Hook สำหรับ WebSocket Events
 */
export function useWebSocketEvents(roomId: string | null) {
  const { updateGameState, addPlayer, removePlayer, markNumber } = useGameStore();
  const { addMessage } = useWebSocketStore();

  useEffect(() => {
    if (!roomId) return;

    // Player Joined
    websocketService.on('player_joined', (data) => {
      addPlayer({
        userId: data.userId,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        role: data.role as any,
        isReady: false,
        cardCount: 0,
        totalSpent: 0,
      });
    });

    // Player Left
    websocketService.on('player_left', (data) => {
      removePlayer(data.userId);
    });

    // Game Started
    websocketService.on('game_started', (data) => {
      updateGameState({
        id: data.gameId,
        roundNumber: data.roundNumber,
        state: data.state,
      });
    });

    // Number Drawn
    websocketService.on<NumberDrawnEvent>('number_drawn', (data) => {
      updateGameState({
        drawnNumbers: data.drawnNumbers,
        currentBall: data.number,
        totalBallsDrawn: data.totalDrawn,
      });

      // เล่นเสียง
      soundManager.play(SOUND_EVENTS.NUMBER_DRAW);

      // Mark Number on Cards (Auto)
      // TODO: Implement auto-marking logic
    });

    // Bingo Claimed
    websocketService.on<BingoClaimedEvent>('bingo_claimed', (data) => {
      if (data.isValid && data.rank === 1) {
        // ผู้ชนะ
        soundManager.play(SOUND_EVENTS.BINGO);
      }
    });

    // Game Ended
    websocketService.on<GameEndedEvent>('game_ended', (data) => {
      updateGameState({
        state: 'winner_declared',
        winnerId: data.winnerId,
        winningPattern: data.pattern,
        ballsToWin: data.ballsToWin,
      });

      soundManager.play(SOUND_EVENTS.WIN);
    });

    // Payout Completed
    websocketService.on<PayoutCompletedEvent>('payout_completed', (data) => {
      updateGameState({
        state: 'payout',
      });
    });

    // Cleanup
    return () => {
      // Unregister listeners
      websocketService.off('player_joined', () => {});
      websocketService.off('player_left', () => {});
      websocketService.off('game_started', () => {});
      websocketService.off('number_drawn', () => {});
      websocketService.off('bingo_claimed', () => {});
      websocketService.off('game_ended', () => {});
      websocketService.off('payout_completed', () => {});
    };
  }, [roomId, updateGameState, addPlayer, removePlayer, markNumber, addMessage]);
}
