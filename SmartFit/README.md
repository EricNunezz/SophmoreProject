Overview
----
My project is a web-based fitness application called SmartFit that generates personalized workout programs based on user input. Users take a quiz detailing their fitness goals, experience level, and preferences. The responses are processed using OpenAI’s API to create a customized workout plan. Additionally, users can log and track their workout progress, storing their data in a database.

Problem Statement
----
Many people struggle to create an effective workout routine tailored to their fitness level and goals. Generic workout plans do not account for individual preferences or experience. Additionally, tracking progress can be tedious without a structured system. This project aims to solve these issues by providing an AI-generated workout plan and a built-in progress tracking feature.

User Cases
----
1. User Registration & Authentication
Users can sign up using their email, and password(for now).
Returning users can log in to access their personalized workout plans.
The system verifies credentials and grants access securely.

2. Taking a Quiz for a Personalized Workout Plan
Users answer questions regarding their fitness level, goals, preferred workout style, availability, etc...
The quiz responses are sent to Geminis API to generate a tailored workout program.

3. AI-Generated Workout Plan
The system sends quiz responses to Geminis API.
AI generates a structured workout program (split, exercises, sets, reps, etc...).
The system saves the generated plan in the database and displays it on the user’s dashboard.

4. Viewing & Following the Workout Plan
Users can view their AI-generated workout plan in their dashboard.
Exercises, sets, reps, and instructions are displayed.
Users follow the workout plan during training sessions.

5. Logging Workout Progress
Users log their daily workouts by entering weights, reps, and personal notes.
The system saves the data in a MySQL database for future tracking.
Users can view their past workouts in a progress tracker.
Technology Stack

Frontend:
React and Typescript

Backend:
Supabase

Database:
Supabase database with PostgresSQL 

Project Timeline:
-------
Week 5-6: Project Setup 
Set up the development environment
Install dependencies 
Setup the database


Week 7-8: Authentification & Quiz UI
Build user authentication (register, login, session handling)
Ensure secure authentication flow
Develop quiz UI for user input


Week 9-12: Gemini API
Setup Gemini API & Test
Create an API to send quiz responses to Gemini API
Process AI-generated workout plans and store them in the database


Week 13-15: Dashboard & Testing
Display AI-generated workout plan on the user dashboard
Implement workout logging system for users to track progress
Ensure all user cases work and test program



Each phase of the project is given two weeks to allow time for:

Development & Testing: Ensuring each feature works correctly before moving forward.
Bug Fixing & Adjustments: Unexpected issues can arise, and extra time helps resolve them without rushing.
Learning & Refinement: Since new technologies (Node.js, OpenAI API, MySQL) are involved, time is allocated for debugging and improving implementation.
Iteration Based on Feedback: If necessary, minor tweaks can be made before moving to the next phase.
