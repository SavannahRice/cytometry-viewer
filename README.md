# Cytometry Viewer

This project is a fullstack application built with Django as the backend and React as the frontend.

## Project Structure

```
cytometry-viewer
├── backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── program
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── app
│       ├── __init__.py
│       ├── models.py
│       ├── views.py
│       ├── urls.py
│       └── admin.py
├── frontend
│   ├── package.json
│   ├── public
│   │   └── index.html
│   └── src
│       ├── App.js
│       ├── index.js
│       └── components
│           └── ExampleComponent.js
└── README.md
```

## Backend Setup

1. Navigate to the `backend` directory:
   ```
   cd backend
   ```

   then create a venv
   ```
   python -m venv .venv
   ```
   and activate
   ```
   source .venv/bin/activate
   ```

2. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

3. Migrate the database:
   ```
   python manage.py migrate
   ```

3. Run the Django server:
   ```
   python manage.py runserver
   ```

## Frontend Setup

1. Navigate to the `frontend` directory:
   ```
   cd frontend
   ```

2. Install the required npm packages:
   ```
   npm install
   ```

3. Start the React application:
   ```
   npm start
   ```

## Usage

- The backend API will be available at `http://localhost:8000/`.
- The React frontend will be available at `http://localhost:3000/`.

## Docker Development
Follow these steps to build and run the application using Docker Compose for the first time.

### Prerequisites
Ensure you have the following installed on your machine:

- Docker⁠
- Docker Compose⁠

### Build and Run the Application

1. Clone the repository to your local machine:
```
git clone https://github.com/yourusername/react_django_starter.git
cd react_django_starter
```
2. Create a .env File

      Create a .env file in the root directory of the project and add the necessary environment variables:
   ```
   DJANGO_SECRET_KEY=your_secret_key
   DEBUG=True
   DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
   DATABASE_ENGINE=postgresql
   DATABASE_NAME=cytometry-db
   DATABASE_USERNAME=dbuser
   DATABASE_PASSWORD=dbpassword
   DATABASE_HOST=db
   DATABASE_PORT=5432
   ```

3. Build and Start the Containers

   Use Docker Compose to build and start the containers. This command will download the necessary images, build the application, and start the services defined in the docker-compose.yml file:

   ```
   docker compose up --build
   ```
   This process may take a few minutes the first time as Docker downloads dependencies and builds the images.

4. Run Database Migrations

   The migration should run automatically. In case it doesn't, once the containers are up and running, 
   open a new terminal window and navigate to the project directory. Run the following command to apply database migrations:
   ```
   docker compose run django-web python manage.py migrate
   ```
   This command runs the Django migration inside the django-web service container.

5. Access the Application

   Django Backend: Open your browser and go to http://localhost:8000 to access the Django backend.
   React Frontend: Open your browser and go to http://localhost:3000 to access the React frontend.

6. Stopping the Application

   To stop the application, press Ctrl+C in the terminal where the docker compose up command is running. Alternatively, you can run:
   ```
   docker compose down
   ```
   This command stops and removes the containers, networks, and volumes created by docker compose up.

## Generate Data

This project does not seed data in the db to begin with. In order to load data, go to the "Import" page in the app and load the cell-count.csv file.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.