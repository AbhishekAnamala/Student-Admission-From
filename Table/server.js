const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3002;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

// MongoDB Connection
mongoose
    .connect('mongodb://localhost:27017/info', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Mongoose Schema
const formSchema = new mongoose.Schema({
    name: String,
    dob: String,
    gender: String,
    aadhaar: String,
    phone: String,
    email: String,
    motherName: String,
    fatherName: String,
    occupation: String,
    income: Number,
    presentAddress: {
        house: String,
        street: String,
        city: String,
        mandal: String,
        district: String,
        state: String,
        pin: String,
    },
    permanentAddress: {
        house: String,
        street: String,
        city: String,
        mandal: String,
        district: String,
        state: String,
        pin: String,
    },
    designation: String,
    office: String,
    nationality: String,
    religion: String,
    caste: String,
    subcaste: String,
    examDetails: {
        examname: String,
        collegename: String,
        universityname: String,
        yearmonthpassing: String,
        registrationnumber: String,
        classgrade: String,
    },
    photo: {
        data: Buffer,
        contentType: String,
    },
});

const FormData = mongoose.model('FormData', formSchema, 'formdatas');

// Multer Configuration for File Upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Submit Form Data
app.post('/submit', upload.single('photo'), async (req, res) => {
    try {
        const {
            name,
            dob,
            gender,
            aadhaar,
            phone,
            email,
            motherName,
            fatherName,
            occupation,
            income,
            designation,
            office,
            nationality,
            religion,
            caste,
            subcaste,
            examname,
            collegename,
            universityname,
            yearmonthpassing,
            registrationnumber,
            classgrade,
        } = req.body;

        const formData = new FormData({
            name,
            dob,
            gender,
            aadhaar,
            phone,
            email,
            motherName,
            fatherName,
            occupation,
            income: Number(income),
            presentAddress: {
                house: req.body['presentAddress.house'],
                street: req.body['presentAddress.street'],
                city: req.body['presentAddress.city'],
                mandal: req.body['presentAddress.mandal'],
                district: req.body['presentAddress.district'],
                state: req.body['presentAddress.state'],
                pin: req.body['presentAddress.pin'],
            },
            permanentAddress: {
                house: req.body['permanentAddress.house'],
                street: req.body['permanentAddress.street'],
                city: req.body['permanentAddress.city'],
                mandal: req.body['permanentAddress.mandal'],
                district: req.body['permanentAddress.district'],
                state: req.body['permanentAddress.state'],
                pin: req.body['permanentAddress.pin'],
            },
            designation,
            office,
            nationality,
            religion,
            caste,
            subcaste,
            examDetails: {
                examname,
                collegename,
                universityname,
                yearmonthpassing,
                registrationnumber,
                classgrade,
            },
            photo: req.file
                ? { data: req.file.buffer, contentType: req.file.mimetype }
                : null,
        });

        await formData.save();
        res.status(200).send('Form data and photo uploaded successfully!');
    } catch (error) {
        console.error('Error saving form data:', error);
        res.status(500).send('Error saving form data.');
    }
});

// API to fetch forms data
app.get('/api/forms', async (req, res) => {
    try {
        const forms = await FormData.find();
        const result = forms.map((form) => ({
            ...form.toObject(),
            photo: form.photo ? form.photo.data.toString('base64') : null,
        }));
        res.json(result);
    } catch (error) {
        res.status(500).send('Error fetching forms: ' + error.message);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});