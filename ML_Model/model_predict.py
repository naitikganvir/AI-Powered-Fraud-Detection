# model_predict.py

import joblib

# Load saved model
model = joblib.load('fraud_sms_model.pkl')

def predict_sms(text):
    prediction = model.predict([text])[0]
    label = 'Fraud' if prediction == 1 else 'Not Fraud'
    return label

# Example usage
if __name__ == "__main__":
    sms = input("Enter an SMS to classify: ")
    result = predict_sms(sms)
    print(f"Prediction: {result}")
