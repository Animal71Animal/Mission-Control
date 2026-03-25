import MarkdownPage from "@/components/MarkdownPage";

export default function VideoPromptsPage() {
  return (
    <MarkdownPage
      filePath="app/docs/video-prompts.md"
      backHref="/artists"
      backLabel="Back to Artists"
    />
  );
}
