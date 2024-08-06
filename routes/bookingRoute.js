const {Router} = require('express');
const bookingController = require('../controllers/bookingController.js');
const authController = require('../controllers/authController.js');

const router = Router();

router.post('/create', bookingController.addDiningPlace);
router.get('/availability', bookingController.getAvailability);

router.use(authController.protect);
router.post('/book', bookingController.bookDiningPlace);
router.get('/', bookingController.getDiningPlaces);

module.exports = router;