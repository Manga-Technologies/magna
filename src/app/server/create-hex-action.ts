import { useState } from "react";
import seedrandom from 'seedrandom';

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

