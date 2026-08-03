
# AI-BASED SOCIAL MEDIA SENTIMENT AND TREND ANALYSIS PLATFORM

---

## FINAL YEAR B.TECH CAPSTONE PROJECT REPORT

**Submitted in partial fulfilment of the requirements for the degree of**

**Bachelor of Technology**
**in**
**Computer Science and Engineering**

---

**Submitted by:**

| Student Name | Roll Number |
| :--- | :--- |
| **KOKKILIGADDA TULASI VENKATA DURGA** | **2300032267** |
| **BADAM SUDHEER REDDY** | **2300033278** |
| **GARIKAPATI SATYA KARTHIKA** | **2300030988** |
| **MITTA KAVYA NAYANA** | **2300033848** |
| **INTI HANITHA SAI GAYATHRI** | **2300032512** |

**Department of Computer Science and Engineering**
**KL University, Koneru Lakshmaiah Education Foundation**
**Guntur, Andhra Pradesh – 522302**

**Academic Year: 2024–2025**

---

**Under the Guidance of:**

**Mr. M. Subba Rao**
**Assistant Professor**
**Department of Computer Science and Engineering**
**KL University**

---

## DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
## KL UNIVERSITY
## KONERU LAKSHMAIAH EDUCATION FOUNDATION
## 2024–2025

---

---

# CERTIFICATE

This is to certify that the project report entitled **"AI-Based Social Media Sentiment and Trend Analysis Platform"** submitted by **KOKKILIGADDA TULASI VENKATA DURGA** (Roll No.: 2300032267), **BADAM SUDHEER REDDY** (Roll No.: 2300033278), **GARIKAPATI SATYA KARTHIKA** (Roll No.: 2300030988), **MITTA KAVYA NAYANA** (Roll No.: 2300033848), and **INTI HANITHA SAI GAYATHRI** (Roll No.: 2300032512), in partial fulfilment of the requirements for the award of the degree of **Bachelor of Technology in Computer Science and Engineering** from **KL University (Koneru Lakshmaiah Education Foundation)**, is a record of bonafide work carried out under my supervision and guidance during the academic year 2024–2025.

The project work described in this report is original and has not been submitted elsewhere for the award of any other degree or diploma.

---

**Project Guide:**

Name: **Mr. M. Subba Rao**

Designation: Assistant Professor

Department: Computer Science and Engineering

Institution: KL University

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_

---

**Head of Department:**

Name: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Designation: Professor & HOD

Department: Computer Science and Engineering

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_

---

**External Examiner:**

Name: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Signature: \_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_

---

---

# DECLARATION

We hereby declare that the project report entitled **"AI-Based Social Media Sentiment and Trend Analysis Platform"** submitted to **KL University (Koneru Lakshmaiah Education Foundation)** in partial fulfilment of the requirements for the award of the degree of **Bachelor of Technology in Computer Science and Engineering** is our original work. The project has been carried out under the guidance of **Mr. M. Subba Rao**, Department of Computer Science and Engineering, KL University.

We further declare that this project has not been submitted, either in part or in full, for the award of any other degree or diploma at this or any other institution or university.

All sources of information, references, and literature used in this project have been duly acknowledged.

---

**KOKKILIGADDA TULASI VENKATA DURGA** (Roll No.: 2300032267)  
**BADAM SUDHEER REDDY** (Roll No.: 2300033278)  
**GARIKAPATI SATYA KARTHIKA** (Roll No.: 2300030988)  
**MITTA KAVYA NAYANA** (Roll No.: 2300033848)  
**INTI HANITHA SAI GAYATHRI** (Roll No.: 2300032512)  

Department of CSE  
KL University

Date: \_\_\_\_\_\_\_\_\_\_

Place: \_\_\_\_\_\_\_\_\_\_

---

---

# ACKNOWLEDGEMENT

The completion of this project would not have been possible without the support, guidance, and encouragement of several individuals, and we take this opportunity to express our sincere gratitude to each of them.

First and foremost, we would like to thank our project guide, **Mr. M. Subba Rao**, Assistant Professor, Department of Computer Science and Engineering, KL University, for the unwavering support and technical direction provided throughout the course of this project. The insightful discussions, constructive feedback during review meetings, and patience in clarifying doubts related to natural language processing and machine learning significantly shaped the direction of this work.

