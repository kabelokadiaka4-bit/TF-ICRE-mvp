# ml-pipelines/components/feature_engineering.py
from kfp.v2.dsl import component, Input, Output, Dataset

@component(
    base_image="python:3.9",
    packages_to_install=["pandas", "scikit-learn"]
)
def feature_engineer_data(
    input_data: Input[Dataset],
    output_features: Output[Dataset]
):
    import pandas as pd
    from sklearn.preprocessing import StandardScaler

    # Load data
    df = pd.read_csv(input_data.path)
    
    # --- Example Feature Engineering Steps ---
    
    # 1. Handle missing values (simple imputation for demonstration)
    for col in ['amount', 'loanTerms']: # Example columns
        if col in df.columns:
            df[col] = df[col].fillna(df[col].mean())
            
    # 2. Create interaction features (example)
    if 'amount' in df.columns and 'loanTerms' in df.columns:
        df['amount_per_term'] = df['amount'] / (df['loanTerms'] + 1e-6) # Avoid division by zero
        
    # 3. One-hot encode categorical features (example)
    if 'sector' in df.columns:
        df = pd.get_dummies(df, columns=['sector'], prefix='sector')
        
    # 4. Scale numerical features (example)
    numerical_cols = df.select_dtypes(include=['number']).columns.tolist()
    if 'amount' in numerical_cols: # Ensure 'amount' is treated numerically
        scaler = StandardScaler()
        df[numerical_cols] = scaler.fit_transform(df[numerical_cols])
        
    # --- End of Example Feature Engineering Steps ---
    
    # Save processed features to the output path as CSV
    df.to_csv(output_features.path, index=False)
