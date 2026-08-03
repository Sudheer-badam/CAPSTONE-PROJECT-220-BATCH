
# CHAPTER 5
# IMPLEMENTATION

---

## 5.1 Development Environment Setup

The development environment was configured on a Windows 11 machine with the following primary tools:

- **Python 3.11** (backend, NLP, ML)
- **Node.js 20 LTS** (frontend)
- **MongoDB Community Server 7.0** (local database)
- **VS Code** with Pylance, ESLint, and Prettier extensions
- **Git** for version control (repository hosted on GitHub)
- **Docker Desktop** for containerised local development

Environment variables were managed using `.env` files (never committed to Git) and the `python-decouple` library on the backend. A `docker-compose.yml` file was created to allow the full stack (backend, MongoDB) to be started with a single command.

---

## 5.2 Frontend Development

### 5.2.1 Project Initialisation

The frontend was bootstrapped using the official Next.js CLI:

```bash
npx create-next-app@latest sentiment-dashboard \
  --typescript --tailwind --eslint --app --src-dir
```

The project structure follows the Next.js App Router convention:

```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
    dashboard/
      page.tsx
      [projectId]/
        page.tsx
    admin/
      page.tsx
    layout.tsx
    globals.css
  components/
    ui/
      Button.tsx
      Card.tsx
      Modal.tsx
    charts/
      SentimentPieChart.tsx
      TrendLineChart.tsx
      KeywordCloud.tsx
      SentimentTimeSeries.tsx
    layout/
      Navbar.tsx
      Sidebar.tsx
  lib/
    api.ts
    auth.ts
    types.ts
  hooks/
    useAuth.ts
    useProject.ts
```

### 5.2.2 Firebase Authentication — Group Login

Rather than implementing a custom authentication system, the project uses **Firebase Authentication** to manage user identity for all group members. Firebase provides a secure, managed identity service that supports Google Sign-In, Email/Password, and role-based access control — all without managing password hashes or JWT secrets manually.

Each group member is registered as an authorised user in the shared Firebase project console. Role information (e.g., `admin`, `member`) is stored as custom claims in the Firebase ID Token, allowing the backend to authorise different actions based on who is logged in.

#### Firebase Project Setup

The Firebase project is initialised once and the configuration is shared across all group members via a `.env` file (never committed to Git):

```
# .env.local (shared securely across group)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sentiment-ai-platform.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sentiment-ai-platform
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sentiment-ai-platform.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abc123
```

```typescript
// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Prevent re-initialisation during hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export default app;
```

#### Google Sign-In for Group Members

All group members log in using their university Google accounts (`@college.edu`). The Google Sign-In popup flow is as follows:

```typescript
// lib/auth.ts
import { auth } from './firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();
// Restrict login to the college domain only
provider.setCustomParameters({ hd: 'college.edu' });

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    return null;
  }
};

export const logout = () => signOut(auth);
```

#### Authentication Context — Group-Aware

A React context wraps the entire application to track the logged-in user and expose their Firebase ID Token, which is sent with every backend API call:

```typescript
// context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: null, loading: true
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get fresh ID token on every auth state change
        const idToken = await firebaseUser.getIdToken();
        setUser(firebaseUser);
        setToken(idToken);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

#### Attaching the Firebase Token to API Calls

```typescript
// lib/api.ts
import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Automatically attach a fresh Firebase ID Token before every request
api.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

#### Backend Token Verification (FastAPI)

The FastAPI backend verifies the Firebase ID Token using the official `firebase-admin` SDK. This ensures only authenticated group members can access protected routes:

```python
# app/core/firebase_auth.py
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Initialise the Firebase Admin SDK once at startup
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Verifies the Firebase ID Token sent in the Authorization header.
    Returns the decoded token payload (uid, email, custom claims).
    """
    token = credentials.credentials
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token.")
    except Exception:
        raise HTTPException(status_code=403, detail="Could not validate credentials.")
```

Protected routes simply use the `get_current_user` dependency:

```python
# app/routers/projects.py
from fastapi import APIRouter, Depends
from app.core.firebase_auth import get_current_user

router = APIRouter()

@router.get("/")
async def list_projects(current_user: dict = Depends(get_current_user)):
    """
    Lists all projects belonging to the currently authenticated group member.
    The user's UID from Firebase identifies their data in MongoDB.
    """
    uid = current_user['uid']
    email = current_user.get('email', '')
    # Query MongoDB for projects created by this user
    # ...
    return {"uid": uid, "email": email, "projects": []}
```

