import { useState, useEffect, useCallback, useRef } from 'react';
import { adminApi } from '../services/adminApi';
import { StudentRecord, RecordFilters, PaginatedResponse } from '../types';

const DEFAULT_PAGE_SIZE = 50;
const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

export const useRecords = () => {
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecordFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response: PaginatedResponse<StudentRecord> = await adminApi.getRecords({
        ...filters,
        page: currentPage,
        pageSize,
      });

      setRecords(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalRecords(response.pagination.totalRecords);
      setCurrentPage(response.pagination.currentPage);
    } catch (err) {
      console.error('Failed to fetch records:', err);
      setError('Failed to load records');
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  // Initial fetch and refetch when dependencies change
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    autoRefreshTimerRef.current = setInterval(() => {
      fetchRecords();
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, [fetchRecords]);

  const handleSearch = useCallback((searchTerm: string) => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm || undefined,
    }));
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const handleFilterChange = useCallback((newFilters: RecordFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const refresh = useCallback(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    isLoading,
    error,
    filters,
    currentPage,
    totalPages,
    totalRecords,
    pageSize,
    handleSearch,
    handleFilterChange,
    handlePageChange,
    refresh,
  };
};
