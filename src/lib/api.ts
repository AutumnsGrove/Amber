/**
 * Amber API Client
 * Frontend API wrapper for storage operations
 */

import type { StorageFile, QuotaStatus, UsageBreakdown, StorageExport } from '$types';

const API_BASE = '/api/storage';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Request failed' };
    }

    return { data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Network error' };
  }
}

// ============== Storage Info ==============

export interface StorageInfoResponse {
  quota: QuotaStatus;
  breakdown: UsageBreakdown[];
}

export async function getStorageInfo(): Promise<ApiResponse<StorageInfoResponse>> {
  return request<StorageInfoResponse>('');
}

// ============== Files ==============

export interface FilesResponse {
  files: StorageFile[];
  total: number;
  limit: number;
  offset: number;
}

export interface FilesOptions {
  product?: string;
  category?: string;
  search?: string;
  sort?: 'created_at' | 'size_bytes' | 'filename';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export async function getFiles(options: FilesOptions = {}): Promise<ApiResponse<FilesResponse>> {
  const params = new URLSearchParams();
  if (options.product) params.set('product', options.product);
  if (options.category) params.set('category', options.category);
  if (options.search) params.set('search', options.search);
  if (options.sort) params.set('sort', options.sort);
  if (options.order) params.set('order', options.order);
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.offset) params.set('offset', options.offset.toString());

  const query = params.toString();
  return request<FilesResponse>(`/files${query ? `?${query}` : ''}`);
}

export async function getFile(id: string): Promise<ApiResponse<StorageFile>> {
  return request<StorageFile>(`/files/${id}`);
}

export async function deleteFile(
  id: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  return request(`/files/${id}`, { method: 'DELETE' });
}

export async function restoreFile(
  id: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  return request(`/files/${id}/restore`, { method: 'POST' });
}

// ============== Trash ==============

export interface TrashResponse {
  files: StorageFile[];
  total_size: number;
}

export async function getTrash(): Promise<ApiResponse<TrashResponse>> {
  return request<TrashResponse>('/trash');
}

export async function emptyTrash(): Promise<
  ApiResponse<{ success: boolean; deleted_count: number; freed_bytes: number }>
> {
  return request('/trash', { method: 'DELETE' });
}

export async function permanentlyDeleteFile(
  id: string
): Promise<ApiResponse<{ success: boolean; freed_bytes: number }>> {
  return request(`/trash/${id}`, { method: 'DELETE' });
}

// ============== Exports ==============

export interface CreateExportRequest {
  type: 'full' | 'blog' | 'ivy' | 'category';
  filters?: Record<string, string>;
}

export interface ExportResponse {
  export_id: string;
  status: string;
  message?: string;
}

export async function createExport(
  req: CreateExportRequest
): Promise<ApiResponse<ExportResponse>> {
  return request<ExportResponse>('/export', {
    method: 'POST',
    body: JSON.stringify(req)
  });
}

export async function getExport(id: string): Promise<ApiResponse<StorageExport>> {
  return request<StorageExport>(`/export/${id}`);
}

export async function getExportDownload(
  id: string
): Promise<ApiResponse<{ download_url: string; expires_at: string }>> {
  return request(`/export/${id}/download`);
}

// ============== Add-ons ==============

export interface AddonsResponse {
  available: Array<{
    type: string;
    gb: number;
    price_cents: number;
    price_display: string;
  }>;
  purchased: Array<{
    id: string;
    addon_type: string;
    gb_amount: number;
    active: boolean;
    created_at: string;
  }>;
}

export async function getAddons(): Promise<ApiResponse<AddonsResponse>> {
  return request<AddonsResponse>('/addons');
}

export async function purchaseAddon(
  addonType: string
): Promise<ApiResponse<{ message: string; redirect_url: string }>> {
  return request('/addons', {
    method: 'POST',
    body: JSON.stringify({ addon_type: addonType })
  });
}

export async function cancelAddon(
  id: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  return request(`/addons/${id}`, { method: 'DELETE' });
}

// ============== Download ==============

export function getDownloadUrl(r2Key: string): string {
  return `${API_BASE}/download/${encodeURIComponent(r2Key)}`;
}
