import { AnalysisRequest, RecommendationResponse, getRecommendations } from '@/services/seoAnalysis';
import { environment } from '@/config/environment';
import { pollRecommendations } from '@/utils/exportSeoReport';
import { useState, useEffect, useRef } from 'react';

export function useRecommendations(request: AnalysisRequest | null, requestKey?: string | null) {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastResolvedRequestKey = useRef<string | null>(null);

  const effectiveRequestKey =
    requestKey ||
    (request
      ? JSON.stringify({
          article: request.Article?.Raw,
          primaryKeyword: request.PrimaryKeyword,
          metaTitle: request.MetaTitle,
          metaDescription: request.MetaDescription,
          url: request.Url,
        })
      : null);

  useEffect(() => {
    if (!request || !effectiveRequestKey) {
      setData(null);
      setLoading(false);
      setError(null);
      lastResolvedRequestKey.current = null;
      return;
    }

    if (lastResolvedRequestKey.current === effectiveRequestKey && data) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = environment.useMockApi
          ? await getRecommendations(request)
          : await pollRecommendations(request);
        if (result) {
          setData(result);
          lastResolvedRequestKey.current = effectiveRequestKey;
        } else {
          setData(null);
          setError("Timeout: Recommendations not found");
        }
      } catch (err) {
        setData(null);
        setError("Failed to fetch recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [request, effectiveRequestKey, data]);

  return { data, loading, error };
}
