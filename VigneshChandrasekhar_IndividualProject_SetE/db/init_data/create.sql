DROP TABLE IF EXISTS meal_reviews CASCADE;
CREATE TABLE IF NOT EXISTS meal_reviews (
    id SERIAL PRIMARY KEY, 
    meal_name VARCHAR(200) NOT NULL, 
    review VARCHAR(1000), 
    review_date VARCHAR(200) NOT NULL 
);