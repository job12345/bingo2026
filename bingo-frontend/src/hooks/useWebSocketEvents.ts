import { useEffect } from 'react';
import { websocketService } from '@/services';
import { useGameStore, useWebSocketStore } from '@/stores';
import { NumberDrawnEvent, BingoClaimedEvent, GameEndedEvent, PayoutCompletedEvent } from '@/types';
import { soundManager, SOUND_EVENTS } from '@/utils';

/**
 * Custom Hook สำหรับ WebSocket Events
 */
export function useWebSocketEvents(roomId: string | null) {
  const { setCurrentGame, updateGameState, addPlayer, removePlayer, markNumber } = useGameStore();
  const { addMessage } = useWebSocketStore();

  useEffect(() => {
    if (!roomId) return;

    const onPlayerJoined = (data: any) => {
      addPlayer({
        userId: data.userId,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        role: (data.role as any) ?? 'player',
        isReady: false,
        cardCount: 0,
        totalSpent: 0,
      } as any);
    };

    const onPlayerLeft = (data: any) => {
      removePlayer(data.userId);
    };

    const onGameStarted = (data: any) => {
      const current = useGameStore.getState().currentGame;
      if (!current) {
        setCurrentGame({
          id: data.gameId,
          roomId,
          roundNumber: data.roundNumber,
          state: data.state,
          drawnNumbers: [],
          totalBallsDrawn: 0,
          potSize: 0,
          feePercentage: 0,
          createdAt: new Date().toISOString(),
        } as any);
      }

      updateGameState({
        id: data.gameId,
        roundNumber: data.roundNumber,
        state: data.state,
      } as any);
    };

    const onNumberDrawn = (data: NumberDrawnEvent) => {
      updateGameState({
        drawnNumbers: data.drawnNumbers,
        currentBall: data.number,
        totalBallsDrawn: data.totalDrawn,
      });

      soundManager.play(SOUND_EVENTS.NUMBER_DRAW);

      // Auto-mark numbers on my cards (UI-only)
      const { myCards } = useGameStore.getState();
      for (const card of myCards) {
        const hasNumber = card.numbers?.some((row) => row.includes(data.number));
        if (hasNumber) {
          markNumber(card.id, data.number);
        }
      }
    };

    const onBingoClaimed = (data: BingoClaimedEvent) => {
      if (data.isValid && data.rank === 1) {
        soundManager.play(SOUND_EVENTS.BINGO);
      }
    };

    const onGameEnded = (data: GameEndedEvent) => {
      updateGameState({
        state: 'winner_declared' as any,
        winnerId: data.winnerId,
        winningPattern: data.pattern as any,
        ballsToWin: data.ballsToWin,
        payoutAmount: data.payoutAmount,
      });

      soundManager.play(SOUND_EVENTS.WIN);
    };

    const onPayoutCompleted = (data: PayoutCompletedEvent) => {
      updateGameState({
        state: 'payout' as any,
      });
    };

    const onNewMessage = (data: any) => {
      addMessage(data);
    };

    websocketService.on('player_joined', onPlayerJoined);
    websocketService.on('player_left', onPlayerLeft);
    websocketService.on('game_started', onGameStarted);
    websocketService.on<NumberDrawnEvent>('number_drawn', onNumberDrawn);
    websocketService.on<BingoClaimedEvent>('bingo_claimed', onBingoClaimed);
    websocketService.on<GameEndedEvent>('game_ended', onGameEnded);
    websocketService.on<PayoutCompletedEvent>('payout_completed', onPayoutCompleted);
    websocketService.on('new_message', onNewMessage);

    // Cleanup
    return () => {
      websocketService.off('player_joined', onPlayerJoined);
      websocketService.off('player_left', onPlayerLeft);
      websocketService.off('game_started', onGameStarted);
      websocketService.off('number_drawn', onNumberDrawn);
      websocketService.off('bingo_claimed', onBingoClaimed);
      websocketService.off('game_ended', onGameEnded);
      websocketService.off('payout_completed', onPayoutCompleted);
      websocketService.off('new_message', onNewMessage);
    };
  }, [roomId, setCurrentGame, updateGameState, addPlayer, removePlayer, markNumber, addMessage]);
}
