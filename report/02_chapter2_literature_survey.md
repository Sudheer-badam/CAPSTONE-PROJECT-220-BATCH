
# CHAPTER 2
# LITERATURE SURVEY

---

## 2.1 Introduction to the Review

The field of sentiment analysis has been the subject of active academic research for over two decades, and the published literature is correspondingly rich and varied. This chapter reviews the most relevant prior works, tracing the evolution of sentiment analysis techniques from early lexicon-based methods to contemporary transformer architectures. It also surveys commercially available sentiment analysis platforms and identifies the specific gaps that the proposed project addresses. The works reviewed here were selected for their relevance to the core technical challenges of this project: classifying sentiment in short, informal social media text and detecting emerging trends from large volumes of posts.

---

## 2.2 Review of Related Works

### 2.2.1 Foundational Works in Sentiment Analysis

The foundational academic work on automated opinion analysis was carried out in the early 2000s. **Pang, Lee, and Vaithyanathan (2002)** published what is widely regarded as a seminal paper on sentiment classification using machine learning. Working with a corpus of movie reviews, they demonstrated that Naive Bayes, Maximum Entropy, and Support Vector Machine classifiers could classify the sentiment of reviews as positive or negative with accuracy ranging from 78% to 82%, depending on the feature representation used. A particularly important finding was that simple unigram presence features outperformed more complex feature combinations such as adjective lists or part-of-speech tags in this task. This work established supervised machine learning as a viable paradigm for sentiment classification and influenced the field for years afterward.

**Turney (2002)** proposed a complementary approach based on semantic orientation. Rather than training a classifier on labelled examples, Turney used statistical co-occurrence data from a large web corpus to estimate the semantic orientation of phrases. Phrases that co-occurred frequently with words like "excellent" were assigned positive orientation, while those co-occurring with "poor" were assigned negative orientation. The method achieved roughly 74% accuracy on a diverse set of review domains, demonstrating that unsupervised or semi-supervised methods could also produce useful results for opinion mining.

**Liu (2012)** provided a comprehensive survey and taxonomic framework for opinion mining and sentiment analysis in his book, distinguishing between document-level, sentence-level, and aspect-level sentiment analysis. The aspect-level analysis, which aims to determine not only whether the overall sentiment of a text is positive or negative but also which specific aspects of an entity are being evaluated and how, represented a significant conceptual advancement beyond binary classification and is relevant to the keyword extraction component of this project.

### 2.2.2 Lexicon-Based and Rule-Based Approaches

**Hutto and Gilbert (2014)** introduced VADER (Valence Aware Dictionary and Sentiment Reasoner), a lexicon and rule-based sentiment analysis tool specifically designed for social media text. Unlike earlier lexicons such as SentiWordNet, VADER was built from the ground up using data from social media contexts and incorporated rules for handling capitalisation, punctuation, degree modifiers (such as "very" or "extremely"), and negations. In their evaluation, VADER outperformed individual human raters on a dataset of social media posts and matched or exceeded the performance of several machine learning-based models when evaluated on multiple benchmark datasets. Crucially, VADER is computationally lightweight and does not require training data, making it highly practical for real-time applications.

**TextBlob**, developed by Loria et al. and based on the Pattern library by De Smedt and Daelemans (2012), provides a simple API for polarity and subjectivity scoring of English text. While not specifically designed for social media, TextBlob performs adequately on short texts and is valued for its ease of integration in Python-based applications. Its subjectivity score — which estimates whether a piece of text is an objective statement of fact or a subjective expression of opinion — is a useful supplementary signal in some analytical contexts.

### 2.2.3 Machine Learning Approaches

**Go, Bhayani, and Huang (2009)** published an influential paper on Twitter sentiment analysis using distant supervision. Rather than manually labelling a training dataset, they exploited the presence of emoticons (happy and sad faces) in tweets as noisy but readily available sentiment labels, automatically creating a large training corpus. They trained Naive Bayes, Maximum Entropy, and SVM classifiers on this dataset and achieved accuracies of around 80–83% on a manually labelled test set. The distant supervision approach addressed a key limitation of supervised learning in sentiment analysis — the cost of creating large, high-quality labelled datasets — and has been widely adopted in subsequent research.

