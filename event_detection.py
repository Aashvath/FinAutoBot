import pandas as pd
import numpy as np
from tabulate import tabulate  # For pretty printing tables
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/analyze-transactions")
async def analyze_transactions_api():
    try:
        analysis_result = analyze_transactions()
        with open("out.txt", "w") as f:
            f.write(analysis_result)  # Write the output to out.txt
        return {"status": "success", "analysis": analysis_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def analyze_transactions(top_n=5):
    # Always use uploads/data.csv
    csv_path = "uploads/data.csv"
    output = []

    try:
        # 1. Read CSV data
        df = pd.read_csv(csv_path)

        # 2. Parse Date and create MonthYear
        df['Date'] = pd.to_datetime(df['Date'])
        df['MonthYear'] = df['Date'].dt.to_period('M')  # e.g. 2021-01, 2021-02, etc.

        # 3. Ensure numeric columns
        df['Credit']  = pd.to_numeric(df['Credit'],  errors='coerce').fillna(0)
        df['Debit']   = pd.to_numeric(df['Debit'],   errors='coerce').fillna(0)
        df['Balance'] = pd.to_numeric(df['Balance'], errors='coerce').fillna(0)

        # 4. Create helper columns
        df['Inflow']  = df['Credit']
        df['Outflow'] = df['Debit']
        df['Amount']  = df['Credit'] - df['Debit']  # net: + for inflow, - for outflow

        # A) MONTHLY AGGREGATES (OVERALL)
        monthly_agg = (
            df.groupby('MonthYear', as_index=False)
              .agg({
                   'Balance'          : 'last',     # Last balance in the month
                   'Transaction Detail': 'count',   # count transactions
                   'Amount'           : lambda x: x.abs().sum(),
                   'Inflow'           : 'sum',
                   'Outflow'          : 'sum'
              })
              .rename(columns={
                   'Transaction Detail': 'cat_count',
                   'Amount'           : 'cat_amount',
                   'Inflow'           : 'cat_inflow',
                   'Outflow'          : 'cat_outflow'
              })
        )

        # B) MONTHLY CATEGORY/SUBCATEGORY AGGREGATES
        cat_subcat_agg = (
            df.groupby(['MonthYear', 'Category', 'Subcategory'], as_index=False)
              .agg({
                  'Transaction Detail': 'count',
                  'Amount' : lambda x: x.abs().sum(),
                  'Inflow' : 'sum',
                  'Outflow': 'sum'
              })
              .rename(columns={
                  'Transaction Detail': 'subcat_count',
                  'Amount'           : 'subcat_amount',
                  'Inflow'           : 'subcat_inflow',
                  'Outflow'          : 'subcat_outflow'
              })
        )

        # C) RECURRING TRANSACTIONS
        # A transaction detail is considered recurring if it appears in > 2 distinct months
        detail_month_counts = (
            df.groupby('Transaction Detail')['MonthYear']
              .nunique()
              .reset_index(name='DistinctMonthCount')
        )
        recurring_details = detail_month_counts[detail_month_counts['DistinctMonthCount'] > 2]
        recurring_set = set(recurring_details['Transaction Detail'])

        # D) MONTHLY COUNTS & % CHANGE FOR RECURRING TRANSACTIONS
        recurring_df = df[df['Transaction Detail'].isin(recurring_set)]
        monthly_recurring_counts = (
            recurring_df.groupby(['Transaction Detail', 'MonthYear'])
                        .size()
                        .reset_index(name='DetailCount')
        ).sort_values(['Transaction Detail','MonthYear'])

        # Calculate previous month count and exact % change
        monthly_recurring_counts['PrevDetailCount'] = (
            monthly_recurring_counts.groupby('Transaction Detail')['DetailCount'].shift(1)
        )

        monthly_recurring_counts['PctChange'] = (
            (monthly_recurring_counts['DetailCount'] - monthly_recurring_counts['PrevDetailCount'])
            / monthly_recurring_counts['PrevDetailCount'].replace(0, np.nan)  # avoid div by zero
        ) * 100

        # Round to 2 decimals
        monthly_recurring_counts['PctChange'] = monthly_recurring_counts['PctChange'].round(2)

        # Label Increase or Decrease
        def label_change(pct):
            if pd.isna(pct):
                return ""
            elif pct > 0:
                return f"{pct}% inc"
            elif pct < 0:
                return f"{abs(pct)}% dec"
            else:
                return "0%"

        monthly_recurring_counts['ChangeLabel'] = monthly_recurring_counts['PctChange'].apply(label_change)

        # E) LARGE SINGLE TRANSACTION CHECK (≥ 50% of group total)
        def largest_txn_ratio(group):
            total_sum = group['Amount'].abs().sum()
            max_txn   = group['Amount'].abs().max()
            if total_sum == 0:
                return 0
            else:
                return max_txn / total_sum

        large_txn_df = (
            df.groupby(['MonthYear','Category','Subcategory'], as_index=False)
              .apply(largest_txn_ratio)
              .rename(columns={None: 'LargestTxnRatio'})
        )
        large_txn_df['HasLargeSingleTxn'] = large_txn_df['LargestTxnRatio'] >= 0.5

        # ============== BUILD REPORT STRING (TOP 5 ROWS ONLY) ==============
        output.append("=== MONTHLY AGGREGATES (Overall) [Top 5 Rows] ===")
        output.append(tabulate(monthly_agg.head(top_n), headers='keys', tablefmt='psql', showindex=False))

        output.append("\n=== MONTHLY CATEGORY/SUBCATEGORY AGGREGATES [Top 5 Rows] ===")
        output.append(tabulate(cat_subcat_agg.head(top_n), headers='keys', tablefmt='psql', showindex=False))

        # Show recurring set if available
        if recurring_set:
            output.append(f"\nRecurring Transaction Details (Set Notation): {recurring_set}")
        else:
            output.append("\nNo recurring transaction details found (more than 2 distinct months).")

        # Separate tables for increases and decreases in recurring transactions
        inc_changes = monthly_recurring_counts[monthly_recurring_counts['PctChange'] > 0].sort_values('PctChange', ascending=False).head(top_n)
        dec_changes = monthly_recurring_counts[monthly_recurring_counts['PctChange'] < 0].sort_values('PctChange').head(top_n)

        output.append("\n=== RECURRING TRANSACTIONS MONTH-TO-MONTH INCREASES (Exact % Change) ===")
        if inc_changes.empty:
            output.append("No increasing recurring transactions.")
        else:
            output.append(tabulate(inc_changes, headers='keys', tablefmt='psql', showindex=False))

        output.append("\n=== RECURRING TRANSACTIONS MONTH-TO-MONTH DECREASES (Exact % Change) ===")
        if dec_changes.empty:
            output.append("No decreasing recurring transactions.")
        else:
            output.append(tabulate(dec_changes, headers='keys', tablefmt='psql', showindex=False))

        output.append("\n=== LARGE SINGLE TRANSACTIONS (≥50% of Group Total) [Top 5 Rows] ===")
        output.append(tabulate(large_txn_df.head(top_n), headers='keys', tablefmt='psql', showindex=False))

        # ============ OPTIONAL SUMMARY =============
        summary_parts = []
        if recurring_set:
            summary_parts.append(f"Recurring transactions found for details: {recurring_set}.")

        # Summaries for biggest increases/decreases among recurring (≥50% change)
        sig_changes = monthly_recurring_counts[monthly_recurring_counts['PctChange'].abs() >= 50].copy()
        if not sig_changes.empty:
            inc_details = sig_changes[sig_changes['PctChange'] > 0]['Transaction Detail'].unique()
            dec_details = sig_changes[sig_changes['PctChange'] < 0]['Transaction Detail'].unique()
            if len(inc_details):
                summary_parts.append(f"Significant (≥50%) increases for recurring details: {set(inc_details)}.")
            if len(dec_details):
                summary_parts.append(f"Significant (≥50%) decreases for recurring details: {set(dec_details)}.")

        # Large single transaction summary
        large_txn_flagged = large_txn_df[large_txn_df['HasLargeSingleTxn'] == True]
        if not large_txn_flagged.empty:
            flagged_list = large_txn_flagged[['MonthYear','Category','Subcategory']].values.tolist()
            text_list = [f"{m} - {c}/{s}" for (m, c, s) in flagged_list]
            summary_parts.append(
                "Large single txn (≥50% of monthly total) found in:\n" + ", ".join(text_list)
            )

        summary = "\n".join(summary_parts) if summary_parts else "No significant patterns found."
        output.append("\n=== SUMMARY ===")
        output.append(summary)
        
        # Join all output strings and return
        return "\n".join(output)
    except Exception as e:
        return f"Error analyzing transactions: {str(e)}"

if __name__ == '__main__':
    # Example usage - now returns string instead of printing
    result = analyze_transactions(top_n=5)
    print(result)  # Only for direct script execution