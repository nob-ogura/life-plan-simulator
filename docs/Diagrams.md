# Architecture Diagrams

## 1. パッケージ構造 (Vertical Slice Architecture)

この図は、垂直スライスアーキテクチャパターンに従ったコードベースの構成を示しています。

```mermaid
graph TB
    subgraph AppLayer ["🌐 App Layer - ルーティング層"]
        AppRouter["App Router / Pages<br/><small>Next.jsのルーティング</small>"]
    end

    subgraph FeatureLayer ["⚡ Feature Layer - 機能層"]
        Dashboard["📊 dashboard<br/><small>シミュレーション表示</small>"]
        Inputs["📝 inputs<br/><small>フォーム・設定画面<br/>(Assets, Expenses, Income, etc.)</small>"]
    end

    subgraph SharedLayer ["🔧 Shared Layer - 共有層"]
        direction LR
        subgraph Domain ["ドメイン"]
            SharedDomain["domain<br/><small>エンティティ・値オブジェクト<br/>ビジネスロジック</small>"]
        end
        subgraph CrossCutting ["横断的関心事"]
            SharedCrossCutting["cross-cutting<br/><small>認証・インフラ<br/>アプリUI</small>"]
        end
        subgraph UI ["UIコンポーネント"]
            UIComponents["components<br/><small>再利用可能な<br/>UIプリミティブ</small>"]
        end
    end

    subgraph DataLayer ["💾 Data Layer - データ層"]
        Supabase[("Supabase DB<br/><small>データベース</small>")]
    end

    %% App Layer → Feature Layer
    AppRouter ==>|ページ表示| Dashboard
    AppRouter ==>|ページ表示| Inputs
    
    %% Feature Layer → Shared Layer
    Dashboard -->|ビジネスロジック| SharedDomain
    Dashboard -->|UI部品| UIComponents
    Inputs -->|ビジネスロジック| SharedDomain
    Inputs -->|UI部品| UIComponents

    %% Cross-Cutting Concerns
    AppRouter -.->|認証・設定| SharedCrossCutting
    Dashboard -.->|認証・設定| SharedCrossCutting
    Inputs -.->|認証・設定| SharedCrossCutting

    %% Data Access
    SharedCrossCutting ==>|データアクセス| Supabase
    
    %% Styling
    classDef appStyle fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#000
    classDef featureStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#000
    classDef sharedStyle fill:#fff3e0,stroke:#f57c00,stroke-width:3px,color:#000
    classDef dataStyle fill:#e8f5e9,stroke:#388e3c,stroke-width:3px,color:#000
    classDef componentStyle fill:#fff,stroke:#666,stroke-width:2px,color:#000
    
    class AppLayer appStyle
    class FeatureLayer featureStyle
    class SharedLayer sharedStyle
    class DataLayer dataStyle
    class AppRouter,Dashboard,Inputs,SharedDomain,SharedCrossCutting,UIComponents,Supabase componentStyle
    
    classDef legendStyle fill:#fafafa,stroke:#999,stroke-width:1px,color:#000
    class Legend legendStyle
```

## 2. データフロー（CQRSパターン）

### 読み取り操作 (Query)

このシーケンス図は、読み取り操作（クエリ）におけるデータの流れを示しており、具体的には`get-dashboard-simulation`クエリをモデル化しています。機能内で使用されるRER（リクエスト-エンドポイント-レスポンス）パターンを実例で説明しています。

```mermaid
sequenceDiagram
    participant UI as Page/Component
    participant Action as Server Action<br>(action.ts)
    participant Handler as Query Handler<br>(handler.ts)
    participant Repo as Repository<br>(repository.ts)
    participant DB as Supabase

    Note over UI, DB: Read Operation (Query)

    UI->>Action: invoke(params)
    activate Action
    Action->>Handler: execute(request)
    activate Handler
    Handler->>Repo: fetch data
    activate Repo
    Repo->>DB: SELECT ...
    DB-->>Repo: result rows
    Repo-->>Handler: Domain Objects
    deactivate Repo
    Handler->>Handler: Map to DTO (mapper.ts)
    Handler-->>Action: Response DTO
    deactivate Handler
    Action-->>UI: JSON Data
    deactivate Action
```

### 書き込み操作 (Command)

このシーケンス図は、書き込み操作（コマンド）におけるデータの流れを示しており、具体的には`create-asset`コマンドをモデル化しています。

```mermaid
sequenceDiagram
    participant UI as Page/Component
    participant Action as Server Action<br>(action.ts)
    participant Handler as Command Handler<br>(handler.ts)
    participant Repo as Repository<br>(repository.ts)
    participant DB as Supabase

    Note over UI, DB: Write Operation (Command)

    UI->>Action: invoke(input data)
    activate Action
    Action->>Action: Validate Input (zod)
    Action->>Handler: execute(request)
    activate Handler
    Handler->>Repo: create/update
    activate Repo
    Repo->>DB: INSERT / UPDATE / DELETE
    DB-->>Repo: affected rows / id
    Repo-->>Handler: Result / Domain Object
    deactivate Repo
    Handler-->>Action: Response (Success/Fail)
    deactivate Handler
    Action->>Action: Revalidate Path (Next.js)
    Action-->>UI: Result
    deactivate Action
```

## 3. データベーススキーマ（ER図）

この図は、Supabaseにおけるコアテーブルとその関係性を示しています。

```mermaid
erDiagram
    direction LR
    users ||--|| profiles : "has one"
    users ||--|| simulation_settings : "has one"
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
        string label
        numeric take_home_monthly
        numeric bonus_amount
        date start_year_month
        date end_year_month
    }

    expenses {
        uuid id PK
        string label
        numeric amount_monthly
        string category
        date start_year_month
    }

    assets {
        uuid id PK
        numeric cash_balance
        numeric investment_balance
        numeric return_rate
    }

    mortgages {
        uuid id PK
        numeric principal
        numeric annual_rate
        int years
        date start_year_month
    }

    life_events {
        uuid id PK
        string label
        numeric amount
        date year_month
        string category
    }

    children {
        uuid id PK
        string label
        date birth_year_month
        date due_year_month
        text note
    }

    rentals {
        uuid id PK
        numeric rent_monthly
        date start_year_month
        date end_year_month
    }
```
