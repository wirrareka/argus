
/**
 * Alternative version that handles the character mapping more explicitly
 * Use this if the above doesn't work with your specific barcode font
 */
export function encodeCode128Alt(text: string): string {
  if (!text || text.length === 0) {
    throw new Error('Input string cannot be empty');
  }

  // Code128 character mapping for barcode fonts
  const CODE128_CHARS = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

  let checksum = 104; // Start B value
  const result: number[] = [204]; // Start B character code

  // Process each character
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    const code128Index = CODE128_CHARS.indexOf(char);

    if (code128Index === -1) {
      throw new Error(`Character '${char}' is not supported in Code128 Set B`);
    }

    // Add character to result
    result.push(char.charCodeAt(0));

    // Add to checksum calculation
    checksum += code128Index * (i + 1);
  }

  // Add checksum
  checksum = checksum % 103;

  // Handle problematic checksum characters
  let checksumCharCode = checksum + 32;

  // Map problematic characters to safe alternatives
  if (checksumCharCode === 127) { // DEL character
    checksumCharCode = 95; // Use '_' instead (checksum value 63)
    checksum = 63;
  } else if (checksumCharCode > 126) { // Beyond ASCII printable range
    checksumCharCode = 32 + (checksum % 95); // Map to printable range
  }

  result.push(checksumCharCode);

  // Add stop character
  result.push(206);

  return result.map(code => String.fromCharCode(code)).join('');
}

/**
 * Fixed version that properly handles Code128 character mapping
 * This version uses the correct Code128 character codes
 */
export function encodeCode128(text: string): string {
  if (!text || text.length === 0) {
    throw new Error('Input string cannot be empty');
  }

  // Proper Code128 character mapping (values 0-102)
  // Characters 32-126 map to values 0-94, special codes 95-102
  const getCode128Value = (char: string): number => {
    const ascii = char.charCodeAt(0);
    if (ascii >= 32 && ascii <= 126) {
      return ascii - 32; // Values 0-94
    }
    throw new Error(`Character '${char}' (ASCII ${ascii}) is not supported`);
  };

  let checksum = 104; // Start B
  const codes: number[] = [];

  // Process each character
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    const code128Value = getCode128Value(char);
    codes.push(code128Value);
    checksum += code128Value * (i + 1);
  }

  // Calculate final checksum
  checksum = checksum % 103;

  // Build result using proper Code128 font character mapping
  let result = String.fromCharCode(204); // Start B
  result += text; // Data characters

  // For checksum, we need to map Code128 values back to font characters
  // Most Code128 fonts use this mapping:
  if (checksum <= 94) {
    result += String.fromCharCode(checksum + 32); // Standard ASCII
  } else {
    // Special handling for values 95-102 (these map to different characters in Code128 fonts)
    const specialCodes = [195, 196, 197, 198, 199, 200, 201, 202]; // Common Code128 font mapping
    result += String.fromCharCode(specialCodes[checksum - 95]);
  }

  result += String.fromCharCode(206); // Stop

  return result;
}

/**
 * Debug function to show the internal calculations
 */
export function debugCode128(text: string): void {
  console.log('=== Code128 Debug ===');
  console.log('Input:', text);

  let checksum = 104;
  console.log('Initial checksum (Start B):', checksum);

  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    const ascii = char.charCodeAt(0);
    const code128Value = ascii - 32;
    const positionWeight = i + 1;
    const contribution = code128Value * positionWeight;

    checksum += contribution;

    console.log(`Char ${i + 1}: '${char}' (ASCII ${ascii}) -> Code128 value ${code128Value} * ${positionWeight} = ${contribution}`);
    console.log(`Running checksum: ${checksum}`);
  }

  const finalChecksum = checksum % 103;
  console.log('Final checksum:', finalChecksum);
  console.log('Checksum character:', String.fromCharCode(finalChecksum + 32));

  const encoded = encodeCode128Alt(text);
  console.log('Encoded result:', encoded);
  console.log('Character codes:', Array.from(encoded).map(c => c.charCodeAt(0)));
}

/**
 * Compare different codes to find patterns
 */
export function compareCode128(codes: string[]): void {
  console.log('=== Code128 Comparison ===');

  codes.forEach(code => {
    console.log(`\n--- ${code} ---`);
    const encoded = encodeCode128Alt(code);
    const charCodes = Array.from(encoded).map(c => c.charCodeAt(0));

    let checksum = 104;
    for (let i = 0; i < code.length; i++) {
      const char = code.charAt(i);
      const code128Value = char.charCodeAt(0) - 32;
      checksum += code128Value * (i + 1);
    }
    const finalChecksum = checksum % 103;

    console.log('Encoded:', encoded);
    console.log('Character codes:', charCodes);
    console.log('Calculated checksum:', finalChecksum);
    console.log('Checksum char code:', finalChecksum + 32);

    // Check for problematic characters
    const problematicChars = [];
    for (let i = 0; i < code.length; i++) {
      const char = code.charAt(i);
      const ascii = char.charCodeAt(0);
      if (ascii < 32 || ascii > 126) {
        problematicChars.push(`${char} (${ascii})`);
      }
    }
    if (problematicChars.length > 0) {
      console.log('⚠️  Problematic characters:', problematicChars);
    }
  });
}
