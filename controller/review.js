const Campground = require('../models/campground');
const Review= require('../models/review');

module.exports.createReview= async (req, res)=>{
    const {id}= req.params;
    const campground= await Campground.findById(id);
    const review= new Review(req.body.review);
    review.author= req.user._id;
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    req.flash('success', 'Sucessfully created a review');
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteReview= async (req, res)=>{
    const{id, review_id}= req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: review_id}});
    await Review.findByIdAndDelete(review_id);
    req.flash('success', 'Sucessfully deleted a review');
    res.redirect(`/campgrounds/${id}`);
};