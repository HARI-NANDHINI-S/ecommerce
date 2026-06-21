# Data Model Diagram

```mermaid
classDiagram
    direction TB
    class Users {
        id PK
        email
        password_hash
        role
        created_at
    }
    class Products {
        id PK
        name
        description
        price
        image_url
        created_at
    }
    class Orders {
        id PK
        user_id FK
        status
        total_amount
        created_at
    }
    class OrderItems {
        id PK
        order_id FK
        product_id FK
        quantity
        unit_price
    }
    class StoreSettings {
        id PK
        store_name
        store_logo_url
        currency
        tax_rate
        shipping_fee
        razorpay_key_id
    }
    Users "1" --> "*" Orders : places
    Orders "1" --> "*" OrderItems : contains
    Products "1" --> "*" OrderItems : sold_as
    StoreSettings "1" --> "1" : config
```

The diagram shows the main tables and their relationships.
