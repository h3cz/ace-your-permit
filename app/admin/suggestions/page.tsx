import { AdminFeatureRequestsClient } from "@/components/feedback/admin-feature-requests-client";

export const metadata = {
  title: "Suggestion Review - Ace Your Permit",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminSuggestionsPage() {
  return <AdminFeatureRequestsClient />;
}