#### Group Member Roles (Custom Claims)

Custom claims are set via the Firebase Admin SDK by the group team lead (admin). This allows the project guide or one designated group member to have elevated access:

```python
# scripts/set_role.py — run once to assign roles to each member
import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# Assign roles to each group member by their Firebase UID
members = [
    {"uid": "uid_of_member_1", "role": "admin"},
    {"uid": "uid_of_member_2", "role": "member"},
    {"uid": "uid_of_member_3", "role": "member"},
    {"uid": "uid_of_member_4", "role": "member"},
]

for member in members:
    auth.set_custom_user_claims(member['uid'], {'role': member['role']})
    print(f"Role '{member['role']}' set for UID: {member['uid']}")
```

The backend then reads the role from the decoded token's custom claims:

```python
def require_admin(current_user: dict = Depends(get_current_user)):
    claims = current_user.get('role', 'member')
    if claims != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required.")
    return current_user
```

| Group Member | Firebase UID | Assigned Role |
|---|---|---|
| [Student 1 Name] | [UID 1] | `admin` |
| [Student 2 Name] | [UID 2] | `member` |
| [Student 3 Name] | [UID 3] | `member` |
| [Student 4 Name] | [UID 4] | `member` |

---

#### 5.2.2a Email & Password Authentication (Login Page)

While Google Sign-In is available for convenience, the platform primarily uses **Firebase Email & Password authentication** so that each group member can log in with their own registered credentials. This is the default login method displayed on the application's login page.

##### Login Page — React Component

```typescript
// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Firebase auth state listener in AuthContext will update automatically
      router.push('/dashboard');
    } catch (err: any) {
      // Map Firebase error codes to user-friendly messages
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Account temporarily locked.');
          break;
        default:
          setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Sign In</h1>
      <p>AI Sentiment Analysis Platform</p>

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p>
        <a href="/auth/forgot-password">Forgot your password?</a>
      </p>
    </div>
  );
}
```

##### Password Reset Flow

```typescript
// app/(auth)/forgot-password/page.tsx
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const handleReset = async (email: string) => {
  await sendPasswordResetEmail(auth, email, {
    // Redirect user back to the login page after resetting
    url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
  });
  alert('Password reset email sent! Check your inbox.');
};
```

##### Registering Group Members (One-Time Setup)

Each group member is registered **once** by the admin using the Firebase Admin SDK. After this, members log in with their email and a password they set themselves:

```python
# scripts/create_group_users.py
import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

group_members = [
    {
        "email": "[student1@college.edu]",
        "password": "[TempPassword@1]",
        "display_name": "[Student 1 Name]",
        "role": "admin"
    },
    {
        "email": "[student2@college.edu]",
        "password": "[TempPassword@2]",
        "display_name": "[Student 2 Name]",
        "role": "member"
    },
    {
        "email": "[student3@college.edu]",
        "password": "[TempPassword@3]",
        "display_name": "[Student 3 Name]",
        "role": "member"
    },
    {
        "email": "[student4@college.edu]",
        "password": "[TempPassword@4]",
        "display_name": "[Student 4 Name]",
        "role": "member"
    },
]

for member in group_members:
    try:
        # Create the user in Firebase Auth
        user = auth.create_user(
            email=member["email"],
            password=member["password"],
            display_name=member["display_name"],
            email_verified=False,
        )
        # Assign role as a custom claim
        auth.set_custom_user_claims(user.uid, {"role": member["role"]})
        print(f"✅ Created: {member['email']} (UID: {user.uid}, Role: {member['role']})")
    except Exception as e:
        print(f"❌ Failed for {member['email']}: {e}")
```

> **Note:** After initial setup, each group member should log in and use the "Forgot Password" link to set their own private password. Temporary passwords should never be shared in chat or stored in the repository.

##### Registered Group Members

| Member | Email | Role | Login Method |
|--------|-------|------|-------------|
| [Student 1 Name] | [student1@college.edu] | `admin` | Email & Password |
| [Student 2 Name] | [student2@college.edu] | `member` | Email & Password |
| [Student 3 Name] | [student3@college.edu] | `member` | Email & Password |
| [Student 4 Name] | [student4@college.edu] | `member` | Email & Password |

##### Route Protection — Redirect Unauthenticated Users

```typescript
// components/ProtectedRoute.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return <>{children}</>;
}
```

All dashboard pages are wrapped with `<ProtectedRoute>` so unauthenticated users are automatically redirected to `/auth/login`. Once logged in, the user's `email` and `displayName` from the Firebase token are displayed in the navbar header.

