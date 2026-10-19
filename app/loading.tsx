export default function Loading() {
    return (
        <div role="status" className="bg-background flex min-h-screen items-center justify-center">
            <span className="sr-only">Loading...</span>
            <div className="bg-brand-dark size-10 animate-spin rounded-full border-4 border-gray-200 border-t-transparent" />
        </div>
    );
}
