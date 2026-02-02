export function FeedEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <span className="i-hugeicons-image-not-found-01 text-4xl" />
      <p className="mt-2">No items found</p>
    </div>
  );
}
