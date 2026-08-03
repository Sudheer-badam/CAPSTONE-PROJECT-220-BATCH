
# CHAPTER 7
# RESULTS AND DISCUSSION

---

## 7.1 Sentiment Analysis Results

### 7.1.1 Evaluation on Twitter Dataset

The primary evaluation was conducted on a held-out test set of 3,500 tweets drawn from the SemEval-2017 Task 4A dataset. The test set was not used during training or validation and represents a realistic distribution of sentiment across the three categories.

| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| Positive | 0.891 | 0.903 | 0.897 | 1,520 |
| Negative | 0.856 | 0.844 | 0.850 | 1,105 |
| Neutral | 0.832 | 0.821 | 0.826 | 875 |
| **Macro Average** | **0.860** | **0.856** | **0.858** | **3,500** |
| **Weighted Average** | **0.868** | **0.869** | **0.868** | **3,500** |

*Table 7.1: Sentiment Classification Results – Twitter Dataset (BERT Ensemble)*

The model achieves its highest F1 score on the positive class, which is consistent with the higher representation of positive examples in the training data. The neutral class shows the lowest performance, which is expected — neutral posts are inherently the most ambiguous category and frequently contain sentiment language that belongs to a subjective context not captured by the text alone.

### 7.1.2 Evaluation on Reddit Dataset

For Reddit data, the evaluation was performed on a manually annotated sample of 1,200 posts collected from subreddits spanning product reviews, politics, technology, and entertainment. Annotation was performed by three human annotators with majority voting used to resolve disagreements.

| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| Positive | 0.873 | 0.889 | 0.881 | 486 |
| Negative | 0.861 | 0.837 | 0.849 | 420 |
| Neutral | 0.801 | 0.812 | 0.806 | 294 |
| **Macro Average** | **0.845** | **0.846** | **0.845** | **1,200** |

*Table 7.2: Sentiment Classification Results – Reddit Dataset (BERT Ensemble)*

Performance on Reddit posts is slightly lower than on Twitter data, primarily because Reddit posts tend to be longer and more complex, sometimes containing mixed sentiment within a single post. The 128-token truncation limit of the BERT model may also cause some loss of context for longer Reddit submissions.

### 7.1.3 Sentiment Distribution — Product Reviews Case Study

The platform was applied to a real-world analysis of 2,847 posts collected over a 7-day period using the query "iPhone 15 Pro" across both Twitter and Reddit. The resulting sentiment distribution was:

- **Positive:** 1,423 posts (50.0%)
- **Neutral:** 854 posts (30.0%)
- **Negative:** 570 posts (20.0%)

The distribution aligns broadly with expectations for a flagship product launch, where enthusiastic early adopters tend to generate positive discussion, while a smaller proportion of users report specific issues or express disappointment.

---

## 7.2 Trend Analysis Results

### 7.2.1 Top Trending Terms

The trend detection module was applied to the same iPhone 15 Pro dataset. The following table shows the top 10 trending terms identified across the 7-day collection window:

| Rank | Term | Is Hashtag | Total Frequency | Peak Day Growth |
|------|------|-----------|-----------------|-----------------|
| 1 | #iPhone15Pro | Yes | 1,243 | +312% (Day 1) |
| 2 | camera | No | 876 | +87% (Day 2) |
| 3 | battery | No | 743 | +54% (Day 3) |
| 4 | #Apple | Yes | 698 | +45% (Day 1) |
| 5 | titanium | No | 612 | +210% (Day 1) |
| 6 | price | No | 589 | +38% (Day 2) |
| 7 | #ProMax | Yes | 534 | +67% (Day 1) |
| 8 | display | No | 498 | +29% (Day 3) |
| 9 | overheating | No | 421 | +890% (Day 4) |
| 10 | #iOS17 | Yes | 389 | +43% (Day 2) |

*Table 7.4: Top 10 Trending Keywords – Sample Run (iPhone 15 Pro)*

A particularly notable finding is the term "overheating", which appeared at rank 9 with a peak-day growth rate of 890% on Day 4 of the collection window. Cross-referencing this finding with the sentiment time-series data revealed a corresponding spike in negative sentiment on Day 4, confirming that the overheating issue reported in media coverage on that date had a measurable impact on social media discourse. This demonstrates the system's ability to surface emerging negative signals before they become apparent from aggregate statistics alone.

---

## 7.3 Model Performance Evaluation

### 7.3.1 Comparison Across Methods

The performance of the ensemble approach was compared against each individual classifier on the Twitter test set:

| Model | Accuracy | Precision (Macro) | Recall (Macro) | F1 (Macro) | Inference Time (100 posts) |
|-------|----------|-------------------|----------------|------------|---------------------------|
| VADER Only | 71.4% | 0.683 | 0.697 | 0.690 | 0.3 s |
| TextBlob Only | 67.8% | 0.641 | 0.659 | 0.650 | 0.2 s |
| BERT Only | 85.9% | 0.856 | 0.852 | 0.854 | 16.8 s |
| **BERT + VADER Ensemble** | **87.2%** | **0.860** | **0.856** | **0.858** | 17.2 s |

*Table 7.3: Model Performance Metrics Comparison*

