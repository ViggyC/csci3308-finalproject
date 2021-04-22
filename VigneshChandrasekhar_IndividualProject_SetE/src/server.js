
//AUTHOR: Vignesh Chandrasekhar
const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('express-flash');
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json()); // support json encoded bodies
const axios = require('axios');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.urlencoded({extended: false})); // support encoded bodies** check back here
app.use(express.static(__dirname + '/'));
// set the view engine to ejs




//Create Database Connection
var pgp = require('pg-promise')();


const dev_dbConfig = {
	host: 'db',
	port: 5432,
	database: 'reviews_db',
	user: 'postgres',
	password: 'pwd'
};

const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = isProduction ? process.env.DATABASE_URL : dev_dbConfig;

// fixes: https://github.com/vitaly-t/pg-promise/issues/711
if (isProduction) {
	pgp.pg.defaults.ssl = {rejectUnauthorized: false};
}

var db = pgp(dbConfig);


/////////API///////////////
app.get('/', (req, res)=> {

    res.render('pages/main',{
      page_title: "Home",
      items: '',
      mealName: '',
      mealInstructions: '',
      mealTags: '',
      mealImage: '',
      source: '',
      youtube: '',
      error: false,
      message: ''
    })
  
});

//USING ARCHITECUTRE OPTION 2
app.post('/', (req, res)=> {
    var search = req.body.meal;
    console.log("search: " + search);

    if(search){
      axios({
        url: `https://www.themealdb.com/api/json/v1/1/search.php?s=${search}`,
        method: 'GET',
        dataType: 'json',
      })
      .then(items=>{
        console.log(items.data.meals[0]);
        res.render('pages/main',{
          page_title: 'Home',
          items: items,
          mealName: items.data.meals[0].strMeal,
          mealInstructions: items.data.meals[0].strInstructions,
          mealTags: items.data.meals[0].strTags,
          mealImage: items.data.meals[0].strMealThumb,
          source:  items.data.meals[0].strSource,
          youtube: items.data.meals[0].strYoutube,
          error: false,
          messahe: ''

        });
      })
      .catch(error=>{
        console.log("Error: " + error);
        res.render('/pages.main',{
          page_title: "Home",
          items: '',
          mealName: '',
          mealInstructions: '',
          mealTags: '',
          mealImage: '',
          source: '',
          youtube: '',
          error: true,
          message: 'error'

        })
      })
    }else{
      res.render('/pages.main',{
        page_title: "Home",
        items: '',
        mealName: '',
        mealInstructions: '',
        mealTags: '',
        mealImage: '',
        source: '',
        youtube: '',
        error: true,
        message: 'error'

      })

    }

});

//BEGINNING OF GET AND POST REQUESTS FOR THE REVIEWS PAGE, including the filter options
app.get('/reviews', (req, res)=> {
  //getting all reviews from the database
  var query = 'SELECT * from meal_reviews ORDER BY review_date;';
	db.task('get-everything', task => {
	  return task.batch([
		  task.any(query),
	  ])
	})
	.then(info => {
	  res.render('pages/reviews',{
        page_title: "Meal Reviews",
        data: info[0], 
        mealName: info[0].meal_name,
        review: info[0].review,
        reviewDate: info[0].review_date,

	  })
	})
	.catch(err => {
	  console.log('error', err);
	  res.render('pages/reviews', {
		    page_title: "Meal Reviews",
        data: '', 
        mealName: '',
        review: '',
        reviewDate: '',

	  })
	})
       
  
});

//This post request is called when the user submits their review in the main home page
//all this post request does is insert the review in the DB
//The get request above will retrieve the review details 
app.post('/reviews', (req, res)=> {
  var mealName = req.body.mealName;
  var review = req.body.review;
  var date = new Date();
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0'); 
  var yyyy = date.getFullYear();
  
  date = mm + '/' + dd + '/' + yyyy;

  console.log(mealName);
  console.log(review);
  console.log(date);

  //insert into DB
  

  var insert_statement = 'INSERT INTO meal_reviews(meal_name, review, review_date) VALUES (\'' + mealName + '\', \'' + review + '\', \'' + date + '\');';
  console.log(insert_statement);
	db.task('get-everything', task => {
		return task.batch([
			task.any(insert_statement)
		]);
	})
	.then(info => {

	res.redirect('/reviews'); //redirecting to reviews page after review is submitted
	})
	.catch(err => {
	  console.log('error', err);
	  res.render('pages/reviews', {
		page_title: "Reviews",
		//data: '',
		mealName: '', 
		review: '',
		date: ''
	  })
	});


//redirect to reviews
  
});


app.get('/filter', (req, res)=>{
  console.log("in the filter meal route");
  var mealName = req.query.mealName;

  if(!mealName){
    console.log("Field empty");
     res.redirect('/reviews');
     res.end();
  }
  
  //console.log("meal name: " + mealName); //says undefined
  var query = 'SELECT * from meal_reviews WHERE meal_name=\'' + mealName + '\';'; //filtering by name
  
  db.task('get-everything', task => {
	  return task.batch([
		  task.any(query),
	  ])
	})
	.then(info => {
     
    console.log("query name: " + info[0].meal_name);
    console.log("Input name: " + mealName);


    // if(info[0].meal_name!=mealName){
    //   console.log("No match");
    //  res.redirect('/reviews');
    //  res.destroy();

    // }

    
	  res.render('pages/reviews',{
        page_title: "Filtered Reviews",
        data: info[0], 
        mealName: info[0].meal_name,
        review: info[0].review,
        reviewDate: info[0].review_date,

	  })
  //}
	})
	.catch(err => {
	  console.log('error', err);
	  res.redirect('/reviews');
	});

})




const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});