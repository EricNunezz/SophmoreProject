-- This script contains SQL commands to set up the necessary tables in Supabase
-- Run these in the Supabase SQL Editor

-- Create quiz_data table
CREATE TABLE IF NOT EXISTS quiz_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  fitness_level TEXT NOT NULL,
  fitness_goals TEXT NOT NULL,
  days_per_week TEXT NOT NULL,
  session_length TEXT NOT NULL,
  equipment TEXT NOT NULL,
  limitations TEXT,
  workout_preference TEXT NOT NULL,
  height TEXT NOT NULL,
  weight TEXT NOT NULL,
  age TEXT NOT NULL,
  gender TEXT
);

-- Create workout_programs table
CREATE TABLE IF NOT EXISTS workout_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  quiz_id UUID REFERENCES quiz_data(id) NOT NULL,
  program_content TEXT NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE quiz_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_data table
CREATE POLICY "Users can view their own quiz data" 
  ON quiz_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz data" 
  ON quiz_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for workout_programs table
CREATE POLICY "Users can view their own workout programs" 
  ON workout_programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout programs" 
  ON workout_programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS quiz_data_user_id_idx ON quiz_data(user_id);
CREATE INDEX IF NOT EXISTS workout_programs_user_id_idx ON workout_programs(user_id);
CREATE INDEX IF NOT EXISTS workout_programs_quiz_id_idx ON workout_programs(quiz_id);

CREATE TABLE IF NOT EXISTS fitness_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  quiz_data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_program (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  fitness_profile_id UUID REFERENCES fitness_profile(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  program_id UUID REFERENCES workout_program(id) NOT NULL,
  name TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  exercises JSONB NOT NULL
);

ALTER TABLE fitness_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fitness profile" 
  ON fitness_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert or update their own fitness profile" 
  ON fitness_profile FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own workout program" 
  ON workout_program FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert or update their own workout program" 
  ON workout_program FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own workout splits" 
  ON workout_splits FOR SELECT
  USING (exists (
    SELECT 1 FROM workout_program wp 
    WHERE wp.id = workout_splits.program_id 
    AND wp.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert or update their own workout splits" 
  ON workout_splits FOR ALL
  USING (exists (
    SELECT 1 FROM workout_program wp 
    WHERE wp.id = workout_splits.program_id 
    AND wp.user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS workout_programs_user_id_idx ON workout_programs(user_id);
CREATE INDEX IF NOT EXISTS workout_programs_quiz_id_idx ON workout_programs(quiz_id); 