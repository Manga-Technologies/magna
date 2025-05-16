import { useState } from "react";

  // Function to generate a random hex color
  function generateHexColor() {
    const hexDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
    let color = "#";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * hexDigits.length);
      color += hexDigits[randomIndex];
    }
    return color;
  };

  function generateRandomSalt(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let salt = '';
    for (let i = 0; i < length; i++) {
        salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return salt;
};

function generateHexColorAndSalt(saltLength = 16) {
  const hexColor = generateHexColor();
  const salt = generateRandomSalt(saltLength);
  return { hexColor, salt };
};