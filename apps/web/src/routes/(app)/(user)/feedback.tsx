import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { FeedbackDataTable } from "@/components/features/app/feedback/data-table";
import { EditFeedbackDialog } from "@/components/features/app/feedback/edit-dialog";
import type {
  FeedbackRow,
  FeedbackStatus,
} from "@/components/features/app/feedback/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/lib/orpc";
import { authQueryOptions } from "@/lib/queries";
import { createPageMeta } from "@/lib/seo";
import { feedbackDialog } from "@/stores/handlers";

const feedbackMeta = createPageMeta({
  title: "My Feedback",
  description: "Review and manage the feedback you have shared.",
  url: "/feedback",
  noIndex: true,
});

export const Route = createFileRoute("/(app)/(user)/feedback")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(authQueryOptions());
    if (!user) {
      throw redirect({ to: "/signin" });
    }
  },
  component: FeedbackComponent,
  head: () => ({
    meta: feedbackMeta.meta,
    links: feedbackMeta.links,
  }),
});

function FeedbackComponent() {
  const [activeTab, setActiveTab] = useState<FeedbackStatus>("ALL");
  const [editingFeedback, setEditingFeedback] = useState<FeedbackRow | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: submissions = [], isLoading } = useQuery(
    orpc.app.feedback.list.queryOptions()
  );

  // Filter submissions by status
  const filteredSubmissions = useMemo(() => {
    if (activeTab === "ALL") {
      return submissions;
    }
    return submissions.filter((s) => s.status === activeTab);
  }, [submissions, activeTab]);

  // Count by status
  const counts = useMemo(
    () => ({
      ALL: submissions.length,
      PENDING: submissions.filter((s) => s.status === "PENDING").length,
      REPLIED: submissions.filter((s) => s.status === "REPLIED").length,
    }),
    [submissions]
  );

  const handleEdit = useCallback((feedback: FeedbackRow) => {
    setEditingFeedback(feedback);
    setEditDialogOpen(true);
  }, []);

  const handleEditDialogChange = useCallback((open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setEditingFeedback(null);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-balance font-bold text-2xl">My Feedback</h1>

      <Tabs
        onValueChange={(value) => setActiveTab(value as FeedbackStatus)}
        value={activeTab}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="ALL">All ({counts.ALL})</TabsTrigger>
            <TabsTrigger value="PENDING">
              Pending ({counts.PENDING})
            </TabsTrigger>
            <TabsTrigger value="REPLIED">
              Replied ({counts.REPLIED})
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => feedbackDialog.openWithPayload(undefined)}>
            Create Feedback
          </Button>
        </div>

        <TabsContent value="ALL">
          <FeedbackDataTable
            data={filteredSubmissions}
            isLoading={isLoading}
            onEdit={handleEdit}
            status="ALL"
          />
        </TabsContent>

        <TabsContent value="PENDING">
          <FeedbackDataTable
            data={filteredSubmissions}
            isLoading={isLoading}
            onEdit={handleEdit}
            status="PENDING"
          />
        </TabsContent>

        <TabsContent value="REPLIED">
          <FeedbackDataTable
            data={filteredSubmissions}
            isLoading={isLoading}
            onEdit={handleEdit}
            status="REPLIED"
          />
        </TabsContent>
      </Tabs>

      <EditFeedbackDialog
        onOpenChange={handleEditDialogChange}
        open={editDialogOpen}
        submission={editingFeedback}
      />
    </div>
  );
}
