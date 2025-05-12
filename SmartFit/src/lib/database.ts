import { supabase } from "./supabaseClient";

export interface FitnessProfile {
  id?: string;
  user_id: string;
  quiz_data: {
    fitnessLevel: string;
    fitnessGoals: string;
    workoutSchedule: {
      daysPerWeek: string;
      sessionLength: string;
    };
    equipment: string;
    limitations: string;
    workoutPreference: string;
    bodyStats: {
      height: string;
      weight: string;
      age: string;
      gender: string;
    };
  };
  created_at?: string;
}

export interface WorkoutProgram {
  id?: string;
  created_at?: string;
  user_id: string;
  fitness_profile_id: string;
  title: string;
  description: string;
}

export interface WorkoutSplit {
  id?: string;
  created_at?: string;
  program_id: string;
  name: string;
  day_number: number;
  exercises: any[];
  notes?: string;
}

export async function saveFitnessProfile(fitnessProfile: Omit<FitnessProfile, 'id' | 'created_at'>) {
  try {
    const { data: existingProfiles, error: fetchError } = await supabase
      .from('fitness_profile')
      .select('id')
      .eq('user_id', fitnessProfile.user_id)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existingProfiles) {
      const { data, error } = await supabase
        .from('fitness_profile')
        .update({ quiz_data: fitnessProfile.quiz_data })
        .eq('id', existingProfiles.id)
        .select();

      if (error) {
        throw error;
      }

      return data?.[0];
    } else {
      const { data, error } = await supabase
        .from('fitness_profile')
        .insert(fitnessProfile)
        .select();

      if (error) {
        throw error;
      }

      return data?.[0];
    }
  } catch (error) {
    console.error("Error saving fitness profile:", error);
    throw error;
  }
}

export async function saveWorkoutProgram(program: Omit<WorkoutProgram, 'id' | 'created_at'>) {
  try {
    const { data: existingProgram, error: fetchError } = await supabase
      .from('workout_program')
      .select('id')
      .eq('user_id', program.user_id)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existingProgram) {
      const { data, error } = await supabase
        .from('workout_program')
        .update({
          title: program.title,
          description: program.description,
          fitness_profile_id: program.fitness_profile_id
        })
        .eq('id', existingProgram.id)
        .select();

      if (error) {
        throw error;
      }

      return data?.[0];
    } else {
      const { data, error } = await supabase
        .from('workout_program')
        .insert(program)
        .select();

      if (error) {
        throw error;
      }

      return data?.[0];
    }
  } catch (error) {
    console.error("Error saving workout program:", error);
    throw error;
  }
}

export async function saveWorkoutSplit(split: Omit<WorkoutSplit, 'id' | 'created_at'>) {
  try {
    const { data: existingSplit, error: fetchError } = await supabase
      .from('workout_splits')
      .select('id')
      .eq('program_id', split.program_id)
      .eq('day_number', split.day_number)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existingSplit) {
      const { data, error } = await supabase
        .from('workout_splits')
        .update({
          name: split.name,
          exercises: split.exercises,
          notes: split.notes
        })
        .eq('id', existingSplit.id)
        .select();

      if (error) {
        throw error;
      }

      return data?.[0];
    } else {
      const { data, error } = await supabase
        .from('workout_splits')
        .insert(split)
        .select();

      if (error) {
        throw error;
      }

      return data?.[0];
    }
  } catch (error) {
    console.error("Error saving workout split:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    return data?.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function getUserFitnessProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('fitness_profile')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting user fitness profile:", error);
    return null;
  }
}

export async function getUserWorkoutProgram(userId: string) {
  try {
    const { data, error } = await supabase
      .from('workout_program')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting user workout program:", error);
    return null;
  }
}

export async function getWorkoutSplit(splitId: string) {
  try {
    const { data, error } = await supabase
      .from('workout_splits')
      .select('*')
      .eq('id', splitId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting workout split:", error);
    return null;
  }
}

export async function getWorkoutSplitsByProgramId(programId: string) {
  try {
    const { data, error } = await supabase
      .from('workout_splits')
      .select('*')
      .eq('program_id', programId)
      .order('day_number', { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting workout splits:", error);
    return null;
  }
} 