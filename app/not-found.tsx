import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 pt-20">
            <div className="px-4 text-center">
                <h1 className="text-brand-dark mb-4 text-6xl font-bold">404</h1>
                <h2 className="mb-4 text-2xl font-semibold text-gray-700">Page not found</h2>
                <p className="mx-auto mb-8 max-w-md text-gray-600">
                    We could not find this page. Check the address or return to the home page.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Link
                        href="/"
                        className="bg-brand-dark hover:bg-brand-light rounded-lg px-6 py-3 font-medium text-white transition-colors"
                    >
                        Go home
                    </Link>
                    <Link
                        href="/#contact"
                        className="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
                    >
                        Contact us
                    </Link>
                </div>
            </div>
        </div>
    );
}
