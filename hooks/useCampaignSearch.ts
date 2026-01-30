import { useState, useCallback } from "react";
import {
  Campaign,
  CampaignSearchFilters,
  CampaignSearchResponse,
  buildCampaignSearchUrl,
} from "@/types/campaign";

interface UseCampaignSearchReturn {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  pagination: CampaignSearchResponse["pagination"] | null;
  filtersApplied: Record<string, any>;
  sort: CampaignSearchResponse["sort"] | null;
  searchCampaigns: (filters: CampaignSearchFilters) => Promise<void>;
  resetSearch: () => void;
}

export function useCampaignSearch(
  authToken?: string
): UseCampaignSearchReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<CampaignSearchResponse["pagination"] | null>(null);
  const [filtersApplied, setFiltersApplied] = useState<Record<string, any>>(
    {}
  );
  const [sort, setSort] = useState<CampaignSearchResponse["sort"] | null>(null);

  const searchCampaigns = useCallback(
    async (filters: CampaignSearchFilters) => {
      if (!authToken) {
        console.log("[useCampaignSearch] No auth token provided");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

        if (!TENANT_ID) {
          throw new Error("Missing TENANT_ID configuration");
        }

        const queryString = buildCampaignSearchUrl(filters);
        console.log(
          "[useCampaignSearch] Searching campaigns with filters:",
          filters
        );

        const response = await fetch(`/api/campaigns/search?${queryString}`, {
          method: "GET",
          headers: {
            "tenant-id": TENANT_ID,
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData?.error ||
              `Failed to search campaigns: ${response.status}`
          );
        }

        const result: CampaignSearchResponse = await response.json();
        console.log("[useCampaignSearch] Response:", result);

        if (result.success && result.data?.campaigns) {
          setCampaigns(result.data.campaigns);
          setPagination(result.pagination);
          setFiltersApplied(result.filters_applied || {});
          setSort(result.sort || null);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err: any) {
        console.error("[useCampaignSearch] Error:", err);
        const errorMsg = err?.message || "Failed to search campaigns";
        setError(errorMsg);
        setCampaigns([]);
        setPagination(null);
        setFiltersApplied({});
        setSort(null);
      } finally {
        setLoading(false);
      }
    },
    [authToken]
  );

  const resetSearch = useCallback(() => {
    setCampaigns([]);
    setError(null);
    setPagination(null);
    setFiltersApplied({});
    setSort(null);
  }, []);

  return {
    campaigns,
    loading,
    error,
    pagination,
    filtersApplied,
    sort,
    searchCampaigns,
    resetSearch,
  };
}
