// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// Initialize the app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/info', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB')).catch(err => console.error('Could not connect to MongoDB:', err));

// Define the schema for the form data
const formDataSchema = new mongoose.Schema({
    name: String,
    dob: String,
    gender: String,
    aadhaar: String,
    phone: String,
    email: String,
    photo: {
        data: Buffer, // Binary data for the photo
        contentType: String // MIME type of the photo
    },
    motherName: String,
    fatherName: String,
    occupation: String,
    income: String,
    presentAddress: Object,
    permanentAddress: Object,
    designation: String,
    nationality: String,
    religion: String,
    caste: String,
    subcaste: String,
    examDetails: Object
});

const FormData = mongoose.model('FormData', formDataSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (e.g., CSS, JS) from the current directory
app.use(express.static(path.join(__dirname)));

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to handle form submission
app.post('/submit', upload.single('photo'), async (req, res) => {
    try {
        const {
            name, dob, gender, aadhaar, phone, email,
            motherName, fatherName, occupation, income,
            designation, nationality, religion, caste, subcaste,
            presentAddress, permanentAddress, examname, collegename,
            placeperiod, privateappearance, universityname,
            yearmonthpassing, registrationnumber, classgrade
        } = req.body;

        // Prepare the photo object
        const photo = req.file
            ? {
                data: req.file.buffer, // Store binary data
                contentType: req.file.mimetype // Store MIME type
            }
            : null;

        // Prepare data for MongoDB
        const formData = new FormData({
            name,
            dob,
            gender,
            aadhaar,
            phone,
            email,
            photo,
            motherName,
            fatherName,
            occupation,
            income,
            presentAddress: {
                house: req.body['presentAddress.house'],
                street: req.body['presentAddress.street'],
                city: req.body['presentAddress.city'],
                mandal: req.body['presentAddress.mandal'],
                district: req.body['presentAddress.district'],
                state: req.body['presentAddress.state'],
                pin: req.body['presentAddress.pin']
            },
            permanentAddress: {
                house: req.body['permanentAddress.house'],
                street: req.body['permanentAddress.street'],
                city: req.body['permanentAddress.city'],
                mandal: req.body['permanentAddress.mandal'],
                district: req.body['permanentAddress.district'],
                state: req.body['permanentAddress.state'],
                pin: req.body['permanentAddress.pin']
            },
            designation,
            nationality,
            religion,
            caste,
            subcaste,
            examDetails: {
                examname,
                collegename,
                placeperiod,
                privateappearance,
                universityname,
                yearmonthpassing,
                registrationnumber,
                classgrade
            }
        });

        // Save to database
        await formData.save();
        res.status(200).send('Form data submitted successfully');
    } catch (error) {
        console.error('Error submitting form data:', error);
        res.status(500).send('Error submitting form data');
    }
});

// Start the server
const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});