---

### 5.2.3 Dashboard Components

The main dashboard page fetches project summary data on mount and renders the following primary panels:

1. **Summary Cards** — Displays total post count, percentage positive/negative/neutral, and the date range covered.
2. **Sentiment Pie Chart** — A doughnut chart built with Chart.js showing the proportion of each sentiment category.
3. **Time-Series Line Chart** — Shows how the proportion of positive, negative, and neutral posts has changed over the collected time period.
4. **Keyword Word Cloud** — Renders the top 50 keywords sized proportionally by TF-IDF score.
5. **Trending Topics Panel** — Lists the top 10 trending hashtags and terms with their frequency counts and growth indicators.
6. **Recent Posts Table** — A paginated table displaying individual posts with their assigned sentiment labels and scores.

```typescript
// components/charts/SentimentPieChart.tsx
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
}

export function SentimentPieChart({ data }: { data: SentimentData }) {
  const chartData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [{
      data: [data.positive, data.negative, data.neutral],
      backgroundColor: ['#22c55e', '#ef4444', '#94a3b8'],
      borderWidth: 0,
    }],
  };

  return <Doughnut data={chartData} options={{ responsive: true }} />;
}
```

### 5.2.4 Project Creation Form

The project creation form collects the search query, target platform (Twitter, Reddit, or both), maximum number of posts to retrieve, and an optional date range. Client-side validation is implemented using the `react-hook-form` library with Zod schema validation.

```typescript
const projectSchema = z.object({
  name: z.string().min(3).max(100),
  query: z.string().min(2).max(500),
  platform: z.enum(['twitter', 'reddit', 'both']),
  max_results: z.number().int().min(10).max(1000),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});
```

---

## 5.3 Backend Development

### 5.3.1 FastAPI Application Structure

```
backend/
  app/
    main.py
    core/
      config.py
      security.py
      database.py
    routers/
      auth.py
      projects.py
      posts.py
      analysis.py
      admin.py
    services/
      data_collection.py
      preprocessing.py
      sentiment.py
      trend_detection.py
      keyword_extraction.py
    models/
      user.py
      project.py
      post.py
      result.py
    schemas/
      user_schema.py
      project_schema.py
      analysis_schema.py
  requirements.txt
  Dockerfile
```

### 5.3.2 Application Entry Point

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, projects, posts, analysis, admin
from app.core.database import connect_db

