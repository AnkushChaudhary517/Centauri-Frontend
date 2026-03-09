import { AnalysisRequest, RecommendationResponse } from '@/services/seoAnalysis';
import { pollRecommendations } from '@/utils/exportSeoReport';
import { useState, useEffect } from 'react';

export function useRecommendations(request: AnalysisRequest | null) {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!request) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await pollRecommendations(request);
        if (result) {
          setData(result);
        } else {
          setError("Timeout: Recommendations not found");
        }
      } catch (err) {
        setError("Failed to fetch recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [request]);

  return { data, loading, error };
}