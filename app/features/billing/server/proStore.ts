const paidCheckoutSessions = new Set<string>();

export function markSessionPaid(sessionId: string) {
  paidCheckoutSessions.add(sessionId);
}

export function isSessionPaid(sessionId: string) {
  return paidCheckoutSessions.has(sessionId);
}
