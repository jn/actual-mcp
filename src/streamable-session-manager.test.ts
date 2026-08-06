import { describe, expect, it, vi } from 'vitest';
import { closeStreamableSession, StreamableSessionMap } from './streamable-session-manager.js';

describe('closeStreamableSession', () => {
  it('removes the session before closing its server', () => {
    const sessions: StreamableSessionMap = new Map();
    const server = {
      close: vi.fn(() => {
        expect(sessions.has('session-1')).toBe(false);
      }),
    };
    const transport = {
      close: vi.fn(),
    };
    sessions.set('session-1', { server, transport });

    closeStreamableSession(sessions, 'session-1');

    expect(server.close).toHaveBeenCalledTimes(1);
    expect(transport.close).not.toHaveBeenCalled();
    expect(sessions.has('session-1')).toBe(false);
  });

  it('does nothing for an already closed session', () => {
    const sessions: StreamableSessionMap = new Map();

    closeStreamableSession(sessions, 'missing-session');

    expect(sessions.size).toBe(0);
  });

  it('prevents recursive close callbacks from closing the server again', () => {
    const sessions: StreamableSessionMap = new Map();
    const server = {
      close: vi.fn(() => {
        closeStreamableSession(sessions, 'session-1');
      }),
    };
    const transport = {
      close: vi.fn(),
    };
    sessions.set('session-1', { server, transport });

    closeStreamableSession(sessions, 'session-1');

    expect(server.close).toHaveBeenCalledTimes(1);
    expect(sessions.size).toBe(0);
  });
});
