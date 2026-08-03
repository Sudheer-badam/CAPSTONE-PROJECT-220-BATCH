
# CHAPTER 3
# SYSTEM ANALYSIS

---

## 3.1 Analysis of the Existing System

Before designing the proposed platform, a thorough analysis of currently available systems and workflows was conducted. This analysis encompassed both commercial products and the informal, script-based approaches commonly used by researchers and analysts who need social media sentiment data but lack access to enterprise tools.

The most common informal approach involves writing custom Python scripts that call social media APIs, store the retrieved data in flat files or relational databases, run sentiment analysis using a library such as TextBlob or VADER, and produce results as CSV files or static plots. While this approach works for one-off analyses, it is fragile, non-reproducible in the hands of non-programmers, not easily shared with team members, and provides no persistent interface for monitoring ongoing topics. Each new analysis typically requires rewriting significant portions of the script.

Commercial platforms such as Brandwatch, Sprout Social, and Talkwalker address many of these usability problems but introduce a different set of issues: restrictive licensing, lack of transparency about the underlying analytical methods, inability to customise or extend the platform, and cost structures that are prohibitive for small organisations and researchers. Furthermore, most commercial platforms treat the social listening and reporting interface as a finished product, leaving no room for users who want to experiment with different sentiment classification models or incorporate domain-specific lexicons.

Academic tools, such as those produced in research papers, typically exist as Python notebooks or standalone scripts without a frontend interface, and they are rarely updated or maintained after publication. They serve as excellent demonstrations of algorithmic techniques but are not practical platforms for sustained use.

The analysis therefore identified a clear pattern: the existing landscape consists of either technically sophisticated but inaccessible commercial products, or technically accessible but practically inconvenient DIY approaches. Neither extreme adequately serves the range of users — from business analysts to academic researchers — who have a genuine need for social media sentiment analysis.

---

## 3.2 Limitations of the Existing System

The limitations identified in existing systems can be organised into the following categories:

**Cost and Accessibility:** Enterprise-grade platforms are priced out of reach for small businesses, independent researchers, and academic use. Most offer limited free tiers that restrict either the number of queries, the volume of data, or the range of features available.

**Lack of Transparency:** Commercial platforms generally do not disclose the specific algorithms and models used for sentiment classification, making it impossible for users to assess the reliability of the results or understand why a particular classification was made. This opacity is a significant problem for academic research, where method reproducibility is essential.

**Limited Customisation:** Existing commercial tools do not allow users to substitute their own sentiment models, adjust preprocessing pipelines, or incorporate domain-specific knowledge. A pharmaceutical company analysing drug-related discussions has very different vocabulary and sentiment cues than a consumer electronics brand, but no commercial platform accommodates this difference through user-configurable modelling.

**No Integrated Data Collection:** API-independent analytical tools such as MonkeyLearn and IBM Watson NLU require users to supply their own data. The challenge of collecting, cleaning, and formatting social media data at scale is itself non-trivial, and the absence of built-in data collection means users must solve this problem separately.

**Static Visualisations:** Many lower-cost tools and academic demonstrations provide static output — tables, static images, or simple bar charts — that do not allow users to interactively explore their data, drill down into specific time periods or topics, or compare results across different search queries.

**Single-Platform Scope:** Most tools focus on a single social media platform, typically Twitter. Users who want to compare sentiment across Twitter and Reddit, for example, must use separate tools and manually reconcile the results.

**Language and Slang Handling:** Standard NLP preprocessing pipelines, when applied without modification to social media text, frequently mishandle domain-specific abbreviations, platform-specific conventions (hashtags, @mentions), emoticons, and evolving slang. The resulting reduction in classification accuracy is rarely reported transparently by commercial tools.

---

## 3.3 Proposed System

The proposed system is a full-stack web application designed to address each of the limitations identified above. It provides an end-to-end analytical workflow accessible through a web browser, covering data collection, preprocessing, sentiment analysis, trend detection, keyword extraction, and visualisation.

