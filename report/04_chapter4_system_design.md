
# CHAPTER 4
# SYSTEM DESIGN

---

## 4.1 Overall System Architecture

The platform follows a three-tier client-server architecture comprising a frontend presentation layer, a backend application layer, and a persistence layer. The three tiers communicate through well-defined REST API interfaces, enabling them to be developed, deployed, and scaled independently.

### 4.1.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER (Browser)                        │
│                                                                       │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│   │  Next.js /   │  │  React.js    │  │  Chart.js / Word Cloud   │  │
│   │  TypeScript  │  │  Components  │  │  Visualisation Modules   │  │
│   └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ HTTPS / REST API
┌──────────────────────────────────▼──────────────────────────────────┐
│                    APPLICATION TIER (Backend - FastAPI)               │
│                                                                       │
│ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ ┌─────────────┐  │
│ │  Auth Module │ │ Data Collect │ │  NLP/ML     │ │  Trend      │  │
│ │  (JWT/bcrypt)│ │  (Twitter/   │ │  Pipeline   │ │  Detection  │  │
│ │              │ │   Reddit)    │ │  (BERT+VADER│ │  Module     │  │
│ └──────────────┘ └──────────────┘ └─────────────┘ └─────────────┘  │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ Motor (async MongoDB driver)
┌──────────────────────────────────▼──────────────────────────────────┐
│                    PERSISTENCE TIER (MongoDB Atlas)                   │
│                                                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │   users    │  │   posts    │  │  projects  │  │   results    │  │
│  │ collection │  │ collection │  │ collection │  │  collection  │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────┐
                    │    EXTERNAL SERVICES        │
                    │  ┌──────┐  ┌──────────────┐│
                    │  │ X    │  │  Reddit API  ││
                    │  │ API  │  │  (PRAW)      ││
                    │  │ v2   │  └──────────────┘│
                    │  └──────┘                  │
                    └────────────────────────────┘
```

*Figure 4.1: Overall System Architecture Diagram*

### 4.1.2 Component Descriptions

**Frontend (Vercel):** The Next.js application serves as the client-side interface. It handles routing, user authentication state management, API request orchestration, and all data visualisation rendering. TypeScript is used throughout to provide compile-time type safety and improve maintainability. Tailwind CSS provides the utility-first styling system. Chart.js is used for rendering sentiment distribution, time-series, and comparative charts. A dedicated word cloud component renders keyword frequency data.

**Backend (Render):** The FastAPI application exposes the REST API consumed by the frontend. It handles request routing, input validation, authentication middleware, and orchestrates calls to the various service modules. The backend is structured following a service-repository pattern, in which route handlers delegate to service functions that contain business logic, which in turn interact with the data layer via repository functions.

**NLP/ML Pipeline:** Implemented in Python within the backend service, the pipeline handles text preprocessing using NLTK and spaCy, sentiment classification using VADER, TextBlob, and a fine-tuned BERT model served locally, keyword extraction using scikit-learn (TF-IDF) and the RAKE-NLTK library, and trend detection logic.

**Database (MongoDB Atlas):** A cloud-hosted MongoDB cluster stores all application data. The choice of a document store over a relational database was motivated by the variable and semi-structured nature of social media post data, where different platforms provide different metadata fields.

**External APIs:** The X API v2 is accessed using the Tweepy library. The Reddit API is accessed using the PRAW (Python Reddit API Wrapper) library. Both are authenticated using application credentials stored as environment variables and are never exposed to the client.

---

## 4.2 Data Flow Diagram

### 4.2.1 Level-0 DFD (Context Diagram)

The context diagram shows the system as a single process interacting with external entities.

```
┌─────────────┐         Query / Config          ┌──────────────────────┐
│             │ ──────────────────────────────► │                      │
│    User     │                                 │  Sentiment & Trend   │
│ (Analyst /  │ ◄──────────────────────────────  │  Analysis Platform   │
│ Researcher) │   Dashboard / Reports / Alerts  │                      │
└─────────────┘                                 └──────────┬───────────┘
                                                           │
                        ┌──────────────────────────────────┤
                        │                                  │
              ┌─────────▼────────┐             ┌──────────▼──────────┐
              │  X (Twitter) API │             │     Reddit API       │
              │  (External)      │             │     (External)       │
              └──────────────────┘             └─────────────────────┘
```

*Figure 4.2: Level-0 DFD (Context Diagram)*

### 4.2.2 Level-1 DFD

The Level-1 DFD decomposes the main system into its primary processes and shows data flows between them.

```
User Input ──► [1.0 Authentication] ──► Authenticated Session
                                              │
                                              ▼
User Query ──► [2.0 Data Collection] ──► Raw Posts ──► [Posts DB]
                      │                                      │
                      └─── API Call ──► Twitter/Reddit       │
                                                             ▼
                                         [3.0 Preprocessing] ──► Clean Tokens
                                                             │
                                                             ▼
              ┌──────────────────[4.0 Sentiment Analysis]────────────┐
              │                         │                             │
              ▼                         ▼                             ▼
         [VADER]                   [TextBlob]               [BERT Model]
              │                         │                             │
              └─────────────────────────┴─────────────────────────────┘
                                        │
                                  Labelled Posts ──► [Results DB]
                                        │
                      ┌─────────────────┴──────────────────┐
                      ▼                                     ▼
            [5.0 Trend Detection]              [6.0 Keyword Extraction]
                      │                                     │
                      └──────────┬──────────────────────────┘
                                 ▼
                    [7.0 Dashboard Rendering] ──► Charts, Trends, Keywords
```

*Figure 4.3: Level-1 DFD*

---

## 4.3 Use Case Diagram

The following actors and use cases define the primary interactions with the system:

**Actors:**
- **Guest User** — An unauthenticated visitor who can access the landing page and login/registration screens.
- **Registered User** — An authenticated user who can perform analyses, view dashboards, and manage their projects.
- **Admin User** — A superuser with all registered user capabilities plus user management and system configuration functions.
- **System** — Automated system processes such as scheduled data refresh and model inference.

**Primary Use Cases:**
- UC-01: Register Account (Guest)
- UC-02: Login (Guest)
- UC-03: Create Analysis Project (Registered User)
- UC-04: Configure Search Query (Registered User)
- UC-05: Trigger Data Collection (Registered User)
- UC-06: View Sentiment Dashboard (Registered User)
- UC-07: View Trend Report (Registered User)
- UC-08: Export Analysis Results (Registered User)
- UC-09: Compare Analysis Runs (Registered User)
- UC-10: Manage User Accounts (Admin)
- UC-11: View System Usage Statistics (Admin)
- UC-12: Configure API Credentials (Admin)
- UC-13: Scheduled Data Collection (System)

---

## 4.4 ER Diagram

The data model is implemented in MongoDB as a set of collections with the following key entities and relationships:

```
┌──────────────────────────┐          ┌──────────────────────────┐
│         USER             │          │         PROJECT           │
├──────────────────────────┤          ├──────────────────────────┤
│ _id: ObjectId            │          │ _id: ObjectId            │
│ email: String (unique)   │ 1      * │ owner_id: ObjectId       │
│ password_hash: String    │──────────│ name: String             │
│ full_name: String        │          │ query: String            │
│ role: Enum[user, admin]  │          │ platform: [twitter,      │
│ created_at: DateTime     │          │            reddit, both] │
│ is_active: Boolean       │          │ created_at: DateTime     │
└──────────────────────────┘          │ status: Enum             │
                                      └──────────┬───────────────┘
                                                 │ 1
                                                 │
                                                 │ *
                                      ┌──────────▼───────────────┐
                                      │        POST              │
                                      ├──────────────────────────┤
                                      │ _id: ObjectId            │
                                      │ project_id: ObjectId     │
                                      │ platform: String         │
                                      │ external_id: String      │
                                      │ raw_text: String         │
                                      │ clean_text: String       │
                                      │ author_handle: String    │
                                      │ posted_at: DateTime      │
                                      │ collected_at: DateTime   │
                                      │ hashtags: [String]       │
                                      │ likes_count: Integer     │
                                      │ retweets_count: Integer  │
                                      └──────────┬───────────────┘
                                                 │ 1
                                                 │ *
                                      ┌──────────▼───────────────┐
                                      │     SENTIMENT_RESULT     │
                                      ├──────────────────────────┤
                                      │ _id: ObjectId            │
                                      │ post_id: ObjectId        │
                                      │ project_id: ObjectId     │
                                      │ vader_score: Float       │
                                      │ vader_label: Enum        │
                                      │ textblob_score: Float    │
                                      │ bert_score: Float        │
                                      │ bert_label: Enum         │
                                      │ final_label: Enum        │
                                      │ analysed_at: DateTime    │
                                      └──────────────────────────┘

┌──────────────────────────┐          ┌──────────────────────────┐
│     TREND_RESULT         │          │     KEYWORD_RESULT       │
├──────────────────────────┤          ├──────────────────────────┤
│ _id: ObjectId            │          │ _id: ObjectId            │
│ project_id: ObjectId     │          │ project_id: ObjectId     │
│ term: String             │          │ keyword: String          │
│ frequency: Integer       │          │ tfidf_score: Float       │
│ date_bucket: Date        │          │ rake_score: Float        │
│ is_hashtag: Boolean      │          │ frequency: Integer       │
│ growth_rate: Float       │          │ analysed_at: DateTime    │
└──────────────────────────┘          └──────────────────────────┘
```

*Figure 4.5: Entity-Relationship Diagram*

---

## 4.5 Class Diagram

The backend is structured using the following primary classes:

```
┌─────────────────────────┐
│  DataCollectionService  │
├─────────────────────────┤
│ + twitter_client        │
│ + reddit_client         │
├─────────────────────────┤
│ + collect_tweets(query) │
│ + collect_reddit(query) │
│ + save_posts(posts)     │
└────────────┬────────────┘
             │ uses
┌────────────▼────────────┐     ┌─────────────────────────┐
│  PreprocessingService   │     │  SentimentService       │
├─────────────────────────┤     ├─────────────────────────┤
│ + nlp_model (spaCy)     │     │ + vader_analyser        │
├─────────────────────────┤     │ + bert_model            │
│ + clean_text(raw)       │     ├─────────────────────────┤
│ + tokenise(text)        │     │ + analyse_vader(text)   │
│ + remove_stopwords(tkns)│     │ + analyse_bert(text)    │
│ + lemmatise(tokens)     │     │ + get_ensemble(text)    │
│ + handle_emojis(text)   │     │ + batch_analyse(posts)  │
└────────────┬────────────┘     └──────────┬──────────────┘
             │ feeds                       │ used by
┌────────────▼────────────┐     ┌──────────▼──────────────┐
│  TrendDetectionService  │     │  KeywordService          │
├─────────────────────────┤     ├─────────────────────────┤
│ + time_window: str      │     │ + vectorizer (TF-IDF)   │
├─────────────────────────┤     ├─────────────────────────┤
│ + extract_hashtags(post)│     │ + extract_tfidf(corpus) │
│ + compute_frequency()   │     │ + extract_rake(corpus)  │
│ + compute_growth_rate() │     │ + get_top_n(n)          │
│ + get_trending(n)       │     └─────────────────────────┘
└─────────────────────────┘
```

*Figure 4.6: Class Diagram*

---

## 4.6 Sequence Diagram

The following sequence diagram illustrates the flow of events when a user initiates a sentiment analysis run:

```
User         Frontend     Backend API     DataCollect    NLP Pipeline    Database
 │               │               │              │               │            │
 │ Enter Query   │               │              │               │            │
 │──────────────►│               │              │               │            │
 │               │ POST /collect │              │               │            │
 │               │──────────────►│              │               │            │
 │               │               │ collect()    │               │            │
 │               │               │─────────────►│               │            │
 │               │               │              │ Twitter API   │            │
 │               │               │              │ Reddit API    │            │
 │               │               │              │◄──────────────│            │
 │               │               │  raw_posts   │               │            │
 │               │               │◄─────────────│               │            │
 │               │               │              │               │ save_posts │
 │               │               │──────────────────────────────────────────►│
 │               │               │ analyse()    │               │            │
 │               │               │──────────────────────────────►│           │
 │               │               │              │  preprocess   │            │
 │               │               │              │  + classify   │            │
 │               │               │              │  + trends     │            │
 │               │               │◄──────────────────────────────│           │
 │               │               │ save results │               │ save_results
 │               │               │──────────────────────────────────────────►│
 │               │ 200 OK        │              │               │            │
 │               │◄──────────────│              │               │            │
 │ Dashboard     │               │              │               │            │
 │ Updates       │               │              │               │            │
```

*Figure 4.7: Sequence Diagram – Sentiment Analysis Flow*

---

## 4.7 Activity Diagram

The activity diagram for the end-to-end data collection and analysis workflow is as follows:

```
[Start]
   │
   ▼
[User Logs In]
   │
   ▼
[User Creates/Selects Project]
   │
   ▼
[User Specifies Search Query & Platform]
   │
   ▼
[System Validates Query]
   │
   ├─── [Invalid] ──► [Display Error] ──► [Return to Query Form]
   │
   ▼ [Valid]
[Collect Data from Selected Platform APIs]
   │
   ├─── [API Error / Rate Limit] ──► [Log Error, Return Partial Data]
   │
   ▼ [Success]
[Store Raw Posts in Database]
   │
   ▼
[Preprocess Each Post]
   │
   ├─── [Post Too Short After Preprocessing] ──► [Flag Post, Skip]
   │
   ▼
[Classify Sentiment (VADER + BERT)]
   │
   ▼
[Extract Keywords and Hashtags]
   │
   ▼
[Compute Trend Metrics]
   │
   ▼
[Save Analysis Results to Database]
   │
   ▼
[Render Dashboard Visualisations]
   │
   ▼
[User Views Results / Exports Data]
   │
   ▼
[End]
```

*Figure 4.8: Activity Diagram – Data Collection and Analysis*

---

## 4.8 Database Design

The database is implemented in MongoDB Atlas. The schema for each collection is described below.

### 4.8.1 Users Collection

```json
{
  "_id": "ObjectId",
  "email": "String (required, unique, indexed)",
  "password_hash": "String (required)",
  "full_name": "String (required)",
  "role": "String (enum: ['user', 'admin'], default: 'user')",
  "is_active": "Boolean (default: true)",
  "created_at": "ISODate",
  "last_login": "ISODate"
}
```

Indexes: `{ email: 1 }` (unique)

*Table 4.2: MongoDB Collection Schema – Users*

### 4.8.2 Projects Collection

```json
{
  "_id": "ObjectId",
  "owner_id": "ObjectId (ref: users, indexed)",
  "name": "String (required)",
  "query": "String (required)",
  "platform": "String (enum: ['twitter', 'reddit', 'both'])",
  "max_results": "Integer (default: 500)",
  "date_from": "ISODate (optional)",
  "date_to": "ISODate (optional)",
  "status": "String (enum: ['pending', 'collecting', 'analysing', 'complete', 'error'])",
  "post_count": "Integer",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### 4.8.3 Posts Collection

```json
{
  "_id": "ObjectId",
  "project_id": "ObjectId (ref: projects, indexed)",
  "platform": "String (enum: ['twitter', 'reddit'])",
  "external_id": "String (unique per platform)",
  "raw_text": "String (required)",
  "clean_text": "String",
  "tokens": ["String"],
  "author_handle": "String",
  "posted_at": "ISODate (indexed)",
  "collected_at": "ISODate",
  "hashtags": ["String"],
  "likes_count": "Integer",
  "retweets_count": "Integer",
  "language": "String (default: 'en')"
}
```

Indexes: `{ project_id: 1, posted_at: -1 }` (compound)

*Table 4.1: MongoDB Collection Schema – Posts*

### 4.8.4 Sentiment Results Collection

```json
{
  "_id": "ObjectId",
  "post_id": "ObjectId (ref: posts, unique)",
  "project_id": "ObjectId (ref: projects, indexed)",
  "vader_compound": "Float",
  "vader_pos": "Float",
  "vader_neu": "Float",
  "vader_neg": "Float",
  "vader_label": "String (enum: ['positive', 'negative', 'neutral'])",
  "textblob_polarity": "Float",
  "textblob_subjectivity": "Float",
  "bert_label": "String (enum: ['positive', 'negative', 'neutral'])",
  "bert_confidence": "Float",
  "final_label": "String (enum: ['positive', 'negative', 'neutral'])",
  "final_score": "Float",
  "analysed_at": "ISODate"
}
```

Indexes: `{ project_id: 1 }`, `{ post_id: 1 }` (unique)

*Table 4.3: MongoDB Collection Schema – Analysis Results*

### 4.8.5 Trend Results Collection

```json
{
  "_id": "ObjectId",
  "project_id": "ObjectId (ref: projects, indexed)",
  "term": "String",
  "is_hashtag": "Boolean",
  "date_bucket": "ISODate",
  "frequency": "Integer",
  "growth_rate": "Float",
  "computed_at": "ISODate"
}
```

### 4.8.6 Keyword Results Collection

```json
{
  "_id": "ObjectId",
  "project_id": "ObjectId (ref: projects, indexed)",
  "keyword": "String",
  "tfidf_score": "Float",
  "rake_score": "Float",
  "frequency": "Integer",
  "computed_at": "ISODate"
}
```

### 4.8.7 Design Rationale

MongoDB was chosen over a relational database management system for several reasons specific to this application:

1. **Schema Flexibility:** Social media posts from different platforms carry different metadata fields. Twitter posts include retweet counts and like counts, while Reddit posts include upvote ratios, subreddit names, and comment counts. A document model accommodates these platform-specific fields without requiring null columns in a fixed schema.

2. **Horizontal Scalability:** MongoDB's native sharding capabilities provide a clear path to scaling the data layer horizontally if the platform were to be deployed at production scale with significantly higher data volumes.

3. **Aggregation Pipeline:** MongoDB's aggregation framework is well-suited to the type of group-by, count, and sort operations required for trend detection and sentiment distribution computation.

4. **Native JSON Compatibility:** The entire application uses JSON as its data interchange format. MongoDB's BSON storage format is essentially a binary extension of JSON, eliminating the need for an object-relational mapping layer and reducing serialisation overhead.

---
