const fs = require("fs");

function parseData(data) {
  data = JSON.parse(data.split("|")[1]) || data;
  return data;
}

function parseAPIData(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = parseAPIData(obj[i]);
    }
  } else {
    Object.keys(obj).forEach((key) => {
      if (key === "data") {
        obj[key] = parseData(obj[key]);
      } else {
        obj[key] = parseAPIData(obj[key]);
      }
    });
  }

  return obj; // Return the updated object
}

async function fetchAvailableFlights(from, to, start, end, filters) {
  let data = {
    from,
    to,
    depart: new Date(start).toISOString().split("T")[0],
    return: new Date(end).toISOString().split("T")[0],
    poll: true,
    format: "v3",
    counts: {
      adults: 1,
      children: 0,
    },
    filters: JSON.stringify(filters),
  };

  const u = new URLSearchParams(data).toString();

  console.log(`https://skiplagged.com/api/search.php?${u}`);

  let flights = await fetch(`https://skiplagged.com/api/search.php?${u}`).then(
    (r) => r.json(),
  );

  flights = parseAPIData(flights);

  console.log(flights);

  const jsonString = JSON.stringify(flights, null, 2); // null and 2 for pretty formatting

  // File path where you want to save the JSON
  const filePath = "output.json"; // Replace 'output.json' with your desired file path and name

  // Write JSON string to a file
  fs.writeFile(filePath, jsonString, (err) => {
    if (err) {
      console.error("Error writing JSON to file:", err);
    } else {
      console.log("JSON saved to", filePath);
    }
  });
}

async function main() {
  console.log("hi!");
}

main();

fetchAvailableFlights("OAK", "berkeley", "2023-12-02", "2023-12-03", {
  types: {
    standard: true,
    hiddenCity: false,
  },
  sort: "value",
  stops: {
    many: false,
    one: true,
  },
});
