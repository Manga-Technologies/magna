import { useState } from "react";
import seedrandom from 'seedrandom';

// Function to generate a random hex color
export function generateHexColor(salt : number) {
  const hexDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
  let color = "#";

  for (let i = 0; i < 6; i++) {

    // creates random index, using score as seed
    const randomIndex = Math.floor(seedrandom(salt.toString())() * hexDigits.length);

    // appends new hexdigit with new rng index to color
    color += hexDigits[randomIndex];
  }
  return color;
};