We extend our heartfelt gratitude to the Head of the Department of Computer Science and Engineering, KL University, for providing a supportive academic environment and for ensuring that the necessary infrastructure and laboratory facilities were available throughout the project period.

We are grateful to the entire faculty of the Department of Computer Science and Engineering for their continuous academic support and for instilling a strong foundation in core computer science subjects that proved essential during this project's implementation.

We also wish to acknowledge the contribution of our fellow students and batchmates who participated in user testing sessions and provided candid feedback on the platform's usability. Their suggestions helped improve both the interface design and the overall user experience.

We would like to thank the developers and contributors of the open-source libraries and tools that were used in this project, including the teams behind NLTK, spaCy, Hugging Face Transformers, React.js, and FastAPI. The availability of well-documented open-source resources significantly reduced the time required for foundational development and allowed focus on the core research aspects of the project.

Finally, we express deep gratitude to our families for their constant encouragement and emotional support throughout this academic journey. Their belief in the value of education has always been a source of motivation.

---

**KOKKILIGADDA TULASI VENKATA DURGA** (Roll No.: 2300032267)  
**BADAM SUDHEER REDDY** (Roll No.: 2300033278)  
**GARIKAPATI SATYA KARTHIKA** (Roll No.: 2300030988)  
**MITTA KAVYA NAYANA** (Roll No.: 2300033848)  
**INTI HANITHA SAI GAYATHRI** (Roll No.: 2300032512)

---

---

# ABSTRACT

**Project Title:** AI-Based Social Media Sentiment and Trend Analysis Platform

**Submitted by:**

| Student Name | Roll Number |
| :--- | :--- |
| KOKKILIGADDA TULASI VENKATA DURGA | 2300032267 |
| BADAM SUDHEER REDDY | 2300033278 |
| GARIKAPATI SATYA KARTHIKA | 2300030988 |
| MITTA KAVYA NAYANA | 2300033848 |
| INTI HANITHA SAI GAYATHRI | 2300032512 |

**Guide:** Mr. M. Subba Rao, Assistant Professor, Dept. of CSE, KL University

**Department:** Computer Science and Engineering — KL University (Koneru Lakshmaiah Education Foundation)

**Academic Year:** 2024–2025

---

Social media platforms have evolved from simple communication channels into rich repositories of public sentiment, opinion, and discourse. Every day, millions of users share their thoughts on brands, political events, entertainment, products, and social issues across platforms such as X (formerly Twitter) and Reddit. For businesses, researchers, and policymakers, the ability to systematically monitor and interpret this data represents a significant competitive and analytical advantage. Manual analysis of such volumes of data is neither practical nor scalable, which creates a clear need for automated, intelligent systems capable of processing and understanding the sentiment embedded in social media text.

This project presents the design, development, and evaluation of an **AI-Based Social Media Sentiment and Trend Analysis Platform** — a full-stack web application that automatically collects social media data from public APIs, processes it using established natural language processing pipelines, classifies the sentiment of individual posts as Positive, Negative, or Neutral, identifies trending topics and keywords, and presents the analytical outputs through an interactive, browser-based dashboard.

The platform integrates a range of tools and techniques from the field of NLP and machine learning. Text preprocessing involves tokenisation, stop word removal, lemmatisation, and noise cleaning. Sentiment classification is performed using a combination of lexicon-based methods such as VADER and TextBlob for rule-based scoring, as well as a fine-tuned BERT transformer model for deeper contextual understanding. Trend detection employs term frequency analysis and hashtag aggregation across collected posts, while a keyword extraction module uses TF-IDF and RAKE algorithms to identify the most significant terms in a given dataset.

The frontend of the application is built with React.js and Next.js, utilising TypeScript for type safety and Tailwind CSS for responsive design. Data visualisations are implemented using Chart.js and include sentiment distribution pie charts, time-series trend plots, word clouds, and comparative bar graphs. The backend is developed in Python using FastAPI, with MongoDB serving as the primary data store. Data collection is automated through integration with the X (Twitter) API v2 and the Reddit PRAW library.

The platform was tested using datasets from multiple domains including product reviews, political discussions, and brand-related conversations. Evaluation results indicate that the ensemble sentiment classification approach achieves an accuracy of approximately 87% on standard benchmark test sets, with macro-averaged F1-scores consistently above 0.83. The trend detection module successfully identifies high-frequency and emerging topics with minimal latency under simulated real-time conditions.

