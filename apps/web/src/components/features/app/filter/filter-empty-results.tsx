export function FilterEmptyResults() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center">
      <span className="i-hugeicons-list-search text-4xl text-muted-foreground" />
      <p className="mt-3 font-medium">No matching content</p>
      <p className="text-muted-foreground text-sm">
        Try another title, description, or author.
      </p>
    </div>
  );
}
