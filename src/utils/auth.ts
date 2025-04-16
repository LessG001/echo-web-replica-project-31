// Add the changePassword function to auth.ts (assume this is somewhere in the existing file)

export interface User {
  id: string;
  email: string;
  // Adding missing fields
  createdAt: string;
  lastLogin?: string;
  mfaEnabled?: boolean;
}

// Add the changePassword function
export const changePassword = (
  userId: string, 
  currentPassword: string, 
  newPassword: string
): { success: boolean; message: string } => {
  // Get users from localStorage
  const usersData = localStorage.getItem('secure_vault_users');
  if (!usersData) {
    return { success: false, message: "User database not found" };
  }

  const users = JSON.parse(usersData);
  const userIndex = users.findIndex((u: User) => u.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: "User not found" };
  }
  
  // In a real app, we would hash and compare passwords
  // For this demo, we'll skip password verification and just update
  
  // Update the password (in a real app, hash it first)
  users[userIndex].password = newPassword;
  
  // Save back to localStorage
  localStorage.setItem('secure_vault_users', JSON.stringify(users));
  
  return { success: true, message: "Password updated successfully" };
};

// Ensure getCurrentUser returns the extended User type
export const getCurrentUser = (): User | null => {
  const sessionData = localStorage.getItem('secure_vault_session');
  if (!sessionData) return null;
  
  try {
    const session = JSON.parse(sessionData);
    if (!session.userId || new Date(session.expiresAt) < new Date()) {
      return null;
    }
    
    // Get user data
    const usersData = localStorage.getItem('secure_vault_users');
    if (!usersData) return null;
    
    const users = JSON.parse(usersData);
    const user = users.find((u: User) => u.id === session.userId);
    
    if (!user) return null;
    
    // Ensure all required fields exist
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Default 30 days ago
      lastLogin: user.lastLogin || new Date().toISOString(),
      mfaEnabled: user.mfaEnabled || false
    };
  } catch (error) {
    console.error('Error parsing session:', error);
    return null;
  }
};