The project demonstrates that an accessible, open-source-driven web platform can effectively bridge the gap between raw social media data and actionable analytical insight, providing genuine value for business intelligence, brand monitoring, academic research, and public opinion tracking.

**Keywords:** Sentiment Analysis, Natural Language Processing, Social Media Analytics, BERT, VADER, Trend Detection, React.js, FastAPI, MongoDB, Machine Learning

---

---

# TABLE OF CONTENTS

| Section | Title | Page |
|---------|-------|------|
| | Certificate | ii |
| | Declaration | iii |
| | Acknowledgement | iv |
| | Abstract | v |
| | List of Figures | ix |
| | List of Tables | x |
| | List of Abbreviations | xi |
| **Chapter 1** | **Introduction** | **1** |
| 1.1 | Background | 1 |
| 1.2 | Motivation | 3 |
| 1.3 | Problem Statement | 4 |
| 1.4 | Objectives | 5 |
| 1.5 | Scope of the Project | 6 |
| 1.6 | Organisation of the Report | 7 |
| **Chapter 2** | **Literature Survey** | **8** |
| 2.1 | Introduction to the Review | 8 |
| 2.2 | Review of Related Works | 8 |
| 2.3 | Existing Tools and Platforms | 14 |
| 2.4 | Comparison of Existing Systems | 15 |
| 2.5 | Research Gap | 16 |
| **Chapter 3** | **System Analysis** | **18** |
| 3.1 | Analysis of the Existing System | 18 |
| 3.2 | Limitations of the Existing System | 19 |
| 3.3 | Proposed System | 20 |
| 3.4 | Feasibility Study | 21 |
| 3.5 | Functional Requirements | 23 |
| 3.6 | Non-Functional Requirements | 25 |
| **Chapter 4** | **System Design** | **27** |
| 4.1 | Overall System Architecture | 27 |
| 4.2 | Data Flow Diagram | 29 |
| 4.3 | Use Case Diagram | 31 |
| 4.4 | ER Diagram | 32 |
| 4.5 | Class Diagram | 34 |
| 4.6 | Sequence Diagram | 35 |
| 4.7 | Activity Diagram | 36 |
| 4.8 | Database Design | 37 |
| **Chapter 5** | **Implementation** | **40** |
| 5.1 | Development Environment Setup | 40 |
| 5.2 | Frontend Development | 41 |
| 5.3 | Backend Development | 47 |
| 5.4 | API Integration | 52 |
| 5.5 | NLP Pipeline | 55 |
| 5.6 | Machine Learning Workflow | 58 |
| 5.7 | Sentiment Classification Module | 61 |
| 5.8 | Trend Detection Module | 64 |
| 5.9 | Dashboard Implementation | 66 |
| **Chapter 6** | **Testing and Validation** | **69** |
| 6.1 | Testing Strategy | 69 |
| 6.2 | Unit Testing | 70 |
| 6.3 | Integration Testing | 73 |
| 6.4 | System Testing | 74 |
| 6.5 | Performance Testing | 76 |
| 6.6 | Test Cases | 77 |
| **Chapter 7** | **Results and Discussion** | **80** |
| 7.1 | Sentiment Analysis Results | 80 |
| 7.2 | Trend Analysis Results | 83 |
| 7.3 | Model Performance Evaluation | 84 |
| 7.4 | Dashboard Observations | 87 |
| 7.5 | Discussion of Findings | 88 |
| **Chapter 8** | **Conclusion and Future Scope** | **91** |
| 8.1 | Conclusion | 91 |
| 8.2 | Project Contributions | 92 |
| 8.3 | Limitations | 93 |
| 8.4 | Future Enhancements | 94 |
| | References | 96 |
| | Appendix A – Source Code Samples | 101 |
| | Appendix B – API Documentation | 106 |
| | Appendix C – Dataset Description | 108 |

---

---

# LIST OF FIGURES

