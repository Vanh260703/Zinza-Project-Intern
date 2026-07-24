export type SuspenseReason =
  | "no_order_code"
  | "order_not_found"
  | "order_not_pending"
  | "amount_mismatch"
  | "order_expired"
  | "processing_error"
  | "balance_sum_mismatch"
  | "missing_pair"
  | "balance_chain_mismatch";

export type SuspenseStatus = "unresolved" | "resolved" | "accepted" | "refunded";

export type SuspenseTransaction = {
  id: string;
  caseKey: string;
  reason: SuspenseReason;
  status: SuspenseStatus;
  amountVnd: number | null;
  amountCandy: number | null;
  transferContent: string | null;
  affectedUser: { id: string; name: string; email: string } | null;
  details: Record<string, unknown> | null;
  resolvedBy?: { id: string } | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
  lastSeenAt: string;
};
