# model_train.py

import pandas as pd
import string
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

# Load the dataset
df = pd.read_csv("sms_texts.csv")

# Assume the CSV has 'text' and 'label' columns
df = df[['text', 'label']].dropna()

# Convert labels to binary (fraud = 1, not fraud = 0)
df['label'] = df['label'].apply(lambda x: 1 if str(x).lower() in ['fraud', 'spam', 'scam'] else 0)

# Split into train and test
X_train, X_test, y_train, y_test = train_test_split(df['text'], df['label'], test_size=0.2, random_state=42)

# Create a pipeline: TF-IDF + Naive Bayes
model = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english')),
    ('clf', MultinomialNB())
])

# Train the model
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

# Save the model
joblib.dump(model, 'fraud_sms_model.pkl')
print("Model saved to fraud_sms_model.pkl")
