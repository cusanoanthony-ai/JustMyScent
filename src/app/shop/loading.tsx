export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-4 motion-reduce:animate-none">
        <div className="h-8 w-48 bg-espresso/10" />
        <div className="h-4 w-full max-w-xl bg-espresso/10" />
        <div className="grid gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="aspect-[4/5] bg-espresso/10" />
          ))}
        </div>
      </div>
    </div>
  );
}
