# Expense Tracker Application

A full-stack web application designed to track personal expenses, categorize spending, and view total expenditure metrics in real time.

## Features
- **Create**: Add new expenses with title, amount, category, and date.
- **Read**: View all expenses in a dynamic table with dynamic status summaries (Total spent, total count, highest expense).
- **Update**: Edit existing expenses through an interactive modal.
- **Delete**: Remove expenses with immediate list update.
- **Filter**: Filter expenses by category (Food, Transport, Bills, Entertainment, Other).
- **Validation & Error Handling**: Input validation on both front-end and back-end with loading spinners and alert components.

## Tech Stack
- **Front-end**: HTML5, CSS3, JavaScript (ES6+, Async/Await, Fetch API), Bootstrap 5.
- **Back-end**: Node.js, Express.js, CORS, Dotenv.
- **Database**: PostgreSQL (pg pool driver).

## Setup Instructions

### 1. Database Setup
1. Open pgAdmin or PostgreSQL terminal.
2. Create a database named `expense_tracker`.
3. Run the SQL script from `backend/schema.sql` to initialize tables and seed initial data.

### 2. Back-end Configuration
1. Navigate to the `backend` directory:
   ```bash
   cd backend