**Jiang, Yu, Zhou, Liu, and Zhao (2011)** addressed the challenge of aspect-level sentiment analysis on Twitter, where the same tweet may express sentiment towards multiple entities simultaneously. They proposed a target-dependent sentiment classification approach that incorporated contextual information about the specific entity mentioned in the tweet (the "target") in addition to the surrounding text. Their approach consistently outperformed standard document-level methods, underscoring the importance of aspect sensitivity.

**Agarwal, Xie, Vovsha, Rambow, and Passonneau (2011)** presented a study comparing feature engineering approaches for Twitter sentiment analysis. Their experiments evaluated the contributions of part-of-speech tags, Twitter-specific features such as hashtags and emoticons, and various lexicon-based features in combination with machine learning classifiers. They found that a combination of syntactic and lexical features produced the best results, but also observed that feature tuning for Twitter-specific characteristics was essential for good performance.

### 2.2.4 Deep Learning Approaches

**Kim (2014)** introduced Convolutional Neural Networks (CNNs) for sentence classification and demonstrated that a simple CNN architecture trained on static word vectors (Word2Vec embeddings) could outperform considerably more complex models on several sentiment benchmarks. The key insight was that CNNs could automatically learn to capture local patterns — n-gram-like features — from raw word sequences, eliminating the need for manual feature engineering. This work motivated significant follow-on research into deep learning for NLP tasks including sentiment analysis.

**Socher, Penbhavi, Manning, and Ng (2013)** introduced Recursive Neural Tensor Networks and the Stanford Sentiment Treebank, a dataset in which each phrase in a parse tree of a review sentence was annotated with fine-grained sentiment labels. This approach enabled the modelling of compositional semantics — how the sentiment of larger phrases is built up from the sentiments of their constituents — and achieved notably better performance on fine-grained sentiment classification than prior methods. While the recursive architecture is computationally intensive, the Stanford Sentiment Treebank dataset it introduced remains a standard benchmark.

### 2.2.5 Transformer-Based Approaches

The introduction of **BERT (Devlin, Chang, Lee, and Toutanova, 2019)** represented a paradigm shift in NLP. BERT is pre-trained on a large general corpus (Books Corpus and English Wikipedia) using two unsupervised objectives — Masked Language Modelling and Next Sentence Prediction — and then fine-tuned on specific downstream tasks with minimal architectural modification. The key innovation of BERT over prior recurrent and convolutional neural network architectures was its use of bidirectional context: whereas earlier models read text left-to-right or used fixed representations, BERT's self-attention mechanism allows it to consider the full context of each word simultaneously, enabling much richer representations of meaning.

For sentiment analysis, fine-tuning BERT on labelled sentiment datasets has consistently produced state-of-the-art results. **Sun, Qiu, Xu, and Huang (2019)** proposed several methods for fine-tuning BERT specifically for aspect-level sentiment classification and demonstrated substantial improvements over non-BERT baselines. Similarly, **González-Carvajal and Garrido-Merchán (2021)** conducted a systematic comparison of BERT and conventional machine learning methods for sentiment analysis on the SST-2 and IMDb benchmarks, confirming BERT's superior performance across the board.

**RoBERTa (Liu et al., 2019)** improved upon BERT by training for longer, on more data, with larger batch sizes, and without the Next Sentence Prediction objective. RoBERTa demonstrated that BERT was significantly under-trained in its original configuration and that these relatively simple training improvements produced consistent gains on downstream tasks.

**DistilBERT (Sanh, Debut, Chaumond, and Wolf, 2019)** addressed the practical concern that BERT models are too large and slow for deployment in latency-sensitive applications. DistilBERT is a smaller, faster version of BERT trained using knowledge distillation, retaining approximately 97% of BERT's performance on GLUE benchmarks while being 40% smaller and 60% faster. This trade-off makes DistilBERT particularly attractive for real-time sentiment analysis applications.

