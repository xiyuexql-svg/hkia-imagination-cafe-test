import { useEffect, useState } from "react";
import "./App.css";
import headerImg from "./assets/header-img.jpg";

const baseingredients = {
  "Boba Tea": {
    base: ["Tea Leaves"],
    limit: 1
  },
  Mochi: {
    base: ["Rice Flour"],
    limit: 1
  },
  Sando: {
    base: ["Whipped Cream"],
    limit: 3
  },
  "Rainbow Dango": {
    base: ["Rainbow Beam + Flavored Mochi Below"],
    limit: 3
  },
  Dango: {
    base: ["Stick + Flavored Mochi Below"],
    limit: 3
  },
  Nigiri: {
    base: ["Rice"],
    limit: 1
  },
  Onigiri: {
    base: ["Rice + Seaweed Sheet"],
    limit: 1
  },
  Ramen: {
    base: ["Noodle Grass"],
    limit: 3
  },
  "Sushi Roll": {
    base: ["Rice + Seaweed Sheet"],
    limit: 3
  },
  "Snow Ice": {
    base: ["Shaved Ice"],
    limit: 1
  },
  Taiyaki: {
    base: ["Batter"],
    limit: 1
  },
  Anything: {
    base: [],
    limit: 3
  }
};

const data = {
  "apple": ["Apple"],
  "banana": ["Banana"],
  "cheesy": ["Moon Cheese"],
  "chocolate": ["Chocolate Coin"],
  "cinnamon": ["Cinna Bloom"],
  "citrus": ["Lemon or Lime or Orange"],
  "coffee": ["Candlenut"],
  "confetti": ["Rainbow Sprinkles"],
  "creamy": ["Coral Milk"],
  "eggy": ["Egg"],
  "frosty": ["Snowcicle"],
  "ginger": ["Ginger"],
  "imaginary_crab": ["Imaginary Crab"],
  "imaginary_fish": ["Imaginary Salmon or Imaginary Tuna"],
  "imaginary_seafood": ["Imaginary Scallop or Imaginary Sea Urchin or Imaginary Shrimp or Imaginary Squid"],
  "lychee": ["Lychee"],
  "magical": ["Glow Berry"],
  "nutty": ["Toasted Almond"],
  "pumpkin": ["Pumpkin"],
  "refreshing": ["Dragonfruit or Grapes or Peach or Pear"],
  "rich": ["Tofu"],
  "sakura": ["Sakura"],
  "soy": ["Soy Sauce"],
  "spicy": ["Magma Bloom"],
  "starry": ["Starfruit"],
  "strawberry": ["Strawberry"],
  "sweet": ["Candy Cloud"],
  "tart": ["Cherry or Plum"],
  "tropical": ["Coconut or Kiwi or Mango or Pineapple"],
  "veggie": ["Spinip"],
  "wasabi": ["Wasabi"],
  "wheat": ["Flour"],
};

const nigiriAddonMap = {
  ginger: "Ginger",
  soy: "Soy Sauce",
  wasabi: "Wasabi"
};
const multiplierMap = {
  single: 1,
  double: 2,
  triple: 3,
};

const baseOptions = ["Anything", "Boba Tea", "Mochi", "Dango",  "Rainbow Dango", "Onigiri", "Nigiri", "Sushi Roll", "Ramen", "Sando", "Snow Ice", "Taiyaki"];
const sweetnessOptions = ["Unsweetened", "Semi-Sweet", "Sweet", "Very Sweet"];
const milkOptions = ["No Milk", "Milk"];
const bobaOptions = ["Boba", "No Boba"];
const specialKeywords = ["double", "triple"];

