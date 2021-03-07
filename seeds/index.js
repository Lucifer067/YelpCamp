const mongoose= require('mongoose');
const Campground= require('../models/campground');
const { descriptors, places} = require('./seedHelper');
const cities= require('./cities');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useCreateIndex:true, 
    useNewUrlParser:true,
    useUnifiedTopology: true
});

const db= mongoose.connection;
db.on("error", console.error.bind(console, "connection error!!!"));
db.once('open', ()=>{
    console.log("Database Connected");
});

const sample= array=> array[Math.floor(Math.random()* array.length)];

const seedDB= async () =>{
    await Campground.deleteMany();
    for(let i=0; i<250; i++)
    {
        const random1000= Math.floor(Math.random()*1000);
        const price= Math.floor(Math.random()*20 )+10;
        const camp=  new Campground({
            author: '603f215e7a46e628b41a39f7',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet tempora saepe dolorem sint officiis beatae ab optio nihil quas accusamus? Magni corrupti earum quibusdam, reiciendis doloremque vitae quasi obcaecati saepe!',
            price, 
            geometry:{
                type: 'Point', 
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/lucifer067/image/upload/v1614921261/YelpCamp/fsria9qsilmqczrmwgth.jpg',
                    filename: 'YelpCamp/fsria9qsilmqczrmwgth'
                  },
                  {
                    url: 'https://res.cloudinary.com/lucifer067/image/upload/v1614921263/YelpCamp/rqnro0pntbs9hrlmjnx2.jpg',
                    filename: 'YelpCamp/rqnro0pntbs9hrlmjnx2'
                  }
            ]
        });
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})