app = FastAPI(title="Sentiment Analysis API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://sentiment-dashboard.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await connect_db()

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
```

### 5.3.3 Authentication Implementation

Password hashing uses `passlib` with `bcrypt`. JWT tokens are generated using the `python-jose` library with the HS256 algorithm.

```python
# app/core/security.py
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
```

The authentication endpoints are implemented using OAuth2 with Password (and hashing), returning the JWT token upon successful validation:

```python
# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import verify_password, create_access_token
from app.core.database import get_db
from app.models.user import User

router = APIRouter()

@router.post("/login", response_model=dict)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    
    # 1. Fetch user from database
    user = await db["users"].find_one({"username": form_data.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 2. Verify hashed password
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Generate JWT Token
    access_token = create_access_token(data={"sub": user["username"]})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": str(user["_id"])
    }
```

### 5.3.4 Database Connection

The database connection uses the `motor` library, which is the async MongoDB driver for Python. This allows FastAPI's async route handlers to interact with the database without blocking the event loop.

```python
# app/core/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DB_NAME]

def get_db():
    return db
```

---

## 5.4 API Integration

### 5.4.1 REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Obtain JWT token | No |
| GET | /api/projects | List user projects | Yes |
| POST | /api/projects | Create new project | Yes |
| GET | /api/projects/{id} | Get project details | Yes |
| DELETE | /api/projects/{id} | Delete project | Yes |
| POST | /api/analysis/collect/{id} | Trigger data collection | Yes |
| POST | /api/analysis/analyse/{id} | Run sentiment analysis | Yes |
| GET | /api/analysis/results/{id} | Get analysis results | Yes |
| GET | /api/analysis/trends/{id} | Get trend data | Yes |
| GET | /api/analysis/keywords/{id} | Get keyword data | Yes |
| GET | /api/analysis/export/{id} | Export results as CSV | Yes |
| GET | /api/admin/users | List all users | Admin |
| PATCH | /api/admin/users/{id} | Update user status | Admin |

*Table 5.1: REST API Endpoints*

### 5.4.2 Twitter API v2 Integration

```python
# app/services/data_collection.py
import tweepy
from app.core.config import settings

def get_twitter_client():
    return tweepy.Client(bearer_token=settings.TWITTER_BEARER_TOKEN)

async def collect_tweets(query: str, max_results: int = 100) -> list[dict]:
    client = get_twitter_client()
    full_query = f"{query} lang:en -is:retweet"
    
    tweets = []
    paginator = tweepy.Paginator(
        client.search_recent_tweets,
        query=full_query,
        tweet_fields=['created_at', 'author_id', 'public_metrics', 'entities'],
        max_results=min(max_results, 100),
    ).flatten(limit=max_results)
    
    for tweet in paginator:
        hashtags = []
        if tweet.entities and 'hashtags' in tweet.entities:
            hashtags = [h['tag'] for h in tweet.entities['hashtags']]
        
        tweets.append({
            'platform': 'twitter',
            'external_id': str(tweet.id),
            'raw_text': tweet.text,
            'posted_at': tweet.created_at,
            'hashtags': hashtags,
            'likes_count': tweet.public_metrics.get('like_count', 0),
            'retweets_count': tweet.public_metrics.get('retweet_count', 0),
        })
    
    return tweets
```

### 5.4.3 Reddit API Integration

```python
import praw
from app.core.config import settings

def get_reddit_client():
    return praw.Reddit(
        client_id=settings.REDDIT_CLIENT_ID,
        client_secret=settings.REDDIT_CLIENT_SECRET,
        user_agent="SentimentAnalysisPlatform/1.0",
    )

async def collect_reddit_posts(query: str, max_results: int = 100) -> list[dict]:
    reddit = get_reddit_client()
    posts = []
    
    for submission in reddit.subreddit("all").search(
        query, sort="relevance", time_filter="month", limit=max_results
    ):
        hashtags = [
            word[1:] for word in submission.selftext.split()
            if word.startswith('#')
        ]
        posts.append({
            'platform': 'reddit',
            'external_id': submission.id,
            'raw_text': f"{submission.title} {submission.selftext}",
            'posted_at': submission.created_utc,
            'hashtags': hashtags,
            'likes_count': submission.score,
            'retweets_count': 0,
        })
    
    return posts
```

---

## 5.5 NLP Pipeline

The NLP preprocessing pipeline is implemented as a sequential series of transformations applied to each raw post before sentiment classification.

### 5.5.1 Pipeline Steps

```
Raw Text
   │
   ▼ Step 1: Decode HTML Entities
   ▼ Step 2: Remove URLs
   ▼ Step 3: Convert Emojis to Text Descriptions
   ▼ Step 4: Remove @mentions
   ▼ Step 5: Clean Hashtags (remove # symbol, keep word)
   ▼ Step 6: Expand Contractions
   ▼ Step 7: Remove Special Characters and Punctuation
   ▼ Step 8: Lowercase
   ▼ Step 9: Tokenise (spaCy)
   ▼ Step 10: Remove Stop Words
   ▼ Step 11: Lemmatise (spaCy)
   ▼ Step 12: Remove Short Tokens (length < 2)
   │
Clean Token List
```

*Figure 5.1: NLP Preprocessing Pipeline*

| Step | Method | Library |
|------|--------|---------|
| HTML Decoding | `html.unescape()` | Python stdlib |
| URL Removal | Regex pattern | `re` |
| Emoji Handling | `emoji.demojize()` | emoji |
| @mention Removal | Regex pattern | `re` |
| Hashtag Cleaning | Regex pattern | `re` |
| Contraction Expansion | `contractions.fix()` | contractions |
| Lowercasing | `.lower()` | Python stdlib |
| Tokenisation | `nlp(text)` | spaCy |
| Stop Word Removal | `token.is_stop` | spaCy |
| Lemmatisation | `token.lemma_` | spaCy |

*Table 5.2: NLP Preprocessing Steps and Methods*

### 5.5.2 Preprocessing Implementation

```python
# app/services/preprocessing.py
import re
import html
import emoji
import spacy
import contractions

nlp = spacy.load("en_core_web_sm")
URL_PATTERN = re.compile(r'http\S+|www\S+')
MENTION_PATTERN = re.compile(r'@\w+')
HASHTAG_PATTERN = re.compile(r'#(\w+)')
SPECIAL_CHARS = re.compile(r'[^a-zA-Z0-9\s]')

def preprocess(raw_text: str) -> tuple[str, list[str]]:
    text = html.unescape(raw_text)
    text = URL_PATTERN.sub('', text)
    text = emoji.demojize(text, delimiters=(' ', ' '))
    text = MENTION_PATTERN.sub('', text)
    text = HASHTAG_PATTERN.sub(r'\1', text)
    text = contractions.fix(text)
    text = SPECIAL_CHARS.sub(' ', text)
    text = text.lower().strip()
    
    doc = nlp(text)
    tokens = [
        token.lemma_ for token in doc
        if not token.is_stop and len(token.text) > 1 and token.is_alpha
    ]
    
    clean_text = ' '.join(tokens)
    return clean_text, tokens
```

---

## 5.6 Machine Learning Workflow

### 5.6.1 Training Dataset

The BERT model was fine-tuned on a combined dataset assembled from the following publicly available sources:

- **Sentiment140 Dataset** — 1.6 million tweets labelled using distant supervision (emoticons). A 50,000-sample stratified subset was used.
- **SemEval-2017 Task 4A** — 12,284 manually annotated tweets with three-class sentiment labels (positive, negative, neutral).
- **Twitter US Airline Sentiment** (Kaggle) — 14,640 tweets about US airlines, labelled by crowdworkers.

After deduplication and filtering for English-language posts, the final training dataset comprised approximately 58,000 samples distributed as: 47% positive, 35% negative, 18% neutral.

### 5.6.2 Fine-Tuning BERT

```python
# training/train_bert.py
from transformers import (
    BertTokenizerFast, BertForSequenceClassification,
    TrainingArguments, Trainer
)
from datasets import Dataset
import numpy as np
from sklearn.metrics import accuracy_score, f1_score

MODEL_NAME = "bert-base-uncased"
NUM_LABELS = 3
LABEL_MAP = {'negative': 0, 'neutral': 1, 'positive': 2}

tokenizer = BertTokenizerFast.from_pretrained(MODEL_NAME)

def tokenize_fn(batch):
    return tokenizer(
        batch['text'],
        truncation=True,
        padding='max_length',
        max_length=128
    )

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    return {
        'accuracy': accuracy_score(labels, preds),
        'f1_macro': f1_score(labels, preds, average='macro'),
    }

training_args = TrainingArguments(
    output_dir='./bert_sentiment',
    num_train_epochs=4,
    per_device_train_batch_size=32,
    per_device_eval_batch_size=64,
    learning_rate=2e-5,
    weight_decay=0.01,
    evaluation_strategy='epoch',
    save_strategy='epoch',
    load_best_model_at_end=True,
    metric_for_best_model='f1_macro',
    warmup_ratio=0.1,
    fp16=True,
)
```

The hyperparameters selected for fine-tuning are summarised below:

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Base model | bert-base-uncased | Good balance of accuracy and inference speed |
| Max sequence length | 128 tokens | Covers >95% of tweets without truncation |
| Learning rate | 2e-5 | Standard BERT fine-tuning recommendation |
| Batch size | 32 (train) | Maximises GPU utilisation on Colab T4 |
| Epochs | 4 | Monitored validation loss for early stopping |
| Weight decay | 0.01 | L2 regularisation to reduce overfitting |
| Warmup ratio | 0.1 | Prevents large gradient updates in early steps |

*Table 5.3: Hyperparameters for BERT Fine-Tuning*

The fine-tuning was performed on a Google Colab instance with a T4 GPU, taking approximately 3.5 hours for the full training run.

---

## 5.7 Sentiment Classification Module

### 5.7.1 VADER Analysis

```python
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def analyse_vader(text: str) -> dict:
    scores = analyzer.polarity_scores(text)
    compound = scores['compound']
    
    if compound >= 0.05:
        label = 'positive'
    elif compound <= -0.05:
        label = 'negative'
    else:
        label = 'neutral'
    
    return {
        'compound': compound,
        'pos': scores['pos'],
        'neu': scores['neu'],
        'neg': scores['neg'],
        'label': label,
    }
```

VADER receives the lightly preprocessed text (URLs and mentions removed, but contractions and original word forms preserved) rather than the fully lemmatised token list, since VADER's rules are designed for natural English text and depend on capitalisation, punctuation, and word order for some of its heuristics.

### 5.7.2 BERT Inference

```python
from transformers import pipeline

sentiment_pipeline = pipeline(
    "text-classification",
    model="./bert_sentiment/best_model",
    tokenizer="./bert_sentiment/best_model",
    device=-1,  # CPU inference; set to 0 for GPU
    truncation=True,
    max_length=128,
)

LABEL_DECODE = {'LABEL_0': 'negative', 'LABEL_1': 'neutral', 'LABEL_2': 'positive'}

def analyse_bert(text: str) -> dict:
    result = sentiment_pipeline(text)[0]
    return {
        'label': LABEL_DECODE[result['label']],
        'confidence': round(result['score'], 4),
    }
```

### 5.7.3 Ensemble Decision Logic

The ensemble combines VADER and BERT outputs with a confidence-weighted voting scheme:

```python
def get_ensemble_label(vader_result: dict, bert_result: dict) -> tuple[str, float]:
    # If BERT confidence is high (>0.85), trust BERT
    if bert_result['confidence'] >= 0.85:
        return bert_result['label'], bert_result['confidence']
    
    # If both agree, return that label
    if vader_result['label'] == bert_result['label']:
        score = (abs(vader_result['compound']) + bert_result['confidence']) / 2
        return bert_result['label'], round(score, 4)
    
    # Disagreement: weight by BERT confidence vs VADER compound strength
    bert_weight = bert_result['confidence']
    vader_weight = min(abs(vader_result['compound']) * 1.5, 0.9)
    
    if bert_weight >= vader_weight:
        return bert_result['label'], bert_result['confidence']
    else:
        return vader_result['label'], abs(vader_result['compound'])
```

---

## 5.8 Trend Detection Module

```python
# app/services/trend_detection.py
from collections import Counter
from datetime import datetime, timedelta
import re

HASHTAG_RE = re.compile(r'#(\w+)', re.IGNORECASE)

def extract_hashtags(raw_text: str) -> list[str]:
    return [tag.lower() for tag in HASHTAG_RE.findall(raw_text)]

def compute_trends(posts: list[dict], window_days: int = 1) -> list[dict]:
    """
    Groups posts into daily buckets and computes hashtag/term frequency
    and growth rate across consecutive buckets.
    """
    buckets: dict[str, Counter] = {}
    
    for post in posts:
        date = post['posted_at'].date().isoformat()
        if date not in buckets:
            buckets[date] = Counter()
        
        hashtags = extract_hashtags(post['raw_text'])
        buckets[date].update(hashtags)
        
        # Also count significant non-stopword terms from clean_text
        if post.get('clean_text'):
            terms = post['clean_text'].split()
            buckets[date].update(terms)
    
    sorted_dates = sorted(buckets.keys())
    trend_records = []
    
    for i, date in enumerate(sorted_dates):
        current = buckets[date]
        previous = buckets[sorted_dates[i-1]] if i > 0 else Counter()
        
        for term, freq in current.most_common(50):
            prev_freq = previous.get(term, 0)
            growth = ((freq - prev_freq) / max(prev_freq, 1)) * 100
            
            trend_records.append({
                'term': term,
                'is_hashtag': True if term in extract_hashtags(
                    ' '.join(f'#{t}' for t in [term])
                ) else False,
                'date_bucket': date,
                'frequency': freq,
                'growth_rate': round(growth, 2),
            })
    
    return trend_records
```

---

## 5.9 Dashboard Implementation

The dashboard is the primary interface through which users consume the analytical output of the platform. It is implemented as a Next.js page that makes multiple parallel API calls on mount to retrieve summary statistics, sentiment distribution, time-series data, trending topics, and keywords.

The page layout uses a CSS grid with responsive breakpoints defined in Tailwind CSS. On large screens, the layout is a two-column grid with the sentiment chart occupying the left column and the trend panel on the right. Below these, the time-series chart spans the full width. On small screens, all panels stack vertically.

Real-time progress feedback and live sentiment tracking are provided using WebSocket connections to the backend via Socket.io. When a user creates a live-tracking project, the backend establishes a persistent connection, listening to streaming endpoints on X and Reddit APIs. As new posts match the user's query, they are processed through the NLP pipeline and streamed directly to the frontend, updating the charts and tables dynamically without requiring a page refresh.

Users can control their tracking experience through a **Configurable Options Panel** integrated into the dashboard. From this panel, they can:
- Toggle specific platforms (e.g., turn off Reddit to monitor only Twitter).
- Switch the active analysis model (e.g., use only VADER for ultra-low latency, or switch to the BERT Ensemble for highest accuracy).
- Set custom alert thresholds (e.g., triggering a UI notification when negative sentiment exceeds 30% over a 5-minute window).

If batch analysis is preferred, data is refetched automatically every 30 seconds when the user is viewing a project that has a collection in progress, using a polling mechanism implemented with the `useEffect` and `setInterval` React hooks.

---
