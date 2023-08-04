const mongoose = require("mongoose");
mongoose.set('strictQuery', true)
const connectDb = () => {
    // Set up default mongoose connection
    const mongoDB = `mongodb+srv://harmandeepexpinator:3hYqbmRuygKVA6u5@cluster0.ni1izx6.mongodb.net/?retryWrites=true&w=majority`;
    mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).then(_ => console.log("Database Connected!")).catch(err => console.log(err));
}

module.exports = connectDb;