### 2.2.6 Trend Detection and Topic Modelling

**Blei, Ng, and Jordan (2003)** introduced Latent Dirichlet Allocation (LDA), a generative probabilistic model for topic modelling that has been widely applied to social media text. LDA assumes that documents are mixtures of topics, and that topics are distributions over words. Given a corpus of documents, LDA infers the topic distributions of each document and the word distributions of each topic simultaneously. While LDA is effective for static corpora, it is less well-suited to the dynamic, real-time nature of social media trend detection.

**Cataldi, Di Caro, and Schifanella (2010)** proposed an approach specifically designed for detecting emerging topics on Twitter in real time, using a graph-based method that models the temporal evolution of term usage. Terms that showed rapid growth in usage frequency within a sliding time window were identified as potential trend signals. The approach was evaluated on a Twitter corpus and demonstrated the ability to identify emerging trends several hours before they appeared in mainstream media.

**Mathioudakis and Koudas (2010)** developed TwitterMonitor, a system for detecting trends on Twitter in real time. Their approach combined a burst detection algorithm inspired by the Kleinberg model with a method for grouping trending terms into coherent topics. TwitterMonitor was able to identify both short-lived spikes in term usage and more sustained trend signals, and demonstrated real-time operation on a live Twitter stream.

### 2.2.7 Hybrid and Ensemble Approaches

Several researchers have proposed combining lexicon-based and machine learning methods to exploit the complementary strengths of each approach. **Thelwall, Buckley, and Paltoglou (2012)** evaluated SentiStrength, a lexicon-based tool designed for short social media texts, against several machine learning approaches and found that for very short texts such as tweets, lexicon methods with appropriate handling of negation and amplification could perform comparably to trained classifiers. They suggested that for short texts, the limited context available makes deep contextual modelling less effective.

**Wang, Liu, Sun, Wang, and Wang (2015)** proposed a sentiment classification approach based on combining deep learning features with handcrafted sentiment lexicon features, demonstrating that the combination consistently outperformed either approach used in isolation. This finding supports the ensemble approach adopted in this project, where VADER and TextBlob scores are incorporated as features alongside the BERT model's output.

---

## 2.3 Existing Tools and Platforms

Several commercial and open-source tools currently provide social media sentiment analysis capabilities. The most relevant are described below.

**Brandwatch** is a commercial social listening platform that provides sentiment analysis, trend monitoring, and audience analytics across a wide range of social platforms. It offers a polished dashboard and integration with a large number of data sources. However, it is priced at an enterprise level and is not accessible to individual researchers or small organisations.

**Sprout Social** is a social media management platform that includes sentiment analysis functionality as part of its broader social media management suite. Like Brandwatch, it is priced for business use and is not available as a standalone analytical tool for custom research queries.

**Hootsuite Insights** (formerly Brandwatch Analytics integrated into Hootsuite) provides similar sentiment and social listening capabilities with a focus on social media management use cases. The sentiment analysis is largely treated as a secondary feature within the social management workflow rather than as the primary analytical focus.

**MonkeyLearn** is a no-code machine learning platform that allows users to build custom text classification models, including sentiment classifiers, by uploading labelled training data and training models through a web interface. While flexible, it requires users to provide their own labelled data and does not include built-in social media data collection.

**IBM Watson Natural Language Understanding** provides a cloud API for sentiment analysis, entity recognition, and keyword extraction. It is accurate and well-documented but carries per-call pricing that can become expensive at scale and does not include a frontend interface or data collection capability.

**Talkwalker** is an enterprise social media analytics platform that includes AI-powered sentiment analysis, trend detection, and visual analytics. It is among the most comprehensive tools available but is correspondingly expensive and targeted at large organisations.

---

## 2.4 Comparison of Existing Systems

