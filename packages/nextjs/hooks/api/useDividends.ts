import { useQuery } from "@tanstack/react-query";
import { dividendEndpoints } from "~~/services/web2/endpoints";

export const useDividend = (enabled = true) => {
  return useQuery({
    queryKey: ["dividend"],
    queryFn: () => dividendEndpoints.getDividend(),
    enabled,
  });
};

export const useDividendHistory = (page = 1, pageSize = 10, enabled = true) => {
  return useQuery({
    queryKey: ["dividendHistory", page, pageSize],
    queryFn: () => dividendEndpoints.getDividendHistory(page, pageSize),
    enabled,
  });
};