The system is built around the following design principles:

**Openness:** The entire codebase is open source. The algorithms used are documented and configurable. Users can understand what the system is doing and, if technically capable, modify it.

**Integration:** Rather than requiring users to stitch together multiple tools, the platform handles the complete analytical workflow in a single interface. Users specify a search query and time period, and the system handles data retrieval, processing, analysis, and visualisation automatically.

**Accuracy:** The sentiment classification module is designed to provide genuinely useful results, not just fast but inaccurate outputs. The combination of a fine-tuned BERT model with VADER and TextBlob scoring, in an ensemble configuration, is designed to handle both the nuanced contextual language that BERT excels at and the fast, rule-based processing that VADER provides for high-volume scenarios.

**Usability:** The frontend dashboard is designed with non-technical users in mind. Charts, trend panels, and keyword clouds are presented in a clear visual hierarchy. Users do not need to understand the underlying NLP to interpret and act on the results.

**Modularity:** Each component of the system — the data collection module, the preprocessing pipeline, the sentiment classifier, the trend detector — is implemented as an independent service or module with a well-defined interface. This makes individual components replaceable and testable in isolation.

**Affordability:** The platform is designed to be self-hostable at low cost using open-source components and free or low-cost cloud services. The baseline configuration can run on a small cloud instance costing a few dollars per month.

---

## 3.4 Feasibility Study

### 3.4.1 Technical Feasibility

The technical feasibility of the proposed system was assessed by examining whether the required capabilities could be implemented using available, stable technologies within the project timeline. The assessment was broadly positive:

- The X (Twitter) API v2 and Reddit's PRAW library are both publicly available with free tiers that provide sufficient data volume for research and small-scale business use cases. The authentication and rate limiting procedures are well-documented.
- Python's NLP ecosystem — particularly NLTK, spaCy, and the Hugging Face Transformers library — provides mature, well-maintained implementations of all required preprocessing and modelling capabilities. The learning curve is manageable within the project timeline.
- React.js and Next.js are production-grade frontend frameworks with large communities, extensive documentation, and a rich ecosystem of charting and UI component libraries. They are appropriate choices for building a professional interactive dashboard.
- FastAPI is a modern Python web framework that is well-suited to building REST APIs and is documented as capable of handling the expected request volumes for this application.
- MongoDB provides flexible document storage that is a natural fit for the variable-length, semi-structured nature of social media post data.
- Vercel and Render both offer free tiers sufficient for initial deployment and demonstration, with clear upgrade paths for higher traffic.

The primary technical risk is the computational cost of running the BERT fine-tuning step and inference at scale. This was managed by selecting bert-base-uncased (a smaller BERT variant), using GPU acceleration during the fine-tuning phase via Google Colab, and implementing caching of inference results on the backend to reduce repeated computation.

### 3.4.2 Operational Feasibility

The platform is designed for daily operational use by business analysts, researchers, and marketers. The user interface is designed to require no programming knowledge. Standard users can create analysis projects, specify search queries, trigger data collection and analysis, and view results entirely through the web interface. Admin users have additional capabilities to manage user accounts, view system-level usage statistics, and configure API key settings. The operational workflow is straightforward enough to be adopted without formal training.

### 3.4.3 Economic Feasibility

The development of the platform was carried out using entirely open-source software, requiring no software licensing costs. Infrastructure costs during development were limited to a personal laptop and free cloud service tiers (Google Colab for model training, GitHub for version control, Vercel and Render free tiers for deployment). The primary cost of the project was developer time.

For a hypothetical small organisation deploying the platform, the estimated monthly infrastructure cost is approximately $10–$25 USD, covering a Render instance for the backend and MongoDB Atlas free tier storage. This represents a very significant cost advantage over commercial alternatives, which typically start at several hundred dollars per month.

### 3.4.4 Schedule Feasibility

The project was planned and executed over one academic semester (approximately 16 weeks) with the following high-level timeline:

