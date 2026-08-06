export interface Closeable {
  close(): Promise<void> | void;
}

export interface StreamableSession<TTransport extends Closeable = Closeable> {
  server: Closeable;
  transport: TTransport;
}

export type StreamableSessionMap<TTransport extends Closeable = Closeable> = Map<string, StreamableSession<TTransport>>;

/**
 * Close a streamable HTTP session exactly once.
 *
 * The MCP Server owns the transport close. Deleting the session before closing
 * prevents transport onclose callbacks from recursively closing the same server.
 */
export function closeStreamableSession<TTransport extends Closeable>(
  sessions: StreamableSessionMap<TTransport>,
  sessionId: string
): void {
  const session = sessions.get(sessionId);

  if (!session) {
    return;
  }

  sessions.delete(sessionId);
  void session.server.close();
}
