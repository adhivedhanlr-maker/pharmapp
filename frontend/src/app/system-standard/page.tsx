export default function SystemStandardPage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-10 space-y-4">
            <h1 className="text-3xl font-black">System Standard</h1>
            <p className="text-slate-600">Pharmaflow follows role-based access, auditable order flow, and GST-aware billing workflows across distributor and retailer operations.</p>
            <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>Role-based APIs protected by JWT.</li>
                <li>Inventory sourced from distributor-level stock records.</li>
                <li>Order lifecycle: PENDING, ACCEPTED, SHIPPED, DELIVERED, CANCELLED.</li>
            </ul>
        </main>
    );
}
