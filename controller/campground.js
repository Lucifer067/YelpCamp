const Campground = require('../models/campground');
const {cloudinary}= require('../cloudinary');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken= process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index= async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds });
};

module.exports.renderNewForm= (req, res) => {
    res.render('campground/new');
};

module.exports.createCampground= async (req, res) => {
    const geoData= await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    if(!req.body.campground) throw new ExpressError('Invalid Campground data!', 404);
    const newCamp = new Campground(req.body.campground);
    newCamp.images= req.files.map(f=> ({url: f.path, filename: f.filename}));
    newCamp.geometry= geoData.body.features[0].geometry;
    newCamp.author= req.user._id;
    await newCamp.save();
    req.flash('success', 'Sucessfully created a Campground');
    res.redirect(`/campgrounds/${newCamp._id}`);
};

module.exports.showCampground= async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path:'reviews', 
        populate:{
            path: 'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error', "Can't find that campground");
        return res.redirect('/campgrounds');
    }
    res.render('campground/detail', { campground });
};

module.exports.renderEditForm= async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', "Can't find that campground");
        return res.redirect('/campgrounds');
    }
    res.render('campground/edit', { campground });
};

module.exports.updateCampground= async (req, res) => {
    const campground= await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
    const imgs= req.files.map(f=> ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull:{images:{filename:{$in: req.body.deleteImages}}}});
        console.log(campground);
    }
    await campground.save();
    console.log(campground);
    req.flash('success', 'Sucessfully updated this Campground');
    res.redirect(`/campgrounds/${req.params.id}`);
};

module.exports.deleteCampground= async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Sucessfully deleted a Campground');
    res.redirect('/campgrounds');
};
