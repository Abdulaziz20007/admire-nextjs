import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/Admin/ProtectedRoute";
import PermissionGuard from "@/components/Admin/PermissionGuard";
import AdminLayout from "@/components/Admin/AdminLayout";
import GlobalBackground from "@/components/GlobalBackground";
import { useApi } from "@/hooks/useApi";
import { IWeb } from "@/types/database";
import ContentEditor from "@/components/Admin/ContentEditor";
import ContentPreview from "@/components/Admin/ContentPreview";
import styles from "./Content.module.scss";

export default function ContentManagementPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [webContent, setWebContent] = useState<IWeb | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Stable callback functions to prevent infinite re-renders
  const handleFetchSuccess = useCallback((data: IWeb) => {
    setWebContent(data);
  }, []);

  const handleFetchError = useCallback((error: string) => {
    console.error("Failed to fetch web content:", error);
  }, []);

  const handleSaveSuccess = useCallback((data: IWeb) => {
    setWebContent(data);
    setHasUnsavedChanges(false);
  }, []);

  const handleSaveError = useCallback((error: string) => {
    console.error("Failed to save web content:", error);
  }, []);

  const {
    loading: loadingContent,
    error: loadError,
    get: fetchContent,
  } = useApi<IWeb>({
    onSuccess: handleFetchSuccess,
    onError: handleFetchError,
  });

  const {
    loading: saving,
    error: saveError,
    put: saveContent,
  } = useApi<IWeb>({
    onSuccess: handleSaveSuccess,
    onError: handleSaveError,
  });

  // Stable retry function
  const handleRetry = useCallback(() => {
    fetchContent("/admin/web");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to prevent infinite loops

  // Fetch content on component mount - use empty dependency array
  useEffect(() => {
    fetchContent("/admin/web");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  const handleContentChange = (updatedContent: Partial<IWeb>) => {
    if (webContent) {
      setWebContent({ ...webContent, ...updatedContent } as IWeb);
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = async () => {
    if (webContent) {
      await saveContent("/admin/web", webContent);
    }
  };

  return (
    <>
      <GlobalBackground />
      <ProtectedRoute>
        <PermissionGuard
          requiredPermission="canModifyContent"
          fallbackMessage="You need Content Manager privileges or higher to manage content."
          redirectTo="/admin"
        >
          <AdminLayout title="Content Management">
            <div className={`${styles.contentPage} ${styles[theme]}`}>
              {/* Header */}
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Landing Page Content</h2>
                <div className={styles.headerActions}>
                  <div className={styles.tabButtons}>
                    <button
                      className={`${styles.tabButton} ${
                        activeTab === "editor" ? styles.active : ""
                      }`}
                      onClick={() => setActiveTab("editor")}
                    >
                      Editor
                    </button>
                    <button
                      className={`${styles.tabButton} ${
                        activeTab === "preview" ? styles.active : ""
                      }`}
                      onClick={() => setActiveTab("preview")}
                    >
                      Preview
                    </button>
                  </div>
                  <button
                    className={`${styles.saveButton} ${
                      hasUnsavedChanges ? styles.hasChanges : ""
                    }`}
                    onClick={handleSave}
                    disabled={saving || !hasUnsavedChanges}
                  >
                    {saving
                      ? "Saving..."
                      : hasUnsavedChanges
                      ? "Save Changes"
                      : "Saved"}
                  </button>
                </div>
              </div>

              {/* Content */}
              {loadingContent ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>Loading content...</p>
                </div>
              ) : loadError ? (
                <div className={styles.errorState}>
                  <p>Error loading content: {loadError}</p>
                  <button onClick={handleRetry}>Retry</button>
                </div>
              ) : webContent ? (
                <div className={styles.contentContainer}>
                  {activeTab === "editor" ? (
                    <ContentEditor
                      content={webContent}
                      onChange={handleContentChange}
                      saving={saving}
                      error={saveError}
                    />
                  ) : (
                    <ContentPreview content={webContent} />
                  )}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>
                    No content found. Create initial content to get started.
                  </p>
                </div>
              )}
            </div>
          </AdminLayout>
        </PermissionGuard>
      </ProtectedRoute>
    </>
  );
}
