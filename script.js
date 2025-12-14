async function analyzeRepo() {
  const urlInput = document.getElementById("repoUrl").value.trim();

  if (!urlInput.includes("github.com")) {
    alert("Please enter a valid GitHub repository URL");
    return;
  }

  const parts = urlInput.replace("https://github.com/", "").split("/");
  const owner = parts[0];
  const repo = parts[1];

  try {
    // Try fetching real GitHub data
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!repoRes.ok) throw new Error("GitHub API failed");

    const repoData = await repoRes.json();

    const contentRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/`
    );
    if (!contentRes.ok) throw new Error("Content fetch failed");

    const files = await contentRes.json();

    runApiAnalysis(repoData, files);

  } catch (error) {
    console.warn("API failed, switching to heuristic mode");
    runHeuristicAnalysis(repo);
  }
}

// ---------------- API-BASED ANALYSIS ----------------
function runApiAnalysis(repoData, files) {
  let score = 50;
  let strengths = [];
  let improvements = [];

  const hasReadme = files.some(f => f.name.toLowerCase().includes("readme"));
  if (hasReadme) {
    score += 15;
    strengths.push("README documentation present");
  } else {
    improvements.push("Add a detailed README.md");
  }

  const hasTests = files.some(
    f => f.name.toLowerCase().includes("test") || f.name.toLowerCase().includes("spec")
  );
  if (hasTests) {
    score += 15;
    strengths.push("Automated tests detected");
  } else {
    improvements.push("Write unit/integration tests");
  }

  const hasSrc = files.some(f => f.name === "src" || f.name === "lib");
  if (hasSrc) {
    score += 10;
    strengths.push("Well-structured project folders");
  }

  updateUI(
    Math.min(score, 100),
    repoData.language || "Multi-stack",
    strengths,
    improvements
  );
}

// ---------------- HEURISTIC FALLBACK ----------------
function runHeuristicAnalysis(repoName) {
  const name = repoName.toLowerCase();
  let score = 40;
  let improvements = [];

  if (name.includes("app") || name.includes("system") || name.includes("api")) {
    score += 20;
  } else {
    improvements.push("Clarify real-world use case");
  }

  if (name.includes("test")) score += 10;
  else improvements.push("Add automated tests");

  if (name.includes("final") || name.includes("project")) score += 10;
  else improvements.push("Improve project completeness");

  // Tech stack heuristic
  let techStack = [];

  if (name.includes("react")) techStack.push("React");
  if (name.includes("node")) techStack.push("Node.js");
  if (name.includes("flask")) techStack.push("Flask");
  if (name.includes("django")) techStack.push("Django");
  if (name.includes("ml") || name.includes("ai")) techStack.push("Machine Learning");

  if (techStack.length === 0) techStack.push("General Programming");

  updateUI(
    Math.min(score, 100),
    techStack.join(", "),
    ["Heuristic-based evaluation used"],
    improvements
  );
}

// ---------------- UI UPDATE ----------------
function updateUI(score, tech, strengths, roadmap) {
  document.getElementById("score").innerText = score + " / 100";
  document.getElementById("techStack").innerText = tech;

  document.getElementById("summary").innerText =
  strengths.length > 0
    ? `The repository shows ${strengths.join(", ").toLowerCase()}, but requires improvements in documentation and testing.`
    : "The project has a basic structure but needs better documentation, testing, and adherence to best practices.";

  const list = document.getElementById("roadmap");
  list.innerHTML = "";

  if (roadmap.length === 0) {
    roadmap.push("Project is in good shape. Focus on incremental improvements.");
  }

  roadmap.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });

  document.getElementById("result").style.display = "block";
}
