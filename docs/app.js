const languageButton = document.querySelector("#language");
const status = document.querySelector("#release-status");
const repoLink = document.querySelector("#repo-link");
const guideLink = document.querySelector("#guide-link");
const repository = repositoryFromLocation();
let language = localStorage.getItem("workbridge-site-language") || (navigator.language.startsWith("ko") ? "ko" : "en");

function repositoryFromLocation() {
  if (!location.hostname.endsWith("github.io")) return null;
  const owner = location.hostname.split(".")[0];
  const project = location.pathname.split("/").filter(Boolean)[0];
  return project ? `${owner}/${project}` : `${owner}/${owner}.github.io`;
}

function translate() {
  document.documentElement.lang = language;
  document.querySelectorAll(`[data-${language}]`).forEach((node) => { node.textContent = node.dataset[language]; });
  languageButton.textContent = language === "ko" ? "EN" : "KR";
  const guide = language === "ko" ? "README_KR.md" : "README_EN.md";
  guideLink.href = repository ? `https://github.com/${repository}/blob/main/${guide}` : `../${guide}`;
}

languageButton.addEventListener("click", () => {
  language = language === "ko" ? "en" : "ko";
  localStorage.setItem("workbridge-site-language", language);
  translate();
});

async function loadRelease() {
  if (!repository) {
    status.textContent = language === "ko" ? "GitHub Pages에서 최신 다운로드가 연결됩니다." : "Latest downloads are connected on GitHub Pages.";
    return;
  }
  repoLink.href = `https://github.com/${repository}`;
  try {
    const response = await fetch(`https://api.github.com/repos/${repository}/releases/latest`, { headers: { accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error(String(response.status));
    const release = await response.json();
    const patterns = { linux: /linux-x64\.sh$/i, arm64: /arm64\.dmg$/i, x64: /x64\.dmg$/i };
    for (const [kind, pattern] of Object.entries(patterns)) {
      const asset = release.assets.find((item) => pattern.test(item.name));
      const link = document.querySelector(`[data-asset="${kind}"]`);
      if (asset) { link.href = asset.browser_download_url; link.removeAttribute("aria-disabled"); }
    }
    status.textContent = `${release.tag_name} · ${new Date(release.published_at).toLocaleDateString(language === "ko" ? "ko-KR" : "en-US")}`;
  } catch {
    status.textContent = language === "ko" ? "릴리스가 아직 없습니다. GitHub Releases를 확인하세요." : "No release is available yet. Check GitHub Releases.";
  }
}

translate();
loadRelease();
