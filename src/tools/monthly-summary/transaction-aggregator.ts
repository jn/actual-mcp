import { Transaction, MonthData } from '../../types.js';

interface TransactionMonth {
  key: string;
  year: number;
  month: number;
}

function getTransactionMonth(dateText: string): TransactionMonth {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-\d{2}$/.exec(dateText);

  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);

    return {
      key: `${dateOnlyMatch[1]}-${dateOnlyMatch[2]}`,
      year,
      month,
    };
  }

  const date = new Date(dateText);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  return {
    key: `${year}-${String(month).padStart(2, '0')}`,
    year,
    month,
  };
}

export class MonthlySummaryTransactionAggregator {
  aggregate(
    transactions: Transaction[],
    incomeCategories: Set<string>,
    investmentSavingsCategories: Set<string>
  ): MonthData[] {
    const monthlyData: Record<string, MonthData> = {};

    transactions.forEach((transaction) => {
      if (transaction.transfer_id && !transaction.category) {
        // # Reason: Transfers move funds between internal accounts and should not affect income, expenses, or counts.
        // If the transfer moves between on-budget and off-budget accounts, we may handle it differently later.
        return;
      }

      const transactionMonth = getTransactionMonth(transaction.date);

      if (!monthlyData[transactionMonth.key]) {
        monthlyData[transactionMonth.key] = {
          year: transactionMonth.year,
          month: transactionMonth.month,
          income: 0,
          expenses: 0,
          investments: 0,
          transactions: 0,
        };
      }

      const isIncome = transaction.category ? incomeCategories.has(transaction.category) : false;
      const isInvestmentOrSavings = transaction.category
        ? investmentSavingsCategories.has(transaction.category)
        : false;

      if (isIncome || transaction.amount > 0) {
        monthlyData[transactionMonth.key].income += Math.abs(transaction.amount);
      } else if (isInvestmentOrSavings) {
        monthlyData[transactionMonth.key].investments += Math.abs(transaction.amount);
      } else {
        monthlyData[transactionMonth.key].expenses += Math.abs(transaction.amount);
      }

      monthlyData[transactionMonth.key].transactions += 1;
    });

    return Object.values(monthlyData).sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));
  }
}