| Figure No. | Title | Page |
|------------|-------|------|
| Figure 1.1 | Global Social Media Usage Statistics (2024) | 2 |
| Figure 1.2 | High-Level System Overview | 7 |
| Figure 4.1 | Overall System Architecture Diagram | 28 |
| Figure 4.2 | Level-0 DFD (Context Diagram) | 29 |
| Figure 4.3 | Level-1 DFD | 30 |
| Figure 4.4 | Use Case Diagram | 31 |
| Figure 4.5 | Entity-Relationship Diagram | 33 |
| Figure 4.6 | Class Diagram | 34 |
| Figure 4.7 | Sequence Diagram – Sentiment Analysis Flow | 35 |
| Figure 4.8 | Activity Diagram – Data Collection and Analysis | 36 |
| Figure 5.1 | NLP Preprocessing Pipeline | 56 |
| Figure 5.2 | Machine Learning Model Training Workflow | 59 |
| Figure 5.3 | BERT Fine-Tuning Architecture | 63 |
| Figure 5.4 | Dashboard Home Screen | 67 |
| Figure 5.5 | Sentiment Distribution Chart | 67 |
| Figure 5.6 | Trending Topics Panel | 68 |
| Figure 7.1 | Sentiment Distribution – Product Reviews Dataset | 81 |
| Figure 7.2 | Time-Series Sentiment Trend Plot | 82 |
| Figure 7.3 | Keyword Word Cloud | 83 |
| Figure 7.4 | Confusion Matrix – BERT Model | 85 |
| Figure 7.5 | Model Accuracy Comparison Bar Chart | 86 |
| Figure 7.6 | Precision-Recall Curve | 87 |

---

---

# LIST OF TABLES

| Table No. | Title | Page |
|-----------|-------|------|
| Table 2.1 | Summary of Related Works | 13 |
| Table 2.2 | Comparison of Existing Sentiment Analysis Platforms | 15 |
| Table 3.1 | Functional Requirements – Priority Matrix | 24 |
| Table 3.2 | Non-Functional Requirements | 26 |
| Table 4.1 | MongoDB Collection Schema – Posts | 37 |
| Table 4.2 | MongoDB Collection Schema – Users | 38 |
| Table 4.3 | MongoDB Collection Schema – Analysis Results | 39 |
| Table 5.1 | REST API Endpoints | 53 |
| Table 5.2 | NLP Preprocessing Steps and Methods | 57 |
| Table 5.3 | Hyperparameters for BERT Fine-Tuning | 63 |
| Table 6.1 | Unit Test Cases – Preprocessing Module | 71 |
| Table 6.2 | Unit Test Cases – Sentiment Module | 72 |
| Table 6.3 | Integration Test Cases | 74 |
| Table 6.4 | System Test Scenarios | 75 |
| Table 6.5 | Performance Benchmarks | 76 |
| Table 7.1 | Sentiment Classification Results – Twitter Dataset | 80 |
| Table 7.2 | Sentiment Classification Results – Reddit Dataset | 81 |
| Table 7.3 | Model Performance Metrics Comparison | 85 |
| Table 7.4 | Top 10 Trending Keywords – Sample Run | 84 |

---

---

# LIST OF ABBREVIATIONS

| Abbreviation | Full Form |
|-------------|-----------|
| AI | Artificial Intelligence |
| API | Application Programming Interface |
| BERT | Bidirectional Encoder Representations from Transformers |
| CLI | Command Line Interface |
| CNN | Convolutional Neural Network |
| CPU | Central Processing Unit |
| CORS | Cross-Origin Resource Sharing |
| CSE | Computer Science and Engineering |
| CSS | Cascading Style Sheets |
| DFD | Data Flow Diagram |
| ER | Entity-Relationship |
| FastAPI | Fast Application Programming Interface (Python framework) |
| GPU | Graphics Processing Unit |
| HTML | HyperText Markup Language |
| HTTP | HyperText Transfer Protocol |
| IDE | Integrated Development Environment |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| ML | Machine Learning |
| MongoDB | Document-oriented NoSQL Database |
| NLP | Natural Language Processing |
| NLTK | Natural Language Toolkit |
| NoSQL | Not Only SQL |
| PRAW | Python Reddit API Wrapper |
| RAKE | Rapid Automatic Keyword Extraction |
| RAM | Random Access Memory |
| REST | Representational State Transfer |
| RFC | Request for Comments |
| SVM | Support Vector Machine |
| TF-IDF | Term Frequency–Inverse Document Frequency |
| UI | User Interface |
| URL | Uniform Resource Locator |
| VADER | Valence Aware Dictionary and Sentiment Reasoner |
| XSS | Cross-Site Scripting |

---
