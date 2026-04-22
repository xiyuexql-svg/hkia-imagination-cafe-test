import { useEffect, useState } from "react";
import "./App.css";
import headerImg from "./assets/header-img.jpg";


const baseingredients = {
  "Boba Tea": ["Tea Leaves"],
  Mochi: [ "Rice Flour" ],
  Sando: ["Whipped Cream"],
  "Rainbow Dango": ["Rainbow Beam + Mochi with ingredients below:" ],
  Dango: [ "Stick + Mochi with ingredients below:"],
  Nigiri: ["Rice"],
  Onigiri: ["Seaweed Sheet"] ,
  Ramen: [ "Noodle Grass"],
  "Snow Ice": ["Shaved Ice"],
  Taiyaki: [ "Batter"]
};

const data = {
  apple: ["Apple"],
  cheesy: ["Moon Cheese"],
  cinnamon: ["Cinna Bloom"],
  coffee: ["Candlenut"],
  creamy: ["Coral Milk"],
  frosty: ["Snowcicle"],
  magical: ["Glow Berry"],
  pumpkin: ["Pumpkin"],
  rich: ["Tofu"],
  spicy: ["Magma Bloom"],
  strawberry: ["Strawberry"],
  tart: ["Cherry or Plum"],
  veggie: ["Spinip"],
  banana: ["Banana"],
  chocolate: ["Chocolate Coin"],
  citrus: ["Lemon or Lime or Orange"],
  confetti: ["Rainbow Sprinkles"],
  eggy: ["Egg"],
  lychee: ["Lychee"],
  nutty: ["Toasted Almond"],
  refreshing: ["Pear or Peach or Grape or Dragonfruit"],
  sakura: ["Sakura"],
  starry: ["Starfruit"],
  sweet: ["Candy Cloud"],
  tropical: ["Kiwi or Mango or Coconut or Pineapple"],
  wheat: ["Flour"],
};


const multiplierMap = {
  single: 1,
  double: 2,
  triple: 3,
};

const baseOptions = ["Anything", "Boba Tea", "Dango","Mochi", "Onigiri",  "Rainbow Dango", "Ramen", "Sando", "Snow Ice", "Taiyaki"];
const sweetnessOptions = ["Unsweetened", "Semi-Sweet", "Sweet", "Very Sweet"];
const milkOptions = ["No Milk", "Milk"];
const bobaOptions = ["Boba", "No Boba"];


export default function App() {
const [visits, setVisits] = useState(0);

useEffect(() => {
  fetch("https://api.counterapi.dev/v2/xiyuexql-svgs-team-3857/first-counter-3857/up")
    .then(res => res.json())
    .then(data => {
      setVisits(data.count);
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
  const getLimit = () => {
    if (selectedBase === "Mochi" || selectedBase === "Snow Ice" || selectedBase === "Taiyaki" || selectedBase === "Onigiri") return 1;
    if (selectedBase === "Boba Tea") return 1;
    return 3;
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
    const threeIngredientBases = ["Anything", "Sando", "Dango", "Ramen", "Rainbow Dango"];
    if (
      threeIngredientBases.includes(selectedBase) &&
      (hasAnd || hasOr) &&
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

    setResults(found);
  };
const baseIngredient = baseingredients[selectedBase];
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
        setInputText(e.target.value);
        setResults([]);
        setShowWarning(false);
        setShowIncompleteError(false);
        setShowConfirm(true);
      }}
      placeholder="e.g. Sweet and Tropical"
    />
  </div>

</div>
<br/>
      {inputText && (
        <div>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>Is this the customer's order?</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>
            {selectedBase === "Boba Tea" 
              ? `${toTitleCase(sweetness)} ${toTitleCase(inputText)}${boba === "Boba" ? " Boba" : ""}${milk ? " Milk" : ""} Tea${boba === "No Boba" ? ", No Boba" : ""}`
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
          
    document.querySelector(".input-box")?.focus();
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
        </div>
      )}

      {showIncompleteError && (
        <div className="error">
          It doesn't sound right, add more details?
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