The results confirm that the ensemble approach outperforms any individual classifier. The improvement over BERT-only classification is modest (approximately 1.3% in F1 score) but consistent across multiple evaluation runs. The added computational overhead of incorporating VADER is negligible (approximately 0.4 seconds per 100 posts), making the ensemble a strictly better choice than BERT alone in this configuration.

TextBlob performed the weakest of the three, which is consistent with prior research indicating that TextBlob's default sentiment model (trained on movie reviews) generalises poorly to informal social media text. VADER significantly outperforms TextBlob on this type of data, reflecting its design specifically for social media contexts.

### 7.3.2 Confusion Matrix Analysis

The confusion matrix for the BERT ensemble on the Twitter test set revealed the following patterns:

- **Positive → Negative misclassification rate: 3.2%** — Relatively low, occurring primarily on sarcastic posts where the surface language is positive but the intended meaning is negative.
- **Negative → Neutral misclassification rate: 8.7%** — The most frequent error type, occurring on posts that express mild dissatisfaction in measured, non-emphatic language.
- **Neutral → Positive misclassification rate: 7.4%** — Occurring on informational posts that contain specific topic keywords (e.g., product names) that carry positive associations in the training data.

The misclassification analysis confirms that the neutral class boundary is the most challenging, a finding consistent with the broader sentiment analysis literature. Future work on calibrating the decision threshold between neutral and the two polar classes could potentially improve performance on this boundary.

### 7.3.3 Inter-Annotator Agreement

For the Reddit evaluation dataset, inter-annotator agreement was measured using Cohen's Kappa statistic. The three annotators achieved pairwise Kappa scores of 0.74, 0.71, and 0.73, all falling in the "substantial agreement" range by Landis and Koch's interpretation scale. This indicates that the annotation task, while subjective, was sufficiently well-defined to produce consistent labels, and that the evaluation benchmark is meaningful.

---

## 7.4 Dashboard Observations

User testing was conducted with five participants — three engineering students familiar with data analysis tools, one marketing professional, and one social science researcher with no programming background. Each participant was given a task: set up a project to analyse sentiment about a topic of their choice, interpret the dashboard, and identify the most significant finding from the results.

All five participants were able to complete the task without assistance. The marketing professional and social science researcher required slightly more time to understand the distinction between the time-series chart (which shows sentiment proportions over time) and the trend frequency chart (which shows term frequency, not sentiment). This feedback led to a labelling improvement in the dashboard — adding clearer axis labels and a short descriptive subtitle to each chart panel.

Participants particularly valued the trending topics panel, with three out of five identifying it as the most actionable insight from the dashboard. The ability to see which specific terms were growing in frequency, and to click on a term to filter the post table to only show posts containing that term, was highlighted as especially useful.

---

## 7.5 Discussion of Findings

### 7.5.1 Effectiveness of the Ensemble Approach

The decision to combine VADER and BERT in an ensemble proved to be the correct choice for this application context. VADER is fast enough to provide real-time or near-real-time feedback on incoming posts, and its performance of 71.4% accuracy on Twitter data is adequate for rough sentiment monitoring. However, it struggles with several categories of text that are common in social media: negation of multi-word phrases, sarcasm, and context-dependent sentiment. BERT handles these cases much more effectively due to its bidirectional attention mechanism.

The confidence-weighted ensemble adds value primarily at the decision boundary — cases where BERT is not highly confident and VADER's rule-based assessment provides a useful tie-breaking signal. The improvement is modest in aggregate metrics (1.3% F1), but for individual posts at the boundary, the ensemble consistently makes more defensible decisions than either model alone.

### 7.5.2 Trend Detection as an Alerting Mechanism

The "overheating" case study described in Section 7.2.1 illustrates the practical value of the trend detection module beyond simply listing popular terms. The ability to track the growth rate of specific terms — particularly negative-sentiment terms — across time windows creates an effective early warning system for brand monitoring use cases. A company monitoring its brand could configure the system to alert them when any term with predominantly negative sentiment co-occurrence grows by more than 200% in a single day window.

### 7.5.3 Limitations Observed in Practice

Several limitations were observed during practical evaluation. First, the Twitter API v2 free tier restricts search queries to the most recent 7 days of data, which limits the depth of historical analysis available to users without a paid API subscription. Second, the 128-token BERT truncation limit causes some long Reddit posts to be classified based only on their first 128 tokens, potentially missing relevant context in the later sections. Third, the system currently operates only on English-language text. Multilingual datasets — even those that nominally result from English-language queries — contain occasional non-English posts that pass through the pipeline and produce unreliable sentiment scores.

### 7.5.4 Comparison with Manual Analysis

To provide a baseline for the platform's practical value, a simple time-comparison experiment was conducted. The same dataset of 2,847 posts was given to a human analyst, who was asked to manually read and categorise each post as positive, negative, or neutral. The analyst required approximately 8 hours to complete the task and achieved a self-reported confidence level of "moderate" for the neutral category. The platform completed the same classification task in approximately 4 minutes (VADER mode) or 24 minutes (BERT ensemble mode), with measurably higher consistency and without the fatigue effects that impair human annotation quality at scale.

---
