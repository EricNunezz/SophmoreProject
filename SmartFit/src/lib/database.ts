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
}

export async function saveFitnessProfile(fitnessProfile: Omit<FitnessProfile, 'id' | 'created_at'>) {
  try {
    // First check if the user is authenticated
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !userData.user) {
      throw new Error("User is not authenticated. Please log in again.");
    }

    // Ensure the user_id in the profile matches the authenticated user
    if (fitnessProfile.user_id !== userData.user.id) {
      fitnessProfile.user_id = userData.user.id;
    }

    // Check for existing profile
    const { data: existingProfiles, error: fetchError } = await supabase
      .from('fitness_profile')
      .select('id')
      .eq('user_id', fitnessProfile.user_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error fetching existing profiles:", fetchError);
      throw fetchError;
    }

    if (existingProfiles) {
      // Update existing profile
      const { data, error } = await supabase
        .from('fitness_profile')
        .update({ quiz_data: fitnessProfile.quiz_data })
        .eq('id', existingProfiles.id)
        .select();

      if (error) {
        console.error("Error updating fitness profile:", error);
        throw error;
      }

      return data?.[0];
    } else {
      // Insert new profile
      const { data, error } = await supabase
        .from('fitness_profile')
        .insert(fitnessProfile)
        .select();

      if (error) {
        console.error("Error inserting fitness profile:", error);
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
    // First check if the user is authenticated
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !userData.user) {
      throw new Error("User is not authenticated. Please log in again.");
    }

    // Ensure the user_id in the program matches the authenticated user
    if (program.user_id !== userData.user.id) {
      program.user_id = userData.user.id;
    }

    // Check for existing program
    const { data: existingProgram, error: fetchError } = await supabase
      .from('workout_program')
      .select('id')
      .eq('user_id', program.user_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error fetching existing program:", fetchError);
      throw fetchError;
    }

    if (existingProgram) {
      // Update existing program
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
        console.error("Error updating workout program:", error);
        throw error;
      }

      return data?.[0];
    } else {
      // Insert new program
      const { data, error } = await supabase
        .from('workout_program')
        .insert(program)
        .select();

      if (error) {
        console.error("Error inserting workout program:", error);
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
    // First check if the user is authenticated
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !userData.user) {
      throw new Error("User is not authenticated. Please log in again.");
    }

    // Verify that the program_id belongs to a program owned by this user
    const { data: programData, error: programError } = await supabase
      .from('workout_program')
      .select('user_id')
      .eq('id', split.program_id)
      .single();

    if (programError) {
      console.error("Error verifying program ownership:", programError);
      throw new Error("Couldn't verify program ownership");
    }

    if (programData.user_id !== userData.user.id) {
      throw new Error("You don't have permission to modify this workout program");
    }

    // Check for existing splits
    const { data: existingSplits, error: fetchError } = await supabase
      .from('workout_splits')
      .select('*')
      .eq('program_id', split.program_id);

    if (fetchError) {
      console.error("Error fetching existing splits:", fetchError);
      throw fetchError;
    }

    if (existingSplits && existingSplits.length > 0) {
      // Delete existing splits for this program
      const { error } = await supabase
        .from('workout_splits')
        .delete()
        .eq('program_id', split.program_id);

      if (error) {
        console.error("Error deleting existing splits:", error);
        throw error;
      }
    }

    // Insert new split
    const { data, error } = await supabase
      .from('workout_splits')
      .insert(split)
      .select();

    if (error) {
      console.error("Error inserting workout split:", error);
      throw error;
    }

    return data?.[0];
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
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error fetching fitness profile:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting user's fitness profile:", error);
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
    console.error("Error getting user's workout program:", error);
    return null;
  }
}

export async function getWorkoutSplit(programId: string) {
  try {
    const { data, error } = await supabase
      .from('workout_splits')
      .select('*')
      .eq('program_id', programId)
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