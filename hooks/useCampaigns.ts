import { useState, useCallback } from "react";
import { Campaign as FullCampaign } from "@/types/campaign";

// Legacy campaign type from the API response
interface LegacyCampaign {
  id: string;
  job_role: string;
  status: "draft" | "active" | "inactive";
  created_at: string;
  is_deleted?: boolean;
  deleted_at?: string;
}

// Export both types for use in components
export type { LegacyCampaign };

interface UseCampaignsReturn {
  campaigns: LegacyCampaign[];
  loading: boolean;
  error: string | null;
  fetchCampaigns: () => Promise<void>;
}

export function useCampaigns(authToken?: string): UseCampaignsReturn {
  const [campaigns, setCampaigns] = useState<LegacyCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!authToken) {
      console.log("[useCampaigns] No auth token provided");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

      if (!TENANT_ID) {
        throw new Error("Missing TENANT_ID configuration");
      }

      console.log("[useCampaigns] Fetching campaigns from API route...");

      const response = await fetch(`/api/campaigns/get`, {
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
          errorData?.error || `Failed to fetch campaigns: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("[useCampaigns] Response:", result);

      if (result.success && result.data?.campaigns) {
        setCampaigns(result.data.campaigns);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("[useCampaigns] Error:", err);
      const errorMsg = err?.message || "Failed to fetch campaigns";
      setError(errorMsg);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
  };
}
