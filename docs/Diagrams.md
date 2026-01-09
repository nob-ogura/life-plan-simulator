# Architecture Diagrams

## 1. パッケージ構造 (Vertical Slice Architecture)

```mermaid
graph TB
    subgraph AppLayer["App Layer (src/app)"]
        AppRouter["Next.js App Router<br/>page.tsx / route handlers"]
        ServerAction["Server Actions<br/>action.ts"]
    end

    subgraph FeatureLayer["Feature Layer (src/features)"]
        subgraph Slices["Vertical Slices"]
            Dashboard["dashboard/<br/><small>simulation view</small>"]
            Inputs["inputs/<br/><small>assets, expenses, income, life-events, ...</small>"]
        end
        subgraph CQRS["CQRS + REPR (inside a slice)"]
            Queries["queries/ (read)"]
            Commands["commands/ (write)"]
            Request["request.ts (zod)"]
            Endpoint["endpoint.ts"]
            Handler["handler.ts"]
            Response["response.ts"]
            Repository["repository.ts"]
            Infrastructure["infrastructure/ (per slice)"]
        end
    end

    subgraph SharedLayer["Shared Layer (src/shared)"]
        SharedDomain["domain/<br/><small>entities, value objects</small>"]
        SharedCross["cross-cutting/<br/><small>auth, infra, app UI</small>"]
        SharedUtils["utils/"]
        SharedConstants["constants/"]
    end

    subgraph UILayer["UI Layer (src/components)"]
        UIComponents["components/ui + components/form"]
    end

    subgraph LibLayer["Lib Layer (src/lib)"]
        LibHelpers["helpers/adapters"]
    end

    subgraph TypesLayer["Types (src/types)"]
        TypesSupabase["supabase.ts (generated)"]
    end

    subgraph DataLayer["Data Layer"]
        Supabase[("Supabase")]
    end

    AppRouter -->|render| Dashboard
    AppRouter -->|render| Inputs
    Dashboard -->|invoke| ServerAction
    Inputs -->|invoke| ServerAction
    ServerAction --> Request --> Endpoint --> Handler --> Repository --> Supabase
    Handler --> Response --> ServerAction
    Queries --> Request
    Commands --> Request
    Infrastructure --> Repository

    Dashboard -->|use| UIComponents
    Inputs -->|use| UIComponents
    Dashboard -->|use| SharedDomain
    Inputs -->|use| SharedDomain
    ServerAction -.->|auth/config| SharedCross
    Handler -.->|shared utils| SharedUtils
    Handler -.->|shared consts| SharedConstants
    Repository -.->|types| TypesSupabase
    Handler -.->|helpers| LibHelpers
```

## 2. データフロー（CQRSパターン）

### 読み取り操作 (Query)

このシーケンス図は、読み取り操作（クエリ）におけるデータの流れを示しており、具体的には`get-dashboard-simulation`クエリをモデル化しています。機能内で使用されるREPR（リクエスト-エンドポイント-レスポンス）パターンも含めて実例で説明しています。

```mermaid
sequenceDiagram
    participant UI as Page/Component
    participant Action as Server Action<br>(action.ts)
    participant Endpoint as Endpoint<br>(endpoint.ts)
    participant Handler as Query Handler<br>(handler.ts)
    participant Repo as Repository<br>(repository.ts)
    participant DB as Supabase

    Note over UI, DB: Read Operation (Query)

    UI->>Action: invoke(params)
    activate Action
    Action->>Action: Validate Input (request.ts + zod)
    Action->>Endpoint: handle(request)
    activate Endpoint
    Endpoint->>Handler: execute(request)
    activate Handler
    Handler->>Repo: fetch data
    activate Repo
    Repo->>DB: SELECT ...
    DB-->>Repo: result rows
    Repo-->>Handler: Domain Objects
    deactivate Repo
    Handler->>Handler: Map to DTO (mapper.ts)
    Handler-->>Endpoint: Response DTO (response.ts)
    deactivate Handler
    Endpoint-->>Action: Response DTO
    deactivate Endpoint
    Action-->>UI: JSON Data
    deactivate Action
```

### 書き込み操作 (Command)

このシーケンス図は、書き込み操作（コマンド）におけるデータの流れを示しており、具体的には`create-asset`コマンドをモデル化しています。

```mermaid
sequenceDiagram
    participant UI as Page/Component
    participant Action as Server Action<br>(action.ts)
    participant Endpoint as Endpoint<br>(endpoint.ts)
    participant Handler as Command Handler<br>(handler.ts)
    participant Repo as Repository<br>(repository.ts)
    participant DB as Supabase

    Note over UI, DB: Write Operation (Command)

    UI->>Action: invoke(input data)
    activate Action
    Action->>Action: Validate Input (request.ts + zod)
    Action->>Endpoint: handle(request)
    activate Endpoint
    Endpoint->>Handler: execute(request)
    activate Handler
    Handler->>Repo: create/update
    activate Repo
    Repo->>DB: INSERT / UPDATE / DELETE
    DB-->>Repo: affected rows / id
    Repo-->>Handler: Result / Domain Object
    deactivate Repo
    Handler-->>Endpoint: Response (Success/Fail) (response.ts)
    deactivate Handler
    Endpoint-->>Action: Response
    deactivate Endpoint
    Action->>Action: Revalidate Path (Next.js)
    Action-->>UI: Result
    deactivate Action
```

## 3. データベーススキーマ（ER図）

この図は、Supabaseにおけるコアテーブルとその関係性を示しています。`simulation_settings` はユーザーごとに複数行になり得るため、最新の`created_at`をアプリ側で採用しています。

```mermaid
erDiagram
    direction LR
    users ||--|| profiles : "has one"
    users ||--o{ simulation_settings : "has many (latest used)"
    users ||--o{ income_streams : "has many"
    users ||--o{ expenses : "has many"
    users ||--o{ assets : "has many"
    users ||--o{ mortgages : "has many"
    users ||--o{ life_events : "has many"
    users ||--o{ children : "has many"
    users ||--o{ rentals : "has many"

    profiles {
        uuid user_id PK
        int birth_year
        int birth_month
        int pension_start_age
    }

    simulation_settings {
        uuid id PK
        uuid user_id FK
        int end_age
        numeric pension_amount_single
        numeric pension_amount_spouse
    }

    income_streams {
        uuid id PK
        uuid user_id FK
        string label
        numeric take_home_monthly
        numeric bonus_amount
        date start_year_month
        date end_year_month
    }

    expenses {
        uuid id PK
        uuid user_id FK
        string label
        numeric amount_monthly
        string category
        date start_year_month
    }

    assets {
        uuid id PK
        uuid user_id FK
        numeric cash_balance
        numeric investment_balance
        numeric return_rate
    }

    mortgages {
        uuid id PK
        uuid user_id FK
        numeric principal
        numeric annual_rate
        int years
        date start_year_month
    }

    life_events {
        uuid id PK
        uuid user_id FK
        string label
        numeric amount
        date year_month
        string category
    }

    children {
        uuid id PK
        uuid user_id FK
        string label
        date birth_year_month
        date due_year_month
        text note
    }

    rentals {
        uuid id PK
        uuid user_id FK
        numeric rent_monthly
        date start_year_month
        date end_year_month
    }
```