export default function App() {
const [visits, setVisits] = useState(0);

useEffect(() => {
  fetch("https://api.counterapi.dev/v2/xiyuexql-svgs-team-3857/first-counter-3857/up")
    .then(res => res.json())
    .then(data => {
      setVisits(data.data.up_count);
    })
    .catch(err => console.error("Counter error:", err));
}, []);

  const [selectedBase, setSelectedBase] = useState("Anything");
  const [sweetness, setSweetness] = useState("Unsweetened");
  const [milk, setMilk] = useState("");
  const [boba, setBoba] = useState("Boba");
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [showIncompleteError, setShowIncompleteError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nigiriAddon, setNigiriAddon] = useState("");
  const [suggestions, setSuggestions] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);
  const getLimit = () => {
    return baseingredients[selectedBase]?.limit || 3;
  };

  const getSweetnessLevel = () => {
    const titleSweetness = toTitleCase(sweetness);
    return sweetnessOptions.indexOf(titleSweetness);
  };

  const toTitleCase = (str) => {
    // Add space before capital letters, then capitalize first letter of each word
    const spaced = str.replace(/([a-z])([A-Z])/g, '$1 $2');
    return spaced.replace(/\b\w/g, (match) => match.toUpperCase());
  };

   const findIngredients = () => {
    if (!inputText.trim()) {
      alert("Please enter the customer's request");
      return;
    }

    // Check for "or" in input - handle multiple "or" cases
    const orPattern = /\s+or\s+/i;
    const hasOr = orPattern.test(inputText.toLowerCase());
    
    // Check for "and" in input (for Sando/Dango)
    const andPattern = /\s+and\s+/i;
    const hasAnd = andPattern.test(inputText);
    let rawWords;
    if (hasOr) {
      // Split by "or" to get the two options
      rawWords = inputText.toLowerCase().trim().split(orPattern);
    } else if (hasAnd) {
      // Split by "and" to get the two options
      rawWords = inputText.toLowerCase().trim().split(andPattern);
    } else {
      // Split by space, filter out "and"
      rawWords = inputText.toLowerCase().trim().split(/\s+/).filter(w => w !== "and");
    }
    const words = rawWords.filter(w => w.trim() !== "");

    const isImplicitAnd = !hasOr && !hasAnd &&  words.length === 2;
    let found = [];
    let ingredientKeys = [];

    // Handle "or" case: if exactly 2 words and both are valid ingredients, show as combined option with all choices
  if (hasOr && words.length === 2) {
      const word1 = words[0].trim();
      const word2 = words[1].trim();
      if (data[word1] && data[word2]) {
        // Show all ingredient options for each category
        const group = `${data[word1].join(" or ")} or ${data[word2].join(" or ")}`;
        found.push(group);
        ingredientKeys.push(word1, word2);
      } else {
        // Fall back to regular processing
        for (const word of words) {
          if (data[word]) {
            found.push(data[word][0]);
            ingredientKeys.push(word);
          }
        }
      }
    } else {
      // Regular processing (no "or" or more than 2 words)
      for (let i = 0; i < words.length; i++) {
        const word = words[i].trim();

        if (multiplierMap[word] && words[i + 1]) {
          const multiplier = multiplierMap[word];
          const key = words[i + 1];

          if (data[key]) {
            for (let j = 0; j < multiplier; j++) {
              found.push(data[key][0]);
              ingredientKeys.push(key);
            }
          }

          i++; // Skip the next word since it was used as the key
        } else if (data[word]) {
          found.push(data[word][0]);
          ingredientKeys.push(word);
        }
      }
    }


    // 🍰 SPECIAL RULE: 3-ingredient bases (Sando/Dango/Ramen/Rainbow Dango) 2-category = Any
    // Only applies when user explicitly uses "and" or "or" to combine two categories
    const threeIngredientBases = ["Anything", "Sando", "Dango", "Ramen", "Rainbow Dango", "Sushi Roll"];
    if (
      threeIngredientBases.includes(selectedBase) &&
      (hasAnd || hasOr || isImplicitAnd) &&
      new Set(ingredientKeys).size === 2
    ) {
      const uniqueKeys = [...new Set(ingredientKeys)];
      const limit = getLimit();
      
      // For "or", combine all options into one slot; for "and", keep separate
      let special;
      if (hasOr) {
        // Combine all options into one slot
        const allOptions = uniqueKeys.flatMap(k => data[k]);
        special = [allOptions.join(" or ")];
        // Fill remaining with Any
        while (special.length < limit) {
          special.push("Any");
        }
      } else {
        // For "and", show each category separately
        special = uniqueKeys.slice(0, 3).map(k => data[k].join(" or "));
        // Fill remaining slots with "Any"
        while (special.length < limit) {
          special.push("Any");
        }
      }

      setResults(special);
      return;
    }

    const limit = getLimit();
    const isSingleIngredientBase = limit === 1;
    found = found.slice(0, limit);

    // For single-ingredient bases with "or", combine all options into one slot
  if (hasOr && isSingleIngredientBase && selectedBase !== "Boba Tea")  {
  const allOptions = [];

  for (const word of words) {
    if (data[word]) {
      allOptions.push(...data[word]);
    }
  }

  const combined = allOptions.join(" or ");
  const anyFill = Array(limit).fill("Any");
  anyFill[0] = combined;

  setResults(anyFill);
  setShowIncompleteError(false);
  setShowWarning(false);
  return;
}

    // For single-ingredient bases, "or" counts as 1 valid option
    // Otherwise, check if we have enough ingredients
    const validCount = hasOr && isSingleIngredientBase ? 1 : found.length;
    if (validCount < limit && selectedBase !== "Anything") {
      setShowIncompleteError(true);
      setResults([]);
      return;
    }

    // Check for invalid order (too many ingredients for single-ingredient base)
    // But allow "or" as it provides options
    // Count only actual ingredients (not multiplier words like "double")
    const ingredientWordCount = ingredientKeys.length;
    setShowWarning(isSingleIngredientBase && ingredientWordCount > 1 && !hasOr);

    if (selectedBase === "Boba Tea") {
      const level = getSweetnessLevel();
      found.push(`Coral Milk x ${milk ? 1 : 0}`);
      found.push(`Tapioca x ${boba === "Boba" ? 1 : 0}`);
      found.push(`Honeycomb x ${level}`);
    }
    if (selectedBase === "Nigiri" && nigiriAddon) {
      if (data[nigiriAddon]) {
        found.push(data[nigiriAddon][0]);
      }
    }
    setResults(found);
  };
