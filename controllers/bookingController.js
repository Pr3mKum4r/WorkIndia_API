const db = require("../db");
const AppError = require('../utils/appError');
const bcrypt = require('bcrypt')

const addDiningPlace = async (req, res, next) => {
    const { name, address, phone_no, website, operational_hours } = req.body;

    if (!name || !address || !phone_no || !website || !operational_hours || !operational_hours.open_time || !operational_hours.close_time) {
        return next(new AppError('Please provide all required fields', 400));
    }

    try {
        const newDiningPlace = await db.diningPlace.create({
            data: {
                name,
                address,
                phone_no,
                website,
                open_time: operational_hours.open_time,
                close_time: operational_hours.close_time,
                bookedSlots: []
                },
            },
        );

        res.status(200).json({
            message: `${name} added successfully`,
            place_id: newDiningPlace.id,
            status_code: 200,
        });
    } catch (error) {
        return next(new AppError('Something went wrong', 500));
    } 
};

const getDiningPlaces = async (req, res, next) => {
    const { name } = req.query;

    if (!name) {
        return next(new AppError('Please provide a search query', 400));
    }

    try {
        const diningPlaces = await prisma.diningPlace.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive' 
                }
            },
            include: {
                bookedSlots: {
                    select: {
                        time: true
                    }
                }
            }
        });

        const results = diningPlaces.map(place => ({
            place_id: place.id,
            name: place.name,
            address: place.address,
            phone_no: place.phone_no,
            website: place.website,
            operational_hours: {
                open_time: place.open_time,
                close_time: place.close_time
            },
            booked_slots: place.bookedSlots.map(slot => ({
                start_time: slot.time.toISOString(),
                end_time: slot.time.toISOString() 
            }))
        }));

        res.status(200).json({
            results
        });
    } catch (error) {
        return next(new AppError('Something went wrong', 500));
    }
};

const getAvailability = async (req, res, next) => {
    const { place_id, start_time, end_time } = req.query;

    if (!place_id || !start_time || !end_time) {
        return next(new AppError('Please provide place_id, start_time, and end_time', 400));
    }

    try {
        const diningPlace = await prisma.diningPlace.findUnique({
            where: { id: parseInt(place_id) },
            include: {
                bookedSlots: true
            }
        });

        if (!diningPlace) {
            return next(new AppError('Dining place not found', 404));
        }

        const startTime = new Date(start_time);
        const endTime = new Date(end_time);

        const bookings = diningPlace.bookedSlots.filter(slot => 
            (new Date(slot.time) < endTime && new Date(slot.time) > startTime)
        );

        if (bookings.length === 0) {
            res.status(200).json({
                place_id: diningPlace.id,
                name: diningPlace.name,
                phone_no: diningPlace.phone_no,
                available: true,
                next_available_slot: null
            });
        } else {
            const nextAvailableSlot = bookings.sort((a, b) => new Date(a.time) - new Date(b.time))[0].time;
            res.status(200).json({
                place_id: diningPlace.id,
                name: diningPlace.name,
                phone_no: diningPlace.phone_no,
                available: false,
                next_available_slot: new Date(nextAvailableSlot).toISOString()
            });
        }
    } catch (error) {
        return next(new AppError('Something went wrong', 500));
    }
};

const bookDiningPlace = async (req, res, next) => {
    const { place_id, start_time, end_time } = req.body;

    if (!place_id || !start_time || !end_time) {
        return next(new AppError('Please provide place_id, start_time, and end_time', 400));
    }

    try {
        const diningPlace = await prisma.diningPlace.findUnique({
            where: { id: parseInt(place_id) },
            include: {
                bookedSlots: true
            }
        });

        if (!diningPlace) {
            return next(new AppError('Dining place not found', 404));
        }

        const isSlotBooked = diningPlace.bookedSlots.some(slot => 
            (new Date(slot.time) < new Date(end_time) && new Date(slot.time) > new Date(start_time))
        );

        if (isSlotBooked) {
            return res.status(400).json({
                status: 'Slot is not available at this moment, please try some other place',
                status_code: 400
            });
        }

        const booking = await prisma.bookedSlot.create({
            data: {
                time: new Date(start_time), 
                diningPlaceId: parseInt(place_id),
                userId: req.user.id
            }
        });

        res.status(200).json({
            status: 'Slot booked successfully',
            status_code: 200,
            booking_id: booking.id
        });
    } catch (error) {
        return next(new AppError('Something went wrong', 500));
    }
};

module.exports = bookingController = {
    addDiningPlace,
    getDiningPlaces,
    getAvailability,
    bookDiningPlace
}