| Feature | Brandwatch | MonkeyLearn | IBM Watson NLU | This Project |
|---------|-----------|-------------|----------------|-------------|
| Data Collection | Yes (licensed) | No | No | Yes (API-based) |
| Sentiment Analysis | Yes | Yes | Yes | Yes (BERT + VADER) |
| Trend Detection | Yes | No | No | Yes |
| Keyword Extraction | Yes | No | Yes | Yes (TF-IDF + RAKE) |
| Custom Dashboard | Yes | Limited | No | Yes (React.js) |
| Open Source | No | No | No | Yes |
| Cost | Enterprise | Freemium | Pay-per-use | Free |
| Self-Hosted Option | No | No | No | Yes |
| Social Media API Integration | Yes | No | No | Yes |
| Academic Research Use | Restricted | Limited | Limited | Full |

*Table 2.2: Comparison of Existing Sentiment Analysis Platforms*

The comparison table illustrates a clear pattern: commercial platforms offer comprehensive functionality but at a cost and with restrictions that limit their utility for academic research and independent analysis. Open-source and API-based tools, on the other hand, tend to offer components of the required functionality — such as text classification or API access — but not the integrated end-to-end workflow that this project aims to provide.

---

## 2.5 Research Gap

The review of related works and existing tools reveals several important gaps that justify the development of this project:

**Integration Gap:** While excellent research exists on individual components — sentiment classification algorithms, trend detection methods, keyword extraction techniques — there is a relative scarcity of published work describing the integration of all these components into a cohesive, user-accessible platform. Most academic papers focus on single algorithms evaluated on benchmark datasets, leaving the engineering challenge of building a usable system largely unaddressed.

**Accessibility Gap:** Commercial platforms that do offer comprehensive social media sentiment and trend analysis are priced for enterprise customers and are inaccessible to researchers, students, small businesses, and independent analysts. There is a genuine need for an open, self-hostable alternative that provides comparable core functionality.

**Social-Media-Specific Preprocessing Gap:** Much of the literature on sentiment analysis is based on relatively clean text corpora such as product reviews or news articles. Social media text presents unique preprocessing challenges — hashtags embedded in text, @mentions, URLs, emojis, abbreviations, and code-switching — that require specific handling. Many available tools and academic systems do not adequately address these characteristics.

**Hybrid Model Gap:** The comparison between lexicon-based and transformer-based methods in the literature reveals a trade-off: BERT-based models are more accurate but computationally expensive, while VADER is fast but less accurate on complex or sarcastic text. There is an opportunity to combine both approaches in an ensemble framework that provides users with configurable accuracy-speed trade-offs, which is the approach adopted in this project.

**Real-Time Visualisation Gap:** Existing academic systems typically report results as numerical metrics in tables. There is limited published work on how to design effective real-time visualisation dashboards for social media sentiment data that are both informative and accessible to non-technical users.

This project addresses each of these gaps by building an end-to-end platform that integrates data collection, social-media-aware preprocessing, hybrid sentiment classification, trend detection, and interactive visualisation in a single accessible application.

---

| Paper / Source | Year | Method | Dataset | Accuracy |
|----------------|------|--------|---------|---------|
| Pang, Lee, Vaithyanathan | 2002 | SVM + Unigrams | Movie Reviews | 82.9% |
| Go, Bhayani, Huang | 2009 | SVM, Naive Bayes | Twitter (emoticons) | 83.0% |
| Hutto and Gilbert (VADER) | 2014 | Lexicon + Rules | Social Media | ~85% |
| Kim (CNN) | 2014 | CNN + Word2Vec | SST-2 | 88.1% |
| Devlin et al. (BERT) | 2019 | Transformer | SST-2 | 94.9% |
| Sanh et al. (DistilBERT) | 2019 | Knowledge Distillation | SST-2 | 91.3% |
| This Project (Ensemble) | 2024 | BERT + VADER Ensemble | Twitter + Reddit | ~87.2% |

*Table 2.1: Summary of Key Related Works*

---
