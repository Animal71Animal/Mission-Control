"use client";

import { useEffect, useMemo, useState } from 'react';

interface DriveFolder {
  id: string;
  name: string;
  modifiedTime: string | null;
  webViewLink: string | null;
  shared: boolean;
  owner: string | null;
}

interface BreadcrumbSegment {
  id: string;
  name: string;
}

const DEFAULT_BREADCRUMB: BreadcrumbSegment[] = [{ id: 'root', name: 'My Drive' }];
const OWNER_HIDE_SET = new Set([
  'Eric Mills',
  'ericmills71@gmail.com',
  'Eric Mills / ericmills71@gmail.com',
]);

function formatDate(iso: string | null) {
  if (!iso) {
    return 'Unknown';
  }

  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function shouldShowOwner(owner: string | null) {
  if (!owner) {
    return false;
  }

  return !OWNER_HIDE_SET.has(owner);
}

export default function DrivePage() {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbSegment[]>(DEFAULT_BREADCRUMB);

  useEffect(() => {
    let cancelled = false;

    async function loadFolders() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/drive?folderId=${encodeURIComponent(currentFolderId)}`, {
          cache: 'no-store',
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to load Google Drive folders');
        }

        if (!cancelled) {
          setFolders(Array.isArray(payload?.folders) ? payload.folders : []);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setFolders([]);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Failed to load Google Drive folders. DRIVE_TOKEN_JSON env var required.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadFolders();

    return () => {
      cancelled = true;
    };
  }, [currentFolderId]);

  const currentFolderName = useMemo(
    () => breadcrumb[breadcrumb.length - 1]?.name || 'My Drive',
    [breadcrumb],
  );

  const openFolder = (folder: DriveFolder) => {
    setBreadcrumb((current) => {
      const existingIndex = current.findIndex((segment) => segment.id === folder.id);
      if (existingIndex >= 0) {
        return current.slice(0, existingIndex + 1);
      }

      return [...current, { id: folder.id, name: folder.name }];
    });
    setCurrentFolderId(folder.id);
  };

  const openBreadcrumb = (segment: BreadcrumbSegment, index: number) => {
    setBreadcrumb((current) => current.slice(0, index + 1));
    setCurrentFolderId(segment.id);
  };

  const goBack = () => {
    if (breadcrumb.length <= 1) {
      return;
    }

    const nextBreadcrumb = breadcrumb.slice(0, -1);
    const previous = nextBreadcrumb[nextBreadcrumb.length - 1];
    setBreadcrumb(nextBreadcrumb);
    setCurrentFolderId(previous.id);
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">📁 Google Drive</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Browse Eric&apos;s Drive folders with OAuth user auth. Read-only by design.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            {breadcrumb.map((segment, index) => {
              const isLast = index === breadcrumb.length - 1;
              return (
                <div key={segment.id} className="flex items-center gap-2">
                  {index > 0 && <span className="text-zinc-600">/</span>}
                  {isLast ? (
                    <span className="text-zinc-200">{segment.name}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openBreadcrumb(segment, index)}
                      className="text-cyan-300 transition hover:text-cyan-200"
                    >
                      {segment.name}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          {currentFolderId !== 'root' && (
            <button
              type="button"
              onClick={goBack}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:border-cyan-500/50 hover:text-cyan-300"
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            onClick={() => setCurrentFolderId((current) => current)}
            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/20"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          <div className="font-medium">Unable to load Google Drive folders</div>
          <div className="mt-1">{error}</div>
          <div className="mt-2 text-red-300/80">
            Hint: the DRIVE_TOKEN_JSON env var is required on Vercel and must contain OAuth user tokens.
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5"
            >
              <div className="mb-4 h-5 w-24 rounded bg-zinc-800" />
              <div className="mb-3 h-6 w-3/4 rounded bg-zinc-800" />
              <div className="mb-2 h-4 w-1/2 rounded bg-zinc-800" />
              <div className="h-4 w-2/3 rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : folders.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center">
          <div className="text-4xl">📁</div>
          <div className="mt-4 text-lg font-medium text-zinc-100">No folders found</div>
          <p className="mt-2 text-sm text-zinc-400">
            {currentFolderId === 'root'
              ? 'My Drive root is empty or the OAuth token does not have visibility into any folders yet.'
              : `The folder “${currentFolderName}” does not contain any visible subfolders.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 shadow-[0_0_0_1px_rgba(34,211,238,0.03)] transition hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.08)]"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="text-3xl">📁</div>
                <div className="flex items-center gap-2">
                  {folder.shared && (
                    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-300">
                      Shared
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => openFolder(folder)}
                className="block w-full truncate text-left text-lg font-semibold text-zinc-100 transition hover:text-cyan-300"
                title={folder.name}
              >
                {folder.name}
              </button>

              <div className="mt-3 space-y-2 text-sm text-zinc-400">
                <div>
                  <span className="text-zinc-500">Modified:</span>{' '}
                  <span className="text-zinc-300">{formatDate(folder.modifiedTime)}</span>
                </div>
                {shouldShowOwner(folder.owner) && (
                  <div>
                    <span className="text-zinc-500">Owner:</span>{' '}
                    <span className="text-zinc-300">{folder.owner}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => openFolder(folder)}
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-cyan-500/50 hover:text-cyan-300"
                >
                  Open folder
                </button>
                <a
                  href={folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-300 transition hover:text-cyan-200"
                >
                  View in Drive ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
