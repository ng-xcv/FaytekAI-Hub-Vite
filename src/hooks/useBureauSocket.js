import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

/**
 * Hook — connexion au namespace /bureau-digital du serveur Socket.IO
 * Usage :
 *   const { connected } = useBureauSocket({
 *     onStatusChanged: (data) => ...,
 *     onTaskUpdated: (data) => ...,
 *     onSkillUpdated: (data) => ...,
 *   });
 */
export default function useBureauSocket({ onStatusChanged, onTaskUpdated, onSkillUpdated } = {}) {
  const socketRef = useRef(null);
  const connectedRef = useRef(false);

  const joinAgent = useCallback((agentId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join:agent', agentId);
    }
  }, []);

  useEffect(() => {
    // Ne pas connecter si l'URL n'est pas configurée
    if (!SOCKET_URL) {
      console.warn('[useBureauSocket] VITE_SOCKET_URL non configuré — temps réel désactivé');
      return;
    }

    const socket = io(`${SOCKET_URL}/bureau-digital`, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      connectedRef.current = true;
      console.log('[bureau-digital] Socket connecté:', socket.id);
    });

    socket.on('disconnect', () => {
      connectedRef.current = false;
      console.log('[bureau-digital] Socket déconnecté');
    });

    socket.on('agent:status_changed', (data) => {
      onStatusChanged?.(data);
    });

    socket.on('agent:task_updated', (data) => {
      onTaskUpdated?.(data);
    });

    socket.on('agent:skill_updated', (data) => {
      onSkillUpdated?.(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // Les callbacks sont des refs stables — pas besoin de les inclure dans deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { socket: socketRef.current, joinAgent };
}
