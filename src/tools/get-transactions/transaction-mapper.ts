// Maps and formats transaction data for get-transactions tool
import { formatAmount, formatDate } from '../../utils.js';
import type { Transaction } from '../../types.js';

/**
 * Remove unpaired UTF-16 surrogates which can make downstream JSON parsers fail.
 */
function sanitizeText(value: string): string {
  return value.replace(
    /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g,
    '\uFFFD'
  );
}

export class GetTransactionsMapper {
  map(transactions: Transaction[]): Array<{
    id: string;
    date: string;
    payee: string;
    category: string;
    amount: string;
    notes: string;
    cleared: boolean;
    transferId: string;
  }> {
    return transactions.map((t) => ({
      id: sanitizeText(t.id),
      date: sanitizeText(formatDate(t.date)),
      payee: sanitizeText(t.payee_name || t.payee || '(No payee)'),
      category: sanitizeText(t.category_name || t.category || '(Uncategorized)'),
      amount: formatAmount(t.amount),
      notes: sanitizeText(t.notes || ''),
      cleared: t.cleared ?? false,
      transferId: t.transfer_id || '',
    }));
  }
}