const baseIngredient = baseingredients[selectedBase]?.base || [];
  return (
    <div className="container">
      <div className="header">
  <img
    src={headerImg}
    alt="Header"
    className="header-img"
  />
</div>
      <h2 style={{ color: "#333" }}>Imagination Cafe Recipe Generator</h2>
<div className="inner-container">
  <center>
      <div className="base-options">
        {baseOptions.map(b => (
          <label key={b} style={{ marginRight: "15px", cursor: "pointer" }}>
            <input
              type="radio"
              name="base"
              value={b}
              checked={selectedBase === b}
              onChange={(e) => { setSelectedBase(e.target.value); 
        setResults([]);
        setShowWarning(false);
        setShowIncompleteError(false);
        setShowConfirm(true); }}
              style={{ marginRight: "5px" }}
            />
            {b}
          </label>
        ))}
      </div>
      <div className="custom-options">
{selectedBase === "Nigiri" && (
  <div className="boba-card">
    <p className="section-title">Nigiri Add-ons</p>

    <div className="select-grid">
      <select
        value={nigiriAddon}
        onChange={(e) => {
          setNigiriAddon(e.target.value);
          setResults([]);
          setShowWarning(false);
          setShowIncompleteError(false);
          setShowConfirm(true);
        }}
      >
        <option value="">None</option>
        <option value="ginger">Ginger</option>
        <option value="soy">Soy Sauce</option>
        <option value="wasabi">Wasabi</option>
      </select>
    </div>
  </div>
)}
  {selectedBase === "Boba Tea" && (
    <div className="boba-card">
      <p className="section-title">Boba Tea Customization</p>

      <div className="select-grid">
        <select value={sweetness} onChange={(e) =>  { setSweetness(e.target.value)
        setResults([]);
        setShowWarning(false);
        setShowIncompleteError(false);
        setShowConfirm(true);
      }}>
          {sweetnessOptions.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select value={milk} onChange={(e) => { setMilk(e.target.value);
        setResults([]);
        setShowWarning(false);
        setShowIncompleteError(false);
        setShowConfirm(true);
      }}>
          <option value="">Milk Option</option>
          <option value="Milk">Milk</option>
        </select>

        <select value={boba} onChange={(e) => { setBoba(e.target.value);
        setResults([]);
        setShowWarning(false);
        setShowIncompleteError(false);
        setShowConfirm(true);
      }}>
          {bobaOptions.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
    </div>
  )}

  <div className="input-section">
    <input
      className="input-box"
      value={inputText}
      onChange={(e) => {
  const value = e.target.value;
  setInputText(value);

  setResults([]);
  setShowWarning(false);
  setShowIncompleteError(false);
  setShowConfirm(true);

  // 👇 AUTOCOMPLETE LOGIC
  const lastWord = value.split(/\s+/).pop().toLowerCase();

// 👇 combine ALL data keys + multipliers
const allOptions = [
  ...Object.keys(data),   // ✅ no more slice
  ...specialKeywords 
];

if (lastWord.length > 0) {
  const matches = allOptions.filter(option =>
    option.startsWith(lastWord)
  );

  setSuggestions(matches);
  setShowSuggestions(true);
} else {
  setShowSuggestions(false);
}
}}
      placeholder="e.g. Sweet and Tropical"
    />
    {showSuggestions && suggestions.length > 0 && (
  <div className="autocomplete-box">
    {suggestions.map((s, i) => (
      <div
        key={i}
        className="autocomplete-item"
        onClick={() => {
          const words = inputText.split(/\s+/);
          words[words.length - 1] = s;

          setInputText(words.join(" "));
          setShowSuggestions(false);

          document.querySelector(".input-box")?.focus();
        }}
      >
        {s}
      </div>
    ))}
  </div>
)}
  </div>

</div>
<br/>
      {inputText && (
        <div>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>Is this the customer's order?</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>
            {selectedBase === "Boba Tea" 
  ? `${toTitleCase(sweetness)} ${toTitleCase(inputText)}${boba === "Boba" ? " Boba" : ""}${milk ? " Milk" : ""} Tea${boba === "No Boba" ? ", No Boba" : ""}`

  : selectedBase === "Nigiri"
  ? `${toTitleCase(inputText)} ${toTitleCase(selectedBase)}${
      nigiriAddon ? ` with ${nigiriAddonMap[nigiriAddon]}` : ""
    }`

    : `${toTitleCase(inputText)} ${toTitleCase(selectedBase)}`
}
          </div>
        </div>
      )}
      <br/>
{showConfirm && inputText.trim() !== "" && (
  <div >
      <button
        className="yes-btn"
        onClick={() => {
          findIngredients();
          setShowConfirm(false);
          
    document.querySelector(".base-ingredient-card")?.focus();
        }}
      >
        Yes
      </button>

      <button
  className="no-btn"
  onClick={() => {
    setShowConfirm(false);
    setResults([]);              // 🧹 clear recipe card
    setShowWarning(false);       // optional: clear warnings
    setShowIncompleteError(false);

    document.querySelector(".input-box")?.focus();
  }}
>
  No
</button>
    </div>
)}
      {showWarning && (
  <div className="error">
    This might be an invalid order. Check again?

    <div className="searchtips">
      <p>
        Your option requires a single ingredient, but it looks like you entered multiple flavours.
      </p>
    </div>
  </div>
)}
      {showIncompleteError && (
        <div className="error">
          It doesn't seem right, check your details?
        <div className="searchtips">
          <p>Try adding one more flavour, or combine them with "and" / "or"</p >
          <p>Examples: Sweet and Tropical | Creamy or Fruity | Double Rich Strawberry</p>
        </div>
        </div>
      )}
      <br/>
      {baseIngredient && selectedBase !== "Anything" && (
  <div className="base-ingredient-card">
    <div className="base-title">Base Ingredient</div>

            <div></div>
    <div className="base-content">
      {baseIngredient.map((item, i) => (
        <div key={i} className="base-item">
          {item}
        </div>
      ))}
    </div>
  </div>
)}
      {!showWarning && !showIncompleteError && (
        <div className="card">
    <div className="card-title">Custom Ingredient</div>
          {results.length === 0 ? (
            <div>❌ No ingredients found</div>
          ) : (<ol className="ingredient-list">
  {results.map((r, i) => (
    <li key={i}>{r}</li>
  ))}
</ol>
          )}
        </div>
      )}
      
<div className="visitor-counter">
  👀 Visitors: {visits}
</div>
      </center>
      </div>
    </div>
  );
}
