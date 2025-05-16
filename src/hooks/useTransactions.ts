import { useQuery } from "@tanstack/react-query";
import { Transaction } from "client/shared/schema";

export function useTransactions() {
  return useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
}
