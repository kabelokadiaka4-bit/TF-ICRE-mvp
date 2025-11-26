# ml-pipelines/components/model_training.py
from kfp.v2.dsl import component, Input, Output, Dataset, Model, Metrics

@component(
    base_image="python:3.9",
    packages_to_install=["pandas", "scikit-learn", "xgboost", "joblib"]
)
def train_xgboost_model(
    input_data: Input[Dataset],
    model_output: Output[Model],
    metrics: Output[Metrics]
):
    import pandas as pd
    import xgboost as xgb
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import roc_auc_score, accuracy_score
    import joblib
    import os

    # Load data
    df = pd.read_csv(input_data.path)
    
    # Preprocessing (Simplified for template)
    # Assuming 'status' is target (1 for default, 0 for paid)
    # And dropping identifiers
    target = 'status'
    features = [col for col in df.columns if col not in [target, 'loan_id', 'customer_id', 'ingestion_date']]
    
    # Basic encoding for categorical features if any
    df_processed = pd.get_dummies(df[features])
    y = df[target].apply(lambda x: 1 if x == 'DEFAULT' else 0) # Mapping target
    
    X_train, X_test, y_train, y_test = train_test_split(df_processed, y, test_size=0.2, random_state=42)

    # Train
    clf = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss')
    clf.fit(X_train, y_train)

    # Evaluate
    y_pred = clf.predict(X_test)
    y_probs = clf.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_probs)

    # Log metrics
    metrics.log_metric("accuracy", acc)
    metrics.log_metric("auc", auc)

    # Save model
    # Ensure directory exists
    os.makedirs(model_output.path, exist_ok=True)
    model_path = os.path.join(model_output.path, "model.joblib")
    joblib.dump(clf, model_path)
