Overview
----
My project is a web-based fitness application that generates personalized workout programs based on user input. Users take a quiz detailing their fitness goals, experience level, and preferences. The responses are processed using OpenAI’s API to create a customized workout plan. Additionally, users can log and track their workout progress, storing their data in a database.

Problem Statement
----
Many people struggle to create an effective workout routine tailored to their fitness level and goals. Generic workout plans do not account for individual preferences or experience. Additionally, tracking progress can be tedious without a structured system. This project aims to solve these issues by providing an AI-generated workout plan and a built-in progress tracking feature.

User Cases
----
1. User Registration & Authentication
Users can sign up using their name, email, and password.
Returning users can log in to access their personalized workout plans.
The system verifies credentials and grants access securely.

3. Taking a Quiz for a Personalized Workout Plan
Users answer questions regarding their fitness level, goals, preferred workout style, and availability.
The quiz responses are sent to OpenAI’s API to generate a tailored workout split.

4. AI-Generated Workout Plan
The system sends quiz responses to OpenAI’s API.
AI generates a structured workout program (split, exercises, sets, reps).
The system saves the generated plan in the database and displays it on the user’s dashboard.

5. Viewing & Following the Workout Plan
Users can view their AI-generated workout plan in their dashboard.
Exercises, sets, reps, and instructions are displayed.
Users follow the workout plan during training sessions.

6. Logging Workout Progress
Users log their daily workouts by entering weights, reps, and personal notes.
The system saves the data in a MySQL database for future tracking.
Users can view their past workouts in a progress tracker.
Technology Stack

Frontend:
HTML, CSS, JavaScript

Backend:
Node.js with Express.js 
OpenAI API 

Database:
MySQL 


Project Timeline:
-------
Week 1-2: Project Setup & Authentication
Set up the development environment
Install dependencies (Node.js, Express.js, MySQL, OpenAI API)
Configure the database
Build user authentication (register, login, session handling)
Ensure secure authentication flow

Week 3-4: Quiz & AI Integration
Develop quiz UI for user input
Create an API to send quiz responses to OpenAI API
Process AI-generated workout plans and store them in the database

Week 5-6: Dashboard & Workout Tracking
Display AI-generated workout plan on the user dashboard
Implement workout logging system for users to track progress

Week 7-8: Testing & Optimizationw
Perform full application testing and debugging
Optimize database queries and API performance

Week 9-10 Deploy & Final Adjustments 
Deploy Application 
Final Testing and fixes

Each phase of the project is given two weeks to allow time for:

Development & Testing: Ensuring each feature works correctly before moving forward.
Bug Fixing & Adjustments: Unexpected issues can arise, and extra time helps resolve them without rushing.
Learning & Refinement: Since new technologies (Node.js, OpenAI API, MySQL) are involved, time is allocated for debugging and improving implementation.
Iteration Based on Feedback: If necessary, minor tweaks can be made before moving to the next phase.
