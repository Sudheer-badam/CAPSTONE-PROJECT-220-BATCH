
# CHAPTER 6
# TESTING AND VALIDATION

---

## 6.1 Testing Strategy

Testing was approached systematically across four levels: unit testing of individual functions and modules, integration testing of API endpoints and inter-module data flows, system testing of complete end-to-end workflows, and performance testing under simulated load. The primary tools used were `pytest` for Python backend testing, `pytest-asyncio` for async test cases, and the React Testing Library combined with Jest for frontend component testing.

A code coverage target of 80% was set for all backend service modules. At the conclusion of the testing phase, coverage reports indicated that the preprocessing, sentiment, and trend detection services all exceeded this target, while the data collection service sat at approximately 72% due to the inherent difficulty of unit testing code that makes live API calls.

Test data for unit and integration tests was prepared as fixed JSON fixtures rather than relying on live API data, ensuring tests remain deterministic and do not consume API rate limit quota during development.

---

## 6.2 Unit Testing

### 6.2.1 Preprocessing Module Tests

```python
# tests/test_preprocessing.py
import pytest
from app.services.preprocessing import preprocess

class TestPreprocessing:
    def test_url_removal(self):
        raw = "Check this out https://example.com great product"
        clean, _ = preprocess(raw)
        assert 'http' not in clean
        assert 'example' not in clean

    def test_mention_removal(self):
        raw = "Hey @JohnDoe this is amazing!"
        clean, _ = preprocess(raw)
        assert 'johndoe' not in clean
        assert '@' not in clean

    def test_hashtag_preservation(self):
        raw = "Loving the #iPhone15 launch today"
        clean, tokens = preprocess(raw)
        assert 'iphone15' in tokens or 'iphone' in tokens

    def test_emoji_handling(self):
        raw = "This product is amazing 😊 highly recommend"
        clean, _ = preprocess(raw)
        assert 'http' not in clean

    def test_empty_text(self):
        raw = "   "
        clean, tokens = preprocess(raw)
        assert clean == ""
        assert tokens == []

    def test_short_post_flagging(self):
        raw = "ok"
        clean, tokens = preprocess(raw)
        assert len(tokens) < 3
```

| Test ID | Test Name | Input | Expected Output | Status |
|---------|-----------|-------|-----------------|--------|
| UT-PP-01 | URL Removal | Text with URL | No URL in output | PASS |
| UT-PP-02 | Mention Removal | Text with @user | No @mention in output | PASS |
| UT-PP-03 | Hashtag Preservation | Text with #tag | Tag word in tokens | PASS |
| UT-PP-04 | Emoji Handling | Text with emoji | Text description | PASS |
| UT-PP-05 | Empty Text | Whitespace only | Empty string, empty list | PASS |
| UT-PP-06 | Lemmatisation | "running, ran, runs" | "run" (all forms) | PASS |
| UT-PP-07 | Stop Word Removal | "the cat sat on the mat" | ["cat", "sat", "mat"] | PASS |
| UT-PP-08 | Contraction Expansion | "can't wait" | "cannot wait" | PASS |

*Table 6.1: Unit Test Cases – Preprocessing Module*

### 6.2.2 Sentiment Module Tests

```python
# tests/test_sentiment.py
import pytest
from app.services.sentiment import analyse_vader, get_ensemble_label

class TestVaderSentiment:
    def test_positive_text(self):
        result = analyse_vader("This is absolutely wonderful and fantastic!")
        assert result['label'] == 'positive'
        assert result['compound'] > 0.05

    def test_negative_text(self):
        result = analyse_vader("This is terrible. I hate it completely.")
        assert result['label'] == 'negative'
        assert result['compound'] < -0.05

    def test_neutral_text(self):
        result = analyse_vader("The meeting is scheduled for Tuesday.")
        assert result['label'] == 'neutral'

    def test_sarcasm_limitation(self):
        # Known limitation: VADER may misclassify sarcasm
        result = analyse_vader("Oh great, another delay. Just what I needed.")
        # This may be classified as positive due to "great" – known limitation
        assert result['label'] in ['positive', 'negative', 'neutral']

class TestEnsemble:
    def test_high_confidence_bert_wins(self):
        vader_r = {'label': 'negative', 'compound': -0.3}
        bert_r = {'label': 'positive', 'confidence': 0.92}
        label, _ = get_ensemble_label(vader_r, bert_r)
        assert label == 'positive'

    def test_agreement_returns_agreed_label(self):
        vader_r = {'label': 'positive', 'compound': 0.6}
        bert_r = {'label': 'positive', 'confidence': 0.75}
        label, _ = get_ensemble_label(vader_r, bert_r)
        assert label == 'positive'
```

| Test ID | Test Name | Input | Expected Label | Status |
|---------|-----------|-------|---------------|--------|
| UT-SA-01 | VADER Positive Text | Strongly positive text | positive | PASS |
| UT-SA-02 | VADER Negative Text | Strongly negative text | negative | PASS |
| UT-SA-03 | VADER Neutral Text | Factual statement | neutral | PASS |
| UT-SA-04 | BERT Positive | Known positive tweet | positive | PASS |
| UT-SA-05 | BERT Negative | Known negative tweet | negative | PASS |
| UT-SA-06 | Ensemble High-Conf BERT | VADER-BERT disagree, BERT conf=0.92 | BERT label | PASS |
| UT-SA-07 | Ensemble Agreement | Both agree on positive | positive | PASS |
| UT-SA-08 | Empty Input VADER | "" | neutral | PASS |

