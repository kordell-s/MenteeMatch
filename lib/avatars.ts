/**
 * Avatar utility functions
 * Generates gender-appropriate placeholder avatars
 */

export function getAvatarUrl(name: string, gender?: string | null, customUrl?: string | null): string {
  // If custom profile picture exists, use it
  if (customUrl) {
    return customUrl;
  }

  // Use UI Avatars API with gender-appropriate colors and initials
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Gender-specific color schemes
  let background = '219EBC'; // brand-teal (default/neutral)
  let color = 'FFFFFF'; // white text

  if (gender === 'MALE') {
    background = '023047'; // brand-navy (masculine)
    color = 'FFFFFF';
  } else if (gender === 'FEMALE') {
    background = 'FB8500'; // brand-orange (feminine)
    color = 'FFFFFF';
  }

  // UI Avatars API: https://ui-avatars.com/
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${background}&color=${color}&size=256&bold=true&font-size=0.4`;
}

/**
 * Get gender-based illustration avatar (alternative option)
 * Uses DiceBear API for illustrated avatars
 */
export function getIllustratedAvatar(name: string, gender?: string | null): string {
  const seed = name.toLowerCase().replace(/\s/g, '-');

  // DiceBear has different avatar styles
  // avataaars: cartoon style
  // bottts: robot style
  // personas: professional style

  let style = 'avataaars'; // default cartoon style

  if (gender === 'MALE') {
    style = 'avataaars'; // cartoon style works for male
  } else if (gender === 'FEMALE') {
    style = 'avataaars'; // same style, different seed creates variation
  }

  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4`;
}

/**
 * Determine default avatar URL based on user data
 */
export function getDefaultAvatar(user: {
  name: string;
  gender?: string | null;
  profilePicture?: string | null;
}): string {
  return getAvatarUrl(user.name, user.gender, user.profilePicture);
}
