# Dining Place Booking System

A REST API for managing dining place bookings. This API allows users to add dining places, search for dining places by name, check availability, and make bookings. It includes endpoints for administrators and users with token-based authentication.

## Features

- **Add a Dining Place**: Admins can add new dining places.
- **Search Dining Places**: Users can search for dining places by name.
- **Check Availability**: Users can check if a dining place is available for booking.
- **Make a Booking**: Users can book a time slot at a dining place.

## Getting Started

### Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/pr3mkum4r/WorkIndia_API.git
    cd dining-place-booking
    ```

2. **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Set up environment variables**:
    Create a `.env` file in the root directory with the following content:
    ```env
    DATABASE_URL="mysql://username:password@localhost:3306/database_name"
    JWT_SECRET="your_jwt_secret"
    ```

4. **Run database migrations**:
    ```bash
    npx prisma migrate dev
    ```

5. **Generate Prisma client**:
    ```bash
    npx prisma generate
    ```

6. **Start the server**:
    ```bash
    npm start
    # or
    yarn start
    ```

## API Endpoints

### 1. Add a Dining Place

- **Endpoint**: `POST /api/dining-place/create`
- **Request**:
    ```json
    {
        "name": "Gatsby",
        "address": "HSR Layout",
        "phone_no": "9999999999",
        "website": "http://workindia.in/",
        "operational_hours": {
            "open_time": "08:00:00",
            "close_time": "23:00:00"
        },
        "booked_slots": []
    }
    ```

### 2. Search Dining Places by Name

- **Endpoint**: `GET /api/dining-place`
- **Query Parameters**:
    - `name` (string): The search query for the dining place name.

### 3. Check Availability

- **Endpoint**: `GET /api/dining-place/availability`
- **Query Parameters**:
    - `place_id` (string): The ID of the dining place.
    - `start_time` (string): The start time of the desired slot.
    - `end_time` (string): The end time of the desired slot.

### 4. Make a Booking

- **Endpoint**: `POST /api/dining-place/book`
- **Headers**:
    - `Authorization: Bearer {token}`
- **Request**:
    ```json
    {
        "place_id": "12345",
        "start_time": "2023-01-02T12:00:00Z",
        "end_time": "2023-01-02T13:00:00Z"
    }
    ```
