from flask import Flask, render_template, request, jsonify
import pandas as pd
import difflib
import os

app = Flask(__name__)

# Load dataset
def load_data():
    file_path = os.path.join(os.path.dirname(__file__), 'D:\java eclipse\Hackathon\product_recommendation_data.csv')
    product_data = pd.read_csv(file_path)
    
    # Clean column names
    product_data.columns = product_data.columns.str.strip()
    product_data.columns = product_data.columns.str.replace(r'\s+', ' ', regex=True)
    
    # Handle column mismatch
    target_col = 'Category'
    if target_col not in product_data.columns:
        closest_match = difflib.get_close_matches(target_col, product_data.columns, n=1)
        if closest_match:
            target_col = closest_match[0]
    
    return product_data, target_col

product_data, category_col = load_data()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json
        product_name = data['product_name']
        
        # Find close matches
        find_close_match = difflib.get_close_matches(product_name, product_data['Product Name'].tolist())
        
        if not find_close_match:
            return jsonify({'error': 'Product not found'}), 404
            
        close_match = find_close_match[0]
        
        # Get category of the product
        category = product_data.loc[product_data['Product Name'] == close_match, category_col].values[0]
        
        # Get recommendations from same category
        recommendations = product_data[product_data[category_col] == category]['Product Name'].sample(5).tolist()
        
        return jsonify({
            'product': close_match,
            'category': category,
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)