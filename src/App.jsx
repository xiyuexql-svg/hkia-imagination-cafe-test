import { useState } from "react";

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
  tart: ["Cherry", "Plum"],
  veggie: ["Spinip"],
  banana: ["Banana"],
  chocolate: ["Chocolate Coin"],
  citrus: ["Lemon", "Lime", "Orange"],
  confetti: ["Rainbow Sprinkles"],
  eggy: ["Egg"],
  lychee: ["Lychee"],
  nutty: ["Toasted Almond"],
  refreshing: ["Pear", "Peach", "Grape", "Dragonfruit"],
  sakura: ["Sakura"],
  starry: ["Starfruit"],
  sweet: ["Candy Cloud"],
  tropical: ["Kiwi", "Mango", "Coconut", "Pineapple"],
  wheat: ["Flour"],
};

const multiplierMap = {
  single: 1,
  double: 2,
  triple: 3,
};

const baseOptions = ["Boba Tea", "Dango","Mochi", "Onigiri",  "Rainbow Dango", "Ramen", "Sando", "Snow Ice", "Taiyaki"];
const sweetnessOptions = ["Unsweetened", "Semi-Sweet", "Sweet", "Very Sweet"];
const milkOptions = ["No Milk", "Milk"];
const bobaOptions = ["Boba", "No Boba"];

export default function App() {
  const [selectedBase, setSelectedBase] = useState("Mochi");
  const [sweetness, setSweetness] = useState("Unsweetened");
  const [milk, setMilk] = useState("");
  const [boba, setBoba] = useState("Boba");
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [showIncompleteError, setShowIncompleteError] = useState(false);

  const getLimit = () => {
    if (selectedBase === "Mochi" || selectedBase === "Snow Ice" || selectedBase === "Taiyaki" || selectedBase === "Onigiri") return 1;
    if (selectedBase === "Boba Tea") return 1;
    if (selectedBase === "Ramen" || selectedBase === "Rainbow Dango") return 3;
    return 3;
  };

  const getBeeswaxLevel = () => {
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
      alert("Please enter an ingredient");
      return;
    }

    // Check for "or" in input - handle multiple "or" cases
    const orPattern = /\s+or\s+/i;
    const hasOr = orPattern.test(inputText);
    
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
    if (hasOr) {
  const allOptions = [];

  for (const word of words) {
    if (data[word]) {
      allOptions.push(...data[word]);
    }
  }

  const combined = allOptions.join(" or ");
  const limit = getLimit();

  // Single ingredient base
  if (limit === 1) {
    setResults([combined]);
    setShowIncompleteError(false);
    setShowWarning(false);
    return;
  }

  // Multi-ingredient base (Sando, Ramen, etc.)
  const result = [combined];
  while (result.length < limit) {
    result.push("Any");
  }

  setResults(result);
  return;
}

    // 🍰 SPECIAL RULE: 3-ingredient bases (Sando/Dango/Ramen/Rainbow Dango) 2-category = Any
    // Only applies when user explicitly uses "and" or "or" to combine two categories
    const threeIngredientBases = ["Sando", "Dango", "Ramen", "Rainbow Dango"];
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
        special = uniqueKeys.slice(0, 2).map(k => data[k].join(" or "));
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
  if (hasOr && isSingleIngredientBase) {
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
    if (validCount < limit) {
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
      const level = getBeeswaxLevel();
      found.push(`Coral Milk x ${milk ? 1 : 0}`);
      found.push(`Tapioca x ${boba === "Boba" ? 1 : 0}`);
      found.push(`Honeycomb x ${level}`);
    }

    setResults(found);
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "30px", background: "#f5f5f5", minHeight: "100vh" }}>

      <div style={{ marginBottom: "15px" }}>
        {baseOptions.map(b => (
          <label key={b} style={{ marginRight: "15px", cursor: "pointer" }}>
            <input
              type="radio"
              name="base"
              value={b}
              checked={selectedBase === b}
              onChange={(e) => { setSelectedBase(e.target.value); findIngredients(); setShowIncompleteError(false); }}
              style={{ marginRight: "5px" }}
            />
            {b}
          </label>
        ))}
      </div>

      {selectedBase === "Boba Tea" && (
        <>
          <select value={sweetness} onChange={(e) => setSweetness(e.target.value)} style={{ padding: "10px", marginLeft: "10px" }}>
            {sweetnessOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={milk} onChange={(e) => setMilk(e.target.value)} style={{ padding: "10px", marginLeft: "10px" }}>
            <option value="">--</option>
            <option value="Milk">Milk</option>
          </select>
          <select value={boba} onChange={(e) => setBoba(e.target.value)} style={{ padding: "10px", marginLeft: "10px" }}>
            {bobaOptions.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </>
      )}

      <div style={{ marginBottom: "20px" }}>
        <input
          value={inputText}
          onChange={(e) => { setInputText(e.target.value); setResults([]); setShowWarning(false); setShowIncompleteError(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") findIngredients(); }}
          placeholder="e.g. frosty starry citrus"
          style={{ width: "300px", padding: "10px", fontSize: "16px" }}
        />

        <button onClick={findIngredients} style={{ marginLeft: "10px", padding: "10px" }}>
          Find
        </button>
      </div>

      {inputText && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>Is this the customer's order?</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>
            {selectedBase === "Boba Tea" 
              ? `${toTitleCase(sweetness)} ${toTitleCase(inputText)}${boba === "Boba" ? " Boba" : ""}${milk ? " Milk" : ""} Tea${boba === "No Boba" ? ", No Boba" : ""}`
              : `${toTitleCase(inputText)} ${toTitleCase(selectedBase)}`
            }
          </div>
        </div>
      )}

      {!showWarning && (
        <div style={{ background: "white", padding: "15px", borderRadius: "8px" }}>
          {results.length === 0 ? (
            <div>❌ No ingredients found</div>
          ) : (
            <ol>
              {results.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ol>
          )}
        </div>
      )}

      {showWarning && (
        <div style={{ color: "red", marginTop: "10px", fontSize: "14px", fontStyle: "italic" }}>
          This might be an invalid order. Check again?
        </div>
      )}

      {showIncompleteError && (
        <div style={{ color: "red", marginTop: "10px", fontSize: "14px", fontStyle: "italic" }}>
          It does not seem right, add more details?
        </div>
      )}
    </div>
  );
}
