const express = require('express');
const multer= require('multer');
const Campground = require('../models/campground');
const catchAsync= require('../utils/catchAsync');
const ExpressError= require('../utils/ExpressError');
const {isLoggedIn, validateCampground, isAuthor}= require('../middleware');
const campgrounds= require('../controller/campground');
const {storage}= require('../cloudinary');

const upload= multer({storage});
const router= express.Router();

//To display all the camprounds on Database and Creating a new campground
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'),validateCampground, catchAsync(campgrounds.createCampground));

//To render form to add a new Campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

//To show details of a campground, To update details of a campground and To delete a campground
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .patch(isLoggedIn, isAuthor, upload.array('image'), validateCampground ,catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//To render form for editing a campground
router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports= router;