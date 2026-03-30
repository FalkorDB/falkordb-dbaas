import { ALLOWED_ACL } from '../constants';

/**
 * Parse ACL string into a set of allowed commands
 */
function parseAcl(acl: string): Set<string> {
  const commands = new Set<string>();

  // Split by spaces, handling quoted commands
  const regex = /(?:'([^']*)'|(\S+))/g;
  let match;

  while ((match = regex.exec(acl)) !== null) {
    const command = match[1] || match[2];
    if (command && command.startsWith('+')) {
      // Remove the + prefix and normalize
      commands.add(command.substring(1).toUpperCase());
    }
  }

  return commands;
}

/**
 * Check if a command is allowed, considering subcategories
 */
function isCommandAllowed(command: string, allowedCommands: Set<string>): boolean {
  // Direct match
  if (allowedCommands.has(command)) {
    return true;
  }

  // Check if it's a subcategory (e.g., MODULE|LIST)
  if (command.includes('|')) {
    const [category] = command.split('|');
    // If the category itself is allowed, subcategory is allowed
    if (allowedCommands.has(category)) {
      return true;
    }
  }

  return false;
}

/**
 * Validate that user ACL is a subset of allowed ACL
 * @param userAcl The ACL string to validate
 * @returns Object with { valid: boolean, invalidCommands: string[] }
 */
export function validateAcl(userAcl: string): { valid: boolean; invalidCommands: string[] } {
  const allowedCommands = parseAcl(ALLOWED_ACL);
  const userCommands = parseAcl(userAcl);

  const invalidCommands: string[] = [];

  for (const command of userCommands) {
    if (!isCommandAllowed(command, allowedCommands)) {
      invalidCommands.push(command);
    }
  }

  return {
    valid: invalidCommands.length === 0,
    invalidCommands,
  };
}
