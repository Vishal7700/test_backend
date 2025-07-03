const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// GET vehicle types by wheels
app.get('/vehicle-types', async (req, res) => {
  const wheels = parseInt(req.query.wheels);
  const types = await prisma.vehicleType.findMany({ where: { wheels } });
  res.json(types);
});

// GET vehicles by typeId
app.get('/vehicles', async (req, res) => {
  const typeId = parseInt(req.query.typeId);
  const vehicles = await prisma.vehicle.findMany({ where: { vehicleTypeId: typeId } });
  res.json(vehicles);
});

// POST new booking
app.post('/bookings', async (req, res) => {
  try {
    const { firstName, lastName, vehicleId, startDate, endDate } = req.body;

    console.log('Received booking:', req.body); // ✅ Debug input

    if (!firstName || !lastName || !vehicleId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const conflict = await prisma.booking.findFirst({
      where: {
        vehicleId,
        OR: [
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) },
          },
        ],
      },
    });

    if (conflict) {
      return res.status(409).json({ error: 'Vehicle already booked in this date range' });
    }

    const booking = await prisma.booking.create({
      data: {
        firstName,
        lastName,
        vehicleId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    res.json(booking);
  } catch (err) {
    console.error('❌ Booking failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all bookings
app.get('/bookings', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        vehicle: {
          include: {
            vehicleType: true, 
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    res.json(bookings);
  } catch (error) {
    console.error('❌ Failed to fetch bookings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(4000, () => console.log('Backend running at http://localhost:4000'));
