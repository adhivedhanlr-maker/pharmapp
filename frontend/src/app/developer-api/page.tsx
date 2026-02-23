export default function DeveloperApiPage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-10 space-y-4">
            <h1 className="text-3xl font-black">Developer API</h1>
            <p className="text-slate-600">Backend API base URL: <code>/api</code></p>
            <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li><code>POST /auth/login</code> and <code>POST /auth/register</code></li>
                <li><code>GET /orders/retailer</code>, <code>GET /orders/distributor</code>, <code>GET /orders/salesman</code></li>
                <li><code>GET /inventory/search/marketplace</code></li>
                <li><code>GET /auth/me</code> for role profile IDs</li>
            </ul>
        </main>
    );
}
