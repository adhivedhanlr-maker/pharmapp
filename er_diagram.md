# Pharma Marketplace ER Diagram

```mermaid
erDiagram
    USER ||--o| DISTRIBUTOR : "is a"
    USER ||--o| RETAILER : "is a"
    USER ||--o| SALESMAN : "is a"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ AUDIT_LOG : "generates"

    DISTRIBUTOR ||--o{ DISTRIBUTOR_PRODUCT : "stocks"
    DISTRIBUTOR ||--o{ ORDER : "receives"
    DISTRIBUTOR ||--o{ SALESMAN : "manages"
    DISTRIBUTOR ||--o{ SUBSCRIPTION : "has"

    PRODUCT ||--o{ DISTRIBUTOR_PRODUCT : "referenced in"

    RETAILER ||--o{ ORDER : "places"
    RETAILER ||--o{ PRESCRIPTION : "receives"

    ORDER ||--o{ ORDER_ITEM : "contains"
    ORDER ||--o{ PAYMENT : "has"
    ORDER_ITEM }|--|| DISTRIBUTOR_PRODUCT : "links to"

    DISTRIBUTOR_PRODUCT {
        string id PK
        float ptr
        float mrp
        int stock
        datetime expiry
    }

    PRODUCT {
        string id PK
        string name
        string genericName
        string company
        float gstPercentage
    }

    ORDER {
        string id PK
        string status
        float totalAmount
        float gstAmount
        boolean isPaid
    }
```

## Relational Summary
- **Users**: Central identity table with RBAC (Admin, Distributor, Retailer, Salesman).
- **DistributorProduct**: Intersection table between Distributor and Product, representing specific inventory with PTR/MRP/Expiry.
- **Orders**: Multi-distributor order logic (split at service level).
- **Finance**: GST and Ledger reconciliation derived from Orders and Payments.
