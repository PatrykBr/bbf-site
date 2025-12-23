import Link from "next/link";
import { Header, Footer } from "@/components";

export default function NotFound() {
    return (
        <>
            <Header />
            <main className="flex min-h-screen items-center justify-center bg-gray-50 pt-20">
                <div className="px-4 text-center">
                    <h1 className="text-brand-dark mb-4 text-6xl font-bold">404</h1>
                    <h2 className="mb-4 text-2xl font-semibold text-gray-700">Work Not Found</h2>
                    <p className="mx-auto mb-8 max-w-md text-gray-600">
                        Sorry, we couldn&apos;t find the project you&apos;re looking for. It may have been removed or
                        the link is incorrect.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            href="/#work"
                            className="bg-brand-dark hover:bg-brand-light rounded-lg px-6 py-3 font-medium text-white transition-colors"
                        >
                            View All Work
                        </Link>
                        <Link
                            href="/"
                            className="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
