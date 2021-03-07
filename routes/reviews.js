const express = require('express');

const Campground = require('../models/campground');
const Review= require('../models/review');

const {reviewSchema}= require('../schemas');

const catchAsync= require('../utils/catchAsync');
const ExpressError= require('../utils/ExpressError');

const {validateReview, isLoggedIn, isReviewAuthor}= require('../middleware');
const reviews= require('../controller/review')

const router= express.Router({mergeParams: true});


//Creating a new review
router.post('/',isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:review_id',isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports= router;