| Phase | Activities | Duration |
|-------|-----------|----------|
| Phase 1 | Requirements gathering, literature review, system design | Weeks 1–3 |
| Phase 2 | Backend development, API integration, database setup | Weeks 4–7 |
| Phase 3 | NLP pipeline and ML model development | Weeks 8–11 |
| Phase 4 | Frontend dashboard development | Weeks 12–14 |
| Phase 5 | Testing, evaluation, deployment | Weeks 15–16 |

The schedule was adhered to broadly, with some slippage in Phase 3 due to the time required to debug the BERT fine-tuning pipeline and optimise inference latency.

---

## 3.5 Functional Requirements

The functional requirements define what the system must be able to do. They are organised by module and prioritised using the MoSCoW method (Must Have, Should Have, Could Have, Won't Have for this version).

### FR-01: User Authentication Module
- **FR-01.1 [Must]:** The system must allow new users to register with an email address and password.
- **FR-01.2 [Must]:** The system must authenticate registered users via a secure login mechanism.
- **FR-01.3 [Must]:** Authentication tokens must expire after a configurable period and must be securely stored client-side.
- **FR-01.4 [Should]:** The system should allow users to reset their password via email.
- **FR-01.5 [Could]:** The system could support OAuth-based login via Google.

### FR-02: Data Collection Module
- **FR-02.1 [Must]:** The system must accept keyword-based search queries from the user.
- **FR-02.2 [Must]:** The system must retrieve posts from the X (Twitter) API v2 based on the specified query.
- **FR-02.3 [Must]:** The system must retrieve posts from the Reddit API via PRAW based on the specified query.
- **FR-02.4 [Must]:** The system must store retrieved posts in the database with associated metadata (platform, timestamp, author identifier).
- **FR-02.5 [Should]:** The system should allow the user to specify a date range for data collection.
- **FR-02.6 [Should]:** The system should display the number of posts retrieved and the collection status to the user.
- **FR-02.7 [Could]:** The system could support additional data sources such as News API.

### FR-03: Data Preprocessing Module
- **FR-03.1 [Must]:** The system must remove URLs, HTML tags, @mentions, and hashtag symbols from raw post text.
- **FR-03.2 [Must]:** The system must tokenise preprocessed text into individual tokens.
- **FR-03.3 [Must]:** The system must remove standard English stop words.
- **FR-03.4 [Must]:** The system must apply lemmatisation to reduce tokens to their base forms.
- **FR-03.5 [Should]:** The system should handle emoji translation (converting emojis to text descriptions).
- **FR-03.6 [Should]:** The system should detect and flag posts that are too short to be meaningfully analysed (fewer than 3 tokens after preprocessing).

### FR-04: Sentiment Analysis Module
- **FR-04.1 [Must]:** The system must classify each post as Positive, Negative, or Neutral.
- **FR-04.2 [Must]:** The system must provide a numerical sentiment score alongside the categorical label.
- **FR-04.3 [Must]:** The VADER-based classifier must be available as a fast, lightweight analysis option.
- **FR-04.4 [Should]:** The BERT-based classifier must be available as a high-accuracy analysis option.
- **FR-04.5 [Could]:** The system could allow users to select which classifier to use per analysis run.

### FR-05: Trend Detection Module
- **FR-05.1 [Must]:** The system must identify the top N most frequently occurring hashtags in the collected dataset.
- **FR-05.2 [Must]:** The system must compute the frequency of terms over time and identify terms with rapid growth in usage.
- **FR-05.3 [Should]:** The system should display trending terms grouped by time window (daily, weekly).
- **FR-05.4 [Could]:** The system could provide alerts when a tracked keyword crosses a configurable frequency threshold.

### FR-06: Keyword Extraction Module
- **FR-06.1 [Must]:** The system must extract the top N most significant keywords from the collected corpus using TF-IDF scoring.
- **FR-06.2 [Should]:** The system should provide keyword extraction using the RAKE algorithm as an alternative.
- **FR-06.3 [Should]:** Extracted keywords should be displayed in a word cloud visualisation on the dashboard.

### FR-07: Dashboard Module
- **FR-07.1 [Must]:** The dashboard must display a summary of the most recent analysis run, including post count, sentiment distribution, and top keywords.
- **FR-07.2 [Must]:** Sentiment distribution must be visualised as a pie chart or donut chart.
- **FR-07.3 [Must]:** Time-series sentiment trends must be visualised as a line chart.
- **FR-07.4 [Should]:** The dashboard should allow users to switch between analysis runs and compare results.
- **FR-07.5 [Should]:** The dashboard should support exporting charts as PNG images.

### FR-08: Report Generation Module
- **FR-08.1 [Should]:** The system should allow users to export analysis results as a CSV file.
- **FR-08.2 [Could]:** The system could generate a formatted PDF report summarising the analysis results.

### FR-09: Admin Module
- **FR-09.1 [Must]:** Admin users must be able to view all registered user accounts.
- **FR-09.2 [Must]:** Admin users must be able to deactivate user accounts.
- **FR-09.3 [Should]:** Admin users should be able to view system-level usage statistics.
- **FR-09.4 [Should]:** Admin users should be able to manage API key configurations for data collection.

### FR-10: Real-Time Tracking Module
- **FR-10.1 [Must]:** The system must support real-time WebSocket connections for live sentiment tracking of active queries.
- **FR-10.2 [Must]:** The dashboard must update automatically as new posts arrive without requiring a page refresh.
- **FR-10.3 [Should]:** Users should be able to set a specific threshold for real-time alerting (e.g., negative sentiment spike).

### FR-11: Configurable User Options
- **FR-11.1 [Must]:** Users must be able to enable or disable specific platforms (Twitter/Reddit) at any time through a settings panel.
- **FR-11.2 [Must]:** Users must be able to dynamically select which sentiment model (VADER vs. BERT) is actively used for processing their streams.
- **FR-11.3 [Could]:** Users could enable dark mode or light mode visual themes for the dashboard.

---

## 3.6 Non-Functional Requirements

Non-functional requirements define how the system should behave — the qualities and constraints that govern its operation beyond the specific functions it performs.

| Requirement | Category | Description |
|-------------|----------|-------------|
| NFR-01 | Performance | The system must complete sentiment analysis of up to 1,000 posts using VADER within 30 seconds. |
| NFR-02 | Performance | The system must return dashboard data within 3 seconds for datasets up to 10,000 posts. |
| NFR-03 | Scalability | The backend must be designed to handle up to 50 concurrent users without degraded performance on the available infrastructure. |
| NFR-04 | Security | All API endpoints must require JWT authentication, except the login and registration endpoints. |
| NFR-05 | Security | User passwords must be hashed using bcrypt with a work factor of at least 12 before storage. |
| NFR-06 | Security | The system must implement input validation and sanitisation on all user-supplied parameters to prevent injection attacks. |
| NFR-07 | Reliability | The system must achieve an uptime of at least 99% during the evaluation period when deployed on the target cloud infrastructure. |
| NFR-08 | Usability | The dashboard must be usable by a person with no programming knowledge, as verified by user testing. |
| NFR-09 | Maintainability | All backend modules must include docstrings and inline comments sufficient for an unfamiliar developer to understand the code within one hour of review. |
| NFR-10 | Portability | The system must be runnable locally using Docker Compose with a single command. |
| NFR-11 | Accuracy | The sentiment classifier must achieve a macro-averaged F1-score of at least 0.80 on the standard Twitter sentiment benchmark dataset. |
| NFR-12 | Accessibility | The frontend dashboard must pass WCAG 2.1 Level AA colour contrast requirements. |
| NFR-13 | Compliance | The system must only collect and store data that is publicly available through official API channels and must comply with the terms of service of X and Reddit. |

*Table 3.2: Non-Functional Requirements*

---
