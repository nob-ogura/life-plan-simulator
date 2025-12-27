# Vertical Slice Architecture (VSA) 設計ガイドライン

本プロジェクトでは、機能追加や修正の影響範囲を最小化し、システムの長期的な保守性を最大化するために Vertical Slice Architecture を採用します。
以下の基準を遵守してください。

## 1. アーキテクチャ基本原則

### 1.1 機能単位の凝集 (Cohesion)
*   すべてのコードは「機能（Feature/Use Case）」単位でフォルダリングし、関連する要素（API, Logic, Validation, Specific DTOs）を一箇所に凝集させてください。
*   新しい機能を追加する際は、原則として新しいスライス（フォルダ）を作成して拡張してください。

### 1.2 スライスの独立性とドメインモデル
*   スライスの独立性: 各スライスは可能な限り独立して変更可能であるべきです。結合度を下げるため、グルーコード（DTO、マッピング、オーケストレーション処理）の重複（Copy & Paste）は許容します。
*   ドメインモデルの共有: ビジネスの中核となるルール（Entity/ValueObject）は重複させず、モジュール単位で共有してください。スライス内に定義するのは、そのユースケース固有の「入出力モデル」に限ります。

## 2. ディレクトリ・ファイル構成

### 2.1 機能のグループ化
フラットに機能が並びすぎないよう、ドメイン領域（Module）ごとに親フォルダを作成し、その配下に各スライス（機能）を配置します。

### 2.2 RER (Request-Endpoint-Response) 構成の採用
*   Web API層では「1つのエンドポイント = 1つのクラス」として定義することを基本とします。
*   RER構成: Request（入力定義）、Endpoint（HTTPの接点）、Response（出力定義）を同一スライス内に定義し、ファイルを行き来する認知負荷を最小化してください。

## 3. 実装ルールとCQRSの適用

### 3.1 CQRS (Command Query Responsibility Segregation)
読み取りと書き込みの責務を分離し、最適化します。
*   コマンド (Command): 状態を変更する操作。戻り値は最小限（IDや成功/失敗ステータス）にします。
*   クエリ (Query): データを取得するだけの操作。パフォーマンスを重視し、ORMの追跡機能（Tracking）を切る、あるいは軽量な読み取り専用モデル（Projection）を利用することを推奨します。

### 3.2 Endpoint と Handler の責務分担
スライス内を以下の役割で構成します。

*   Endpoint (Transport Layer): HTTPリクエストの受付、パラメータのバインディング、認証属性の付与を担当します。ビジネスロジックは一切書かず、Handlerへ処理を委譲します。
*   Handler (Application Layer): ユースケースの進行役（オーケストレーター）。データの取得、ドメインメソッドの呼び出し、永続化、イベント発行を制御します。
*   Domain Model (Core Business Logic): 状態の整合性を保つルール、計算ロジック、ガード条件は、Handlerにベタ書きせず、可能な限りドメインモデル（Entity/ValueObject）のメソッドとして実装してください（リッチドメインモデルの推奨）。

#### 3.2.1 最小テンプレート（1エンドポイント=1クラス）
Endpoint は「入力受付 + 認証 + 委譲」のみを行い、Handler に業務処理を集約します。

```ts
// Endpoint: input/auth only, delegate to handler.
export class ExampleEndpoint {
  constructor(private readonly handler: ExampleHandler) {}

  async handle(request: ExampleRequest): Promise<ExampleResponse> {
    return this.handler.execute(request);
  }
}

// Handler: business logic orchestration.
export class ExampleHandler {
  async execute(request: ExampleRequest): Promise<ExampleResponse> {
    // do business logic here
    return { ok: true };
  }
}
```

#### 3.2.2 Server Action 連携アダプター
Next.js の Server Action から Endpoint を安全に呼び出すために、
`src/shared/cross-cutting/infrastructure/action-adapter.ts` の `createAction` を利用します。
`safeParse` を持つスキーマ（Zod 互換）を渡すことで入力検証とエラーハンドリングを統一します。

### 3.3 UI からのデータ更新ルール
*   原則として、UI コンポーネント内で `supabaseClient` を使って `insert` / `update` / `delete` を行わないでください。
*   更新は各機能スライスで定義された Server Action (`action.ts`) を呼び出してください。これにより、ドメインルールと認可が一貫して適用されます。

## 4. データアクセスと依存関係

### 4.1 データアクセスの配置
*   スライス専用のデータアクセス: 必要なクエリや更新処理は、スライス内に `Infrastructure` クラス（または専用の小さなRepository）を定義するか、Handler内で直接記述することを許容します。

### 4.2 DTO (Data Transfer Object) の利用
*   そのスライス専用の DTO (Response Model) を定義し、必要なデータのみをマッピングしてAPIレスポンスを返却してください。

### 4.3 共通化（Shared Kernel）と「3回の法則」
*   3回の法則 (Rule of Three): 「グルーコード」や「データアクセス」などの実装詳細が3箇所以上で重複した場合に初めて、共有（Shared/Common）への切り出しを検討します。
*   ドメインルールの例外: 金額計算、ステータス遷移条件などの「ビジネスルール」に関しては、重複を許容せず、最初から共有ドメインモデル（Module/Domain）に実装してください。
*   横断的関心事: ログ出力、認証、日付操作、メール送信基盤など、ビジネスロジックを含まないインフラ機能は `Shared` ディレクトリで管理してください。

## 5. テスト戦略

### 5.1 統合テスト (Integration Test) の優先
*   本プロジェクトにおける統合テストとは、「APIのエンドポイント（Controller）への入力から、データベースの結果検証まで」を通貫で行うテストを指します。
*   スライス内部の実装詳細（Privateメソッドや内部クラスの構成）を変更してもテストが壊れないよう、統合テストの実装を最優先してください。

### 5.2 複雑なロジックに対する単体テスト
*   対象: 分岐や計算が複雑なドメインモデル（Entity/ValueObject/Domain Service）。
*   DB接続を伴わない「純粋な単体テスト (Unit Test)」を追加し、エッジケース（境界値、異常系）を網羅的に検証してください。
*   単なるデータのマッピングや、条件分岐のないCRUD処理に対しては、単体テストよりも統合テストを優先します。
