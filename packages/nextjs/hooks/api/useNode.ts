import { useQuery } from "@tanstack/react-query";
import { nodeEndpoints } from "~~/services/web2/endpoints";

/**
 * 获取我的节点列表 Hook
 */
export const useNodeList = () => {
  return useQuery({
    queryKey: ["node-list"],
    queryFn: () => nodeEndpoints.getNodeList(),
  });
};