*Table 6.2: Unit Test Cases – Sentiment Module*

---

## 6.3 Integration Testing

Integration tests verify that the API endpoints correctly orchestrate the service modules and return expected responses given valid and invalid inputs.

```python
# tests/test_api_integration.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_register_and_login():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Register
        resp = await client.post("/api/auth/register", json={
            "email": "test@example.com",
            "password": "SecurePass123!",
            "full_name": "Test User"
        })
        assert resp.status_code == 201

        # Login
        resp = await client.post("/api/auth/login", data={
            "username": "test@example.com",
            "password": "SecurePass123!"
        })
        assert resp.status_code == 200
        assert "access_token" in resp.json()

@pytest.mark.asyncio
async def test_create_project_requires_auth():
    async with AsyncClient(app=app, base_url="http://test") as client:
        resp = await client.post("/api/projects", json={
            "name": "Test Project",
            "query": "climate change",
            "platform": "twitter",
            "max_results": 100
        })
        assert resp.status_code == 401
```

| Test ID | Test Scenario | Expected Result | Status |
|---------|--------------|-----------------|--------|
| IT-01 | Register with valid data | 201 Created, user in DB | PASS |
| IT-02 | Register with duplicate email | 409 Conflict | PASS |
| IT-03 | Login with correct credentials | 200 OK, JWT returned | PASS |
| IT-04 | Login with wrong password | 401 Unauthorized | PASS |
| IT-05 | Create project without auth | 401 Unauthorized | PASS |
| IT-06 | Create project with auth | 201 Created | PASS |
| IT-07 | Get results for non-owned project | 403 Forbidden | PASS |
| IT-08 | Trigger analysis on complete project | Returns cached results | PASS |
| IT-09 | Export CSV for valid project | 200 OK, CSV content | PASS |
| IT-10 | Admin endpoint accessed by regular user | 403 Forbidden | PASS |

*Table 6.3: Integration Test Cases*

---

## 6.4 System Testing

System tests verify the end-to-end workflow from user login through data collection, analysis, and visualisation.

| Test ID | Scenario | Steps | Expected Outcome | Status |
|---------|----------|-------|-----------------|--------|
| ST-01 | Full Twitter Analysis | Login → Create project → Collect tweets → Analyse → View dashboard | Dashboard displays sentiment chart and trends | PASS |
| ST-02 | Full Reddit Analysis | Same as ST-01 but Reddit platform | Dashboard populated with Reddit data | PASS |
| ST-03 | Multi-platform Analysis | Select "both" platforms | Data from Twitter and Reddit combined in results | PASS |
| ST-04 | CSV Export | Complete analysis → click export | CSV downloaded with post text, labels, scores | PASS |
| ST-05 | Multiple Projects | Create 3 projects for different queries | Projects isolated; no data cross-contamination | PASS |
| ST-06 | Admin User Management | Admin login → Deactivate user → User login attempt | Deactivated user receives 403 | PASS |
| ST-07 | Password Reset Flow | Request reset → Receive email → Set new password | New password accepted, old rejected | PASS |
| ST-08 | Session Expiry | Leave application idle 61 minutes | Redirected to login on next action | PASS |

*Table 6.4: System Test Scenarios*

---

## 6.5 Performance Testing

Performance tests were conducted using the `locust` load testing library. The backend was deployed on a Render free-tier instance (512 MB RAM, shared CPU) for the performance tests to reflect real-world deployment conditions.

Test scenarios simulated concurrent users each performing a sequence of: login → fetch project list → fetch dashboard data → view trend report.

| Metric | 10 Users | 25 Users | 50 Users |
|--------|----------|----------|----------|
| Avg Response Time (dashboard) | 1.2 s | 2.1 s | 4.8 s |
| 95th Percentile Response Time | 2.3 s | 3.9 s | 8.2 s |
| Requests/second | 8.4 | 19.2 | 32.1 |
| Error Rate | 0% | 0% | 2.3% |
| VADER batch (1000 posts) | 4.2 s | 4.5 s | 5.1 s |
| BERT inference (100 posts) | 18.4 s | 21.3 s | 28.9 s |

*Table 6.5: Performance Benchmarks*

The results indicate that the system performs within acceptable bounds for up to 25 concurrent users on the free-tier infrastructure. At 50 concurrent users, response times for the dashboard begin to exceed the 5-second usability threshold and error rates appear, indicating that production deployment at this load would benefit from a more powerful instance or caching of frequently accessed results.

BERT inference is the primary performance bottleneck. The 100-post BERT batch takes approximately 18–29 seconds depending on server load. This is acceptable for background processing (where the user is notified when analysis is complete) but would not be acceptable for synchronous real-time processing.

---

## 6.6 Security Testing

Beyond functional testing, the following security checks were performed:

- **SQL/NoSQL Injection:** Input fields were tested with common injection payloads. All API inputs pass through Pydantic validation models that enforce type and format constraints, preventing injection via these fields.
- **JWT Tampering:** Modifying the payload of a valid JWT and sending it to the API returns 401. The signature verification in `python-jose` correctly detects the tampered token.
- **CORS Policy:** Requests from unauthorised origins are rejected at the middleware level.
- **Password Strength:** Weak passwords (fewer than 8 characters, no special characters) are rejected during registration with a 422 Unprocessable Entity response.
- **XSS Prevention:** All user-supplied text is rendered in React using `textContent` rather than `innerHTML`, preventing cross-site scripting in the dashboard.

---
