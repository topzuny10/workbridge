const ui = {
  nav: [...document.querySelectorAll(".nav-button")],
  eyebrow: document.querySelector("#library-eyebrow"),
  libraryTitle: document.querySelector("#library-title"),
  sourceActions: document.querySelector("#source-actions"),
  search: document.querySelector("#search"),
  selectAllWrap: document.querySelector("#select-all-wrap"),
  selectAll: document.querySelector("#select-all"),
  deleteSelected: document.querySelector("#delete-selected"),
  count: document.querySelector("#list-count"),
  list: document.querySelector("#chat-list"),
  exportBar: document.querySelector("#export-bar"),
  includeProjects: document.querySelector("#include-projects"),
  createBundle: document.querySelector("#create-bundle"),
  cloudUpload: document.querySelector("#cloud-upload"),
  detailKind: document.querySelector("#detail-kind"),
  detailTitle: document.querySelector("#detail-title"),
  detailMeta: document.querySelector("#detail-meta"),
  detailActions: document.querySelector("#detail-actions"),
  transcript: document.querySelector("#transcript"),
  toast: document.querySelector("#toast"),
  settingsBackdrop: document.querySelector("#settings-backdrop"),
  closeSettings: document.querySelector("#close-settings"),
  cancelSettings: document.querySelector("#cancel-settings"),
  saveSettings: document.querySelector("#save-settings"),
  languageSetting: document.querySelector("#language-setting"),
  themeSetting: document.querySelector("#theme-setting"),
  codexPath: document.querySelector("#codex-path"),
  detectCodex: document.querySelector("#detect-codex"),
  inputCodex: document.querySelector("#input-codex"),
  codexPathBackdrop: document.querySelector("#codex-path-backdrop"),
  codexPathInput: document.querySelector("#codex-path-input"),
  closeCodexPath: document.querySelector("#close-codex-path"),
  cancelCodexPath: document.querySelector("#cancel-codex-path"),
  saveCodexPath: document.querySelector("#save-codex-path"),
  cloudServerUrl: document.querySelector("#cloud-server-url"),
  toggleSidebar: document.querySelector("#toggle-sidebar"),
  cloudAuthBackdrop: document.querySelector("#cloud-auth-backdrop"),
  closeCloudAuth: document.querySelector("#close-cloud-auth"),
  cloudEmail: document.querySelector("#cloud-email"),
  cloudPassword: document.querySelector("#cloud-password"),
  cloudPassphrase: document.querySelector("#cloud-passphrase"),
  cloudSignup: document.querySelector("#cloud-signup"),
  cloudLogin: document.querySelector("#cloud-login"),
  deleteBackdrop: document.querySelector("#delete-backdrop"),
  cancelDelete: document.querySelector("#cancel-delete"),
  confirmDelete: document.querySelector("#confirm-delete")
};

const messages = {
  ko: {
    brandTagline: "대화를 환경 너머로", export: "내보내기", imports: "가져온 묶음", cloud: "클라우드", localFirst: "종단간 암호화", privacyNote: "서버는 내용 확인 불가",
    selectChats: "옮길 대화 선택", codexWork: "Codex 작업", cursorWork: "Cursor 작업", claudeWork: "Claude Code 작업", localWork: "이 기기의 로컬 작업", importBundle: "묶음 가져오기", openBundle: ".workbridge 열기",
    searchChats: "대화 검색", selectAll: "전체 선택", deleteSelected: "삭제", deleteSelectedTitle: "선택한 작업 삭제", deleteIrreversible: "삭제 후에는 복구할 수 없습니다.", delete: "삭제", sourceDeleted: "{count}개 Codex 작업을 영구 삭제했습니다.", includeProjects: "Git 프로젝트 포함", exportSelected: "선택 항목 내보내기", chooseChat: "대화를 선택하세요",
    emptyTitle: "작업 흐름을 그대로 옮기세요", emptyBody: "지원하는 AI의 대화를 선택해 묶은 뒤, 다른 OS에서 열어 이어갑니다.",
    settings: "설정", close: "닫기", language: "언어", languageHint: "앱에 표시할 언어", theme: "테마", themeHint: "화면 색상 설정", codexLocation: "Codex 위치", codexLocationHint: "설치된 Codex 실행 파일 찾기",
    codexNotDetected: "아직 감지하지 않음", autoDetect: "자동 감지", inputPath: "입력", inputCodexPath: "Codex 경로 입력", executablePath: "실행 파일 경로", pathInputHint: "Codex 또는 ChatGPT 앱에 포함된 codex 실행 파일의 전체 경로를 입력하세요.", apply: "적용", codexPathSaved: "Codex 경로를 저장했습니다.", detecting: "감지 중…", codexDetected: "Codex를 자동으로 찾았습니다.", codexDetectFailed: "Codex 자동 감지 실패: {message}",
    themeSystem: "시스템 동기화", themeBlack: "블랙", themeLight: "라이트", cancel: "취소", save: "저장", saved: "설정을 저장했습니다.", collapseSidebar: "사이드바 접기", expandSidebar: "사이드바 펼치기",
    noDate: "날짜 없음", count: "{count}개", exportCount: "{count}개 내보내기", sourceEmpty: "Codex, Claude Code, Cursor 또는 ChatGPT export를 불러오세요.",
    importsEmpty: "가져온 묶음을 선택하거나 새 묶음을 여세요.", preview: "대화 미리보기", messagesCount: "{count}개 메시지", scrollHint: "스크롤하여 전체 대화 확인",
    restoreProject: "프로젝트 복원", continueCodex: "Codex에서 이어가기", continuePlatform: "{provider}에서 이어가기", user: "사용자", assistant: "도우미", system: "시스템",
    noMessages: "저장된 메시지를 읽지 못했습니다.", loadingChat: "대화를 읽는 중…", source: "SOURCE", readingCodex: "Codex 작업을 읽는 중입니다.", readingCursor: "Cursor 작업을 읽는 중입니다.", readingClaude: "Claude Code 작업을 읽는 중입니다.",
    codexLoaded: "{count}개 Codex 작업을 불러왔습니다.", cursorLoaded: "{count}개 Cursor 작업을 불러왔습니다.", cursorFailed: "Cursor 작업 불러오기 실패: {message}", claudeLoaded: "{count}개 Claude Code 작업을 불러왔습니다.", claudeFailed: "Claude Code 작업 불러오기 실패: {message}", codexFailed: "Codex 연결 실패: {message}", chatgptLoaded: "{count}개 ChatGPT 대화를 불러왔습니다.",
    bundleSaved: "{chats}개 대화와 {projects}개 프로젝트를 저장했습니다.", bundleImported: "이동 묶음을 가져왔습니다.", bundleAlreadyImported: "이미 가져온 묶음을 열었습니다.", chatsTitle: "{count}개 대화",
    projectRestored: "프로젝트 복원 완료: {target}", codexContinued: "감지된 Codex에 새 작업을 바로 적용했습니다.", webContinued: "대화 문맥을 복사하고 {provider}를 열었습니다. 새 대화에 붙여넣으세요.", providerLoaded: "{provider} 대화 {count}개를 불러왔습니다.",
    deleteExport: "내보낸 묶음 삭제", deleteExportHint: ".workbridge 파일", exportDeleted: "내보낸 묶음 파일을 삭제했습니다.", deleteImport: "가져온 묶음 삭제", importDeleted: "가져온 묶음을 삭제했습니다.",
    saveCloud: "클라우드 저장", cloudTitle: "내 클라우드 파일", cloudEmpty: "저장된 클라우드 파일이 없습니다.", cloudSignIn: "로그인", cloudAccount: "클라우드 계정", email: "이메일", accountPassword: "계정 비밀번호", encryptionPassword: "암호화 비밀번호", encryptionHint: "파일은 이 비밀번호로 기기에서 암호화됩니다. 서버는 대화 내용을 읽을 수 없습니다. 분실하면 복구할 수 없습니다.", signUp: "회원가입", login: "로그인", logout: "로그아웃", cloudServer: "클라우드 서버", cloudServerHint: "원격 WorkBridge Cloud 주소", cloudSignedIn: "{email} 계정으로 연결되었습니다.", cloudUploaded: "{count}개 대화를 암호화해 클라우드에 저장했습니다.", cloudDownloaded: "클라우드 파일을 내려받아 가져왔습니다.", cloudDeleted: "클라우드 파일을 삭제했습니다.", deleteCloudFile: "클라우드 파일 삭제", downloadImport: "이 기기로 가져오기", encryptedFile: "암호화된 파일", cloudLoginRequired: "클라우드 계정에 로그인하세요.", cloudLoginBody: "다른 OS에서 같은 계정과 암호화 비밀번호로 파일을 가져올 수 있습니다.", fileSize: "{size} MB"
  },
  en: {
    brandTagline: "Conversations across environments", export: "Export", imports: "Imported bundles", cloud: "Cloud", localFirst: "End-to-end encrypted", privacyNote: "Server cannot read content",
    selectChats: "Select conversations", codexWork: "Codex tasks", cursorWork: "Cursor tasks", claudeWork: "Claude Code tasks", localWork: "Local tasks on this device", importBundle: "Import bundle", openBundle: "Open .workbridge",
    searchChats: "Search conversations", selectAll: "Select all", deleteSelected: "Delete", deleteSelectedTitle: "Delete selected tasks", deleteIrreversible: "Deleted tasks cannot be recovered.", delete: "Delete", sourceDeleted: "Permanently deleted {count} Codex tasks.", includeProjects: "Include Git projects", exportSelected: "Export selected", chooseChat: "Select a conversation",
    emptyTitle: "Move your workflow intact", emptyBody: "Bundle conversations from a supported AI, then open them on another OS to continue.",
    settings: "Settings", close: "Close", language: "Language", languageHint: "Language used in the app", theme: "Theme", themeHint: "App color appearance", codexLocation: "Codex location", codexLocationHint: "Find the installed Codex executable",
    codexNotDetected: "Not detected yet", autoDetect: "Auto-detect", inputPath: "Enter", inputCodexPath: "Enter Codex path", executablePath: "Executable path", pathInputHint: "Enter the full path to the codex executable bundled with Codex or ChatGPT.", apply: "Apply", codexPathSaved: "Saved the Codex path.", detecting: "Detecting…", codexDetected: "Codex was detected automatically.", codexDetectFailed: "Codex auto-detection failed: {message}",
    themeSystem: "Sync with system", themeBlack: "Black", themeLight: "Light", cancel: "Cancel", save: "Save", saved: "Settings saved.", collapseSidebar: "Collapse sidebar", expandSidebar: "Expand sidebar",
    noDate: "No date", count: "{count}", exportCount: "Export {count}", sourceEmpty: "Load Codex, Claude Code, or Cursor tasks, or a ChatGPT export.",
    importsEmpty: "Select an imported bundle or open a new one.", preview: "Conversation preview", messagesCount: "{count} messages", scrollHint: "Scroll to review the full conversation",
    restoreProject: "Restore project", continueCodex: "Continue in Codex", continuePlatform: "Continue in {provider}", user: "User", assistant: "Assistant", system: "System",
    noMessages: "No saved messages could be read.", loadingChat: "Loading conversation…", source: "SOURCE", readingCodex: "Loading Codex tasks.", readingCursor: "Loading Cursor tasks.", readingClaude: "Loading Claude Code tasks.",
    codexLoaded: "Loaded {count} Codex tasks.", cursorLoaded: "Loaded {count} Cursor tasks.", cursorFailed: "Could not load Cursor tasks: {message}", claudeLoaded: "Loaded {count} Claude Code tasks.", claudeFailed: "Could not load Claude Code tasks: {message}", codexFailed: "Codex connection failed: {message}", chatgptLoaded: "Loaded {count} ChatGPT conversations.",
    bundleSaved: "Saved {chats} conversations and {projects} projects.", bundleImported: "Transfer bundle imported.", bundleAlreadyImported: "Opened the bundle that was already imported.", chatsTitle: "{count} conversations",
    projectRestored: "Project restored: {target}", codexContinued: "Applied the conversation directly to the detected Codex installation.", webContinued: "Copied the conversation context and opened {provider}. Paste it into a new conversation.", providerLoaded: "Loaded {count} {provider} conversations.",
    deleteExport: "Delete export", deleteExportHint: ".workbridge file", exportDeleted: "Deleted the exported bundle file.", deleteImport: "Delete imported bundle", importDeleted: "Deleted the imported bundle.",
    saveCloud: "Save to cloud", cloudTitle: "My cloud files", cloudEmpty: "No cloud files saved.", cloudSignIn: "Sign in", cloudAccount: "Cloud account", email: "Email", accountPassword: "Account password", encryptionPassword: "Encryption password", encryptionHint: "Files are encrypted on this device with this password. The server cannot read conversations. A lost encryption password cannot be recovered.", signUp: "Sign up", login: "Sign in", logout: "Sign out", cloudServer: "Cloud server", cloudServerHint: "Remote WorkBridge Cloud URL", cloudSignedIn: "Connected as {email}.", cloudUploaded: "Encrypted and saved {count} conversations to cloud.", cloudDownloaded: "Downloaded and imported the cloud file.", cloudDeleted: "Deleted the cloud file.", deleteCloudFile: "Delete cloud file", downloadImport: "Import to this device", encryptedFile: "Encrypted file", cloudLoginRequired: "Sign in to WorkBridge Cloud.", cloudLoginBody: "Use the same account and encryption password to import files on another OS.", fileSize: "{size} MB"
  }
};

let preferences = { language: "ko", theme: "system", cloudServerUrl: "http://127.0.0.1:8787" };
let sidebarCollapsed = localStorage.getItem("workbridge.sidebarCollapsed") === "true";
let detectedCodexPath = null;
let cloudState = { authenticated: false, user: null };
let cloudBundles = [];
let activeCloudBundle = null;

function t(key, values = {}) {
  return (messages[preferences.language]?.[key] || messages.ko[key] || key).replace(/\{(\w+)\}/g, (_match, name) => values[name] ?? "");
}

function providerName(kind) {
  return { codex: "Codex", cursor: "Cursor", claude: "Claude", chatgpt: "ChatGPT", deepseek: "DeepSeek", gemini: "Gemini" }[kind] || String(kind || "AI");
}

function providerBadge(kind) {
  return { codex: "C", cursor: "I", claude: "A", chatgpt: "G", deepseek: "D", gemini: "✦" }[kind] || "AI";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function applyStaticTranslations() {
  document.documentElement.lang = preferences.language;
  document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => { node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel)); });
}

function applySidebar() {
  document.documentElement.dataset.sidebar = sidebarCollapsed ? "collapsed" : "expanded";
  ui.toggleSidebar.textContent = sidebarCollapsed ? "›" : "‹";
  const label = t(sidebarCollapsed ? "expandSidebar" : "collapseSidebar");
  ui.toggleSidebar.setAttribute("aria-label", label);
  ui.toggleSidebar.title = label;
}

let view = "source";
let sourceChats = [];
let imports = [];
let activeImport = null;
let importedManifest = null;
let activeChat = null;
const selected = new Set();

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => ui.toast.classList.remove("show"), 3500);
}

function updateImportBadge() {
  let badge = ui.nav[1].querySelector(".kind-badge");
  if (!imports.length) {
    badge?.remove();
    return;
  }
  if (!badge) {
    badge = el("span", "kind-badge");
    ui.nav[1].append(badge);
  }
  badge.textContent = String(imports.length);
}

function updateCloudBadge() {
  const nav = ui.nav.find((button) => button.dataset.view === "cloud");
  let badge = nav.querySelector(".kind-badge");
  if (!cloudBundles.length) { badge?.remove(); return; }
  if (!badge) { badge = el("span", "kind-badge"); nav.append(badge); }
  badge.textContent = String(cloudBundles.length);
}

function formatDate(value) {
  if (!value) return t("noDate");
  return new Intl.DateTimeFormat(preferences.language === "ko" ? "ko-KR" : "en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function action(label, className, handler) {
  const button = el("button", className, label);
  button.type = "button";
  button.addEventListener("click", handler);
  return button;
}

function filteredChats() {
  const query = ui.search.value.trim().toLowerCase();
  if (view === "cloud") return query ? cloudBundles.filter((item) => item.name.toLowerCase().includes(query)) : cloudBundles;
  const chats = view === "source" ? sourceChats : importedManifest?.chats || [];
  return query ? chats.filter((chat) => `${chat.title} ${chat.preview || ""}`.toLowerCase().includes(query)) : chats;
}

function renderList() {
  const chats = filteredChats();
  ui.list.replaceChildren();
  ui.count.textContent = t("count", { count: chats.length });
  if (!chats.length) {
    ui.list.append(el("div", "empty-list", view === "source" ? t("sourceEmpty") : view === "cloud" ? (cloudState.authenticated ? t("cloudEmpty") : t("cloudLoginRequired")) : t("importsEmpty")));
    return;
  }

  for (const chat of chats) {
    const row = el("button", `chat-row${activeChat?.id === chat.id ? " active" : ""}`);
    row.type = "button";
    if (view === "cloud") {
      row.classList.toggle("active", activeCloudBundle?.id === chat.id);
      row.append(el("span", "kind-badge", "☁"));
      const body = el("span");
      body.append(el("span", "chat-title", chat.name));
      body.append(el("span", "chat-preview", t("encryptedFile")));
      const tags = el("span", "chat-tags");
      tags.append(el("span", "", formatDate(chat.createdAt)), el("span", "", t("fileSize", { size: (chat.size / 1024 / 1024).toFixed(2) })));
      body.append(tags); row.append(body);
      row.addEventListener("click", () => selectCloudBundle(chat));
      ui.list.append(row);
      continue;
    }
    if (view === "source") {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = selected.has(chat.id);
      checkbox.addEventListener("click", (event) => event.stopPropagation());
      checkbox.addEventListener("change", () => {
        checkbox.checked ? selected.add(chat.id) : selected.delete(chat.id);
        renderToolbar();
        selectChat(chat);
      });
      row.append(checkbox);
    } else {
      row.append(el("span", "kind-badge", providerBadge(chat.kind)));
    }
    const body = el("span");
    body.append(el("span", "chat-title", chat.title));
    body.append(el("span", "chat-preview", chat.preview || chat.messages?.[0]?.content || t("preview")));
    const tags = el("span", "chat-tags");
    tags.append(el("span", "kind-badge", providerName(chat.kind).toUpperCase()));
    tags.append(el("span", "", formatDate(chat.updatedAt || chat.createdAt)));
    if (chat.cwd) tags.append(el("span", "", chat.cwd.split(/[\\/]/).pop()));
    body.append(tags);
    row.append(body);
    row.addEventListener("click", () => selectChat(chat));
    ui.list.append(row);
  }
}

function renderToolbar() {
  ui.createBundle.textContent = selected.size ? t("exportCount", { count: selected.size }) : t("exportSelected");
  ui.createBundle.disabled = !selected.size;
  ui.cloudUpload.disabled = !selected.size;
  ui.deleteSelected.disabled = !selected.size;
}

function openDeleteConfirmation() {
  if (!selected.size) return;
  ui.deleteBackdrop.hidden = false;
  ui.confirmDelete.focus();
}

function closeDeleteConfirmation() { ui.deleteBackdrop.hidden = true; }

async function deleteSelectedSource() {
  ui.confirmDelete.disabled = true;
  try {
    const result = await window.workBridge.deleteSource([...selected]);
    const deleted = new Set(result.deletedIds);
    sourceChats = sourceChats.filter((chat) => !deleted.has(chat.id));
    for (const id of deleted) selected.delete(id);
    if (activeChat && deleted.has(activeChat.id)) activeChat = null;
    closeDeleteConfirmation();
    renderList(); renderToolbar();
    if (!activeChat) renderEmptyDetail();
    showToast(t("sourceDeleted", { count: deleted.size }));
  } catch (error) { showToast(error.message); }
  finally { ui.confirmDelete.disabled = false; }
}

function renderEmptyDetail() {
  ui.detailKind.textContent = "WORKBRIDGE";
  ui.detailTitle.textContent = t("chooseChat");
  ui.detailMeta.replaceChildren();
  ui.detailActions.replaceChildren();
  if (view === "imports" && activeImport) ui.detailActions.append(action(t("deleteImport"), "danger-button", deleteImport));
  if (view === "cloud") {
    ui.detailKind.textContent = "WORKBRIDGE CLOUD";
    ui.detailTitle.textContent = cloudState.authenticated ? t("cloudTitle") : t("cloudLoginRequired");
    if (cloudState.authenticated) ui.detailActions.append(action(t("logout"), "secondary-button", logoutCloud));
  }
  ui.transcript.replaceChildren();
  const empty = el("div", "empty-state");
  empty.append(el("div", "empty-symbol", view === "cloud" ? "☁" : "⌁"), el("h3", "", view === "cloud" ? (cloudState.authenticated ? t("cloudEmpty") : t("cloudLoginRequired")) : t("emptyTitle")), el("p", "", view === "cloud" ? t("cloudLoginBody") : t("emptyBody")));
  if (view === "cloud" && !cloudState.authenticated) empty.append(action(t("cloudSignIn"), "primary-button", openCloudAuth));
  ui.transcript.append(empty);
}

function selectCloudBundle(record) {
  activeCloudBundle = record;
  activeChat = null;
  renderList();
  ui.detailKind.textContent = "WORKBRIDGE CLOUD";
  ui.detailTitle.textContent = record.name;
  ui.detailMeta.replaceChildren(el("span", "", formatDate(record.createdAt)), el("span", "", t("fileSize", { size: (record.size / 1024 / 1024).toFixed(2) })), el("span", "", t("encryptedFile")));
  ui.detailActions.replaceChildren(action(t("downloadImport"), "primary-button", () => downloadCloud(record.id)), action(t("deleteCloudFile"), "danger-button", () => deleteCloud(record.id)));
  ui.transcript.replaceChildren();
  const empty = el("div", "empty-state");
  empty.append(el("div", "empty-symbol", "🔒"), el("h3", "", t("encryptedFile")), el("p", "", t("encryptionHint")));
  ui.transcript.append(empty);
}

function renderTranscript(chat) {
  ui.detailKind.textContent = `${providerName(chat.kind).toUpperCase()} CHAT`;
  ui.detailTitle.textContent = chat.title;
  ui.detailMeta.replaceChildren(
    el("span", "", t("messagesCount", { count: chat.messages?.length || 0 })),
    el("span", "", t("scrollHint")),
    el("span", "", formatDate(chat.updatedAt || chat.createdAt)),
    ...(chat.cwd ? [el("span", "", chat.cwd)] : [])
  );
  ui.detailActions.replaceChildren();
  if (view === "imports") {
    if (chat.projectId && importedManifest.projects.some((project) => project.id === chat.projectId)) {
      ui.detailActions.append(action(t("restoreProject"), "secondary-button", () => restoreProject(chat.projectId)));
    }
    if (chat.kind !== "codex") {
      ui.detailActions.append(action(t("continuePlatform", { provider: providerName(chat.kind) }), "secondary-button", () => continueWeb(chat)));
    }
    ui.detailActions.append(action(t("continueCodex"), "primary-button", () => continueCodex(chat)));
    ui.detailActions.append(action(t("deleteImport"), "danger-button", deleteImport));
  }
  ui.transcript.replaceChildren();
  for (const message of chat.messages || []) {
    const row = el("article", `message ${message.role}`);
    const avatar = el("div", "avatar", message.role === "user" ? (preferences.language === "ko" ? "나" : "ME") : message.role === "assistant" ? "AI" : "SYS");
    const body = el("div");
    body.append(el("div", "message-role", message.role === "user" ? t("user") : message.role === "assistant" ? t("assistant") : t("system")));
    body.append(el("div", "message-content", message.content));
    row.append(avatar, body);
    ui.transcript.append(row);
  }
  if (!chat.messages?.length) ui.transcript.append(el("div", "empty-list", t("noMessages")));
  ui.transcript.scrollTop = 0;
}

async function selectChat(chat) {
  activeChat = chat;
  renderList();
  ui.detailTitle.textContent = chat.title;
  ui.transcript.replaceChildren(el("div", "empty-state loading"));
  ui.transcript.firstChild.append(el("p", "", t("loadingChat")));
  try {
    if (view === "source" && (!chat.messages || !chat.messages.length)) {
      chat = await window.workBridge.readSource(chat.id);
      const index = sourceChats.findIndex((item) => item.id === chat.id);
      if (index >= 0) sourceChats[index] = { ...sourceChats[index], ...chat };
    }
    activeChat = chat;
    renderTranscript(chat);
  } catch (error) { showToast(error.message); renderEmptyDetail(); }
}

function switchView(nextView) {
  view = nextView;
  activeChat = null;
  ui.nav.forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  const source = view === "source";
  const cloud = view === "cloud";
  ui.eyebrow.textContent = source ? t("source") : cloud ? "CLOUD" : "IMPORTS";
  ui.libraryTitle.textContent = source ? t("selectChats") : cloud ? t("cloudTitle") : t("imports");
  ui.sourceActions.hidden = cloud;
  document.querySelector("#load-codex").hidden = !source;
  document.querySelector("#load-cursor").hidden = !source;
  document.querySelector("#load-chatgpt").hidden = !source;
  document.querySelector("#delete-export").hidden = !source;
  ui.selectAllWrap.hidden = !source;
  ui.deleteSelected.hidden = !source;
  ui.exportBar.hidden = !source;
  renderEmptyDetail();
  renderList();
  if (cloud && cloudState.authenticated) loadCloud();
}

async function loadCodex() {
  showToast(t("readingCodex"));
  try {
    const chats = await window.workBridge.loadCodex();
    const byId = new Map(sourceChats.map((chat) => [chat.id, chat]));
    chats.forEach((chat) => byId.set(chat.id, { ...byId.get(chat.id), ...chat }));
    sourceChats = [...byId.values()].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    renderList();
    showToast(t("codexLoaded", { count: chats.length }));
  } catch (error) { showToast(t("codexFailed", { message: error.message })); }
}

async function loadCursor() {
  showToast(t("readingCursor"));
  try {
    const chats = await window.workBridge.loadCursor();
    const byId = new Map(sourceChats.map((chat) => [chat.id, chat]));
    chats.forEach((chat) => byId.set(chat.id, { ...byId.get(chat.id), ...chat }));
    sourceChats = [...byId.values()].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    renderList();
    showToast(t("cursorLoaded", { count: chats.length }));
  } catch (error) { showToast(t("cursorFailed", { message: error.message })); }
}

async function loadClaude() {
  showToast(t("readingClaude"));
  try {
    const chats = await window.workBridge.loadClaude();
    const byId = new Map(sourceChats.map((chat) => [chat.id, chat]));
    chats.forEach((chat) => byId.set(chat.id, { ...byId.get(chat.id), ...chat }));
    sourceChats = [...byId.values()].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    renderList();
    showToast(t("claudeLoaded", { count: chats.length }));
  } catch (error) { showToast(t("claudeFailed", { message: error.message })); }
}

async function loadChatGpt() {
  try {
    const chats = await window.workBridge.loadChatGpt();
    if (!chats) return;
    const byId = new Map(sourceChats.map((chat) => [chat.id, chat]));
    chats.forEach((chat) => byId.set(chat.id, chat));
    sourceChats = [...byId.values()].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    renderList();
    showToast(t("chatgptLoaded", { count: chats.length }));
  } catch (error) { showToast(error.message); }
}

async function createBundle() {
  try {
    const result = await window.workBridge.createBundle({ chatIds: [...selected], includeProjects: ui.includeProjects.checked });
    if (!result) return;
    showToast(t("bundleSaved", { chats: result.chatCount, projects: result.projectCount }));
  } catch (error) { showToast(error.message); }
}

function openCloudAuth() {
  ui.cloudPassword.value = "";
  ui.cloudPassphrase.value = "";
  ui.cloudAuthBackdrop.hidden = false;
  ui.cloudEmail.focus();
}

function closeCloudAuth() { ui.cloudAuthBackdrop.hidden = true; }

async function authenticateCloud(mode) {
  ui.cloudSignup.disabled = true;
  ui.cloudLogin.disabled = true;
  try {
    const result = await window.workBridge.authenticateCloud({ mode, email: ui.cloudEmail.value, password: ui.cloudPassword.value, passphrase: ui.cloudPassphrase.value });
    cloudState = result.state;
    cloudBundles = result.bundles;
    closeCloudAuth();
    switchView("cloud");
    updateCloudBadge();
    showToast(t("cloudSignedIn", { email: result.user.email }));
  } catch (error) { showToast(error.message); }
  finally { ui.cloudSignup.disabled = false; ui.cloudLogin.disabled = false; }
}

async function loadCloud() {
  if (!cloudState.authenticated) { renderList(); renderEmptyDetail(); return; }
  try {
    cloudBundles = await window.workBridge.listCloud();
    updateCloudBadge();
    renderList();
  } catch (error) { showToast(error.message); }
}

async function uploadCloud() {
  if (!selected.size) return;
  if (!cloudState.authenticated) { openCloudAuth(); return; }
  ui.cloudUpload.disabled = true;
  try {
    const result = await window.workBridge.uploadCloud({ chatIds: [...selected], includeProjects: ui.includeProjects.checked });
    cloudBundles = result.bundles;
    updateCloudBadge();
    showToast(t("cloudUploaded", { count: result.chatCount }));
  } catch (error) { showToast(error.message); }
  finally { ui.cloudUpload.disabled = false; }
}

async function downloadCloud(cloudId) {
  try {
    const result = await window.workBridge.downloadCloud(cloudId);
    imports = result.imports;
    updateImportBadge();
    await openImport(result.record.id);
    showToast(t(result.alreadyImported ? "bundleAlreadyImported" : "cloudDownloaded"));
  } catch (error) { showToast(error.message); }
}

async function deleteCloud(cloudId) {
  try {
    const result = await window.workBridge.deleteCloud(cloudId);
    if (!result) return;
    cloudBundles = result.bundles;
    activeCloudBundle = null;
    updateCloudBadge(); renderList(); renderEmptyDetail();
    showToast(t("cloudDeleted"));
  } catch (error) { showToast(error.message); }
}

async function logoutCloud() {
  cloudState = await window.workBridge.logoutCloud();
  cloudBundles = [];
  activeCloudBundle = null;
  updateCloudBadge(); renderList(); renderEmptyDetail();
}

async function importBundle() {
  try {
    const result = await window.workBridge.importBundle();
    if (!result) return;
    imports = result.imports;
    updateImportBadge();
    await openImport(result.record.id);
    showToast(t(result.alreadyImported ? "bundleAlreadyImported" : "bundleImported"));
  } catch (error) { showToast(error.message); }
}

async function deleteExport() {
  try {
    const result = await window.workBridge.deleteExport();
    if (result) showToast(t("exportDeleted"));
  } catch (error) { showToast(error.message); }
}

async function deleteImport() {
  if (!activeImport) return;
  try {
    const result = await window.workBridge.deleteImport(activeImport.id);
    if (!result) return;
    imports = result.imports;
    updateImportBadge();
    activeImport = null;
    importedManifest = null;
    activeChat = null;
    if (imports.length) await openImport(imports[0].id);
    else switchView("imports");
    showToast(t("importDeleted"));
  } catch (error) { showToast(error.message); }
}

async function openImport(importId) {
  const result = await window.workBridge.readImport(importId);
  activeImport = result.record;
  importedManifest = result.manifest;
  importedManifest.chats = importedManifest.chats.map((chat) => ({
    ...chat,
    preview: chat.messages?.find((message) => message.role === "user")?.content?.slice(0, 180) || ""
  }));
  switchView("imports");
  ui.libraryTitle.textContent = t("chatsTitle", { count: result.manifest.chats.length });
  renderList();
}

async function restoreProject(projectId) {
  try {
    const target = await window.workBridge.restoreProject(activeImport.id, projectId);
    if (target) showToast(t("projectRestored", { target }));
  } catch (error) { showToast(error.message); }
}

async function continueCodex(chat) {
  try {
    const result = await window.workBridge.continueCodex(activeImport.id, chat.id);
    if (result) showToast(t("codexContinued"));
  } catch (error) { showToast(error.message); }
}

async function continueWeb(chat) {
  try {
    await window.workBridge.continueWeb(activeImport.id, chat.id);
    showToast(t("webContinued", { provider: providerName(chat.kind) }));
  } catch (error) { showToast(error.message); }
}

function refreshLanguage() {
  applyStaticTranslations();
  applySidebar();
  ui.eyebrow.textContent = view === "source" ? t("source") : view === "cloud" ? "CLOUD" : "IMPORTS";
  ui.libraryTitle.textContent = view === "source"
    ? t("selectChats")
    : view === "cloud" ? t("cloudTitle") : importedManifest ? t("chatsTitle", { count: importedManifest.chats.length }) : t("imports");
  renderToolbar();
  renderList();
  if (activeChat) renderTranscript(activeChat);
  else renderEmptyDetail();
}

function openSettings() {
  ui.languageSetting.value = preferences.language;
  ui.themeSetting.value = preferences.theme;
  ui.codexPath.value = detectedCodexPath || "";
  ui.cloudServerUrl.value = preferences.cloudServerUrl || "http://127.0.0.1:8787";
  ui.settingsBackdrop.hidden = false;
  ui.languageSetting.focus();
}

function closeSettings() {
  ui.settingsBackdrop.hidden = true;
}

async function saveSettings() {
  try {
    preferences = await window.workBridge.savePreferences({
      language: ui.languageSetting.value,
      theme: ui.themeSetting.value,
      cloudServerUrl: ui.cloudServerUrl.value
    });
    if (cloudState.serverUrl && cloudState.serverUrl !== preferences.cloudServerUrl) {
      cloudState = { authenticated: false, user: null, serverUrl: preferences.cloudServerUrl };
      cloudBundles = [];
    }
    applyTheme(preferences.theme);
    refreshLanguage();
    closeSettings();
    showToast(t("saved"));
  } catch (error) { showToast(error.message); }
}

async function detectCodex() {
  ui.detectCodex.disabled = true;
  ui.detectCodex.textContent = t("detecting");
  try {
    const result = await window.workBridge.detectCodex();
    detectedCodexPath = result.path;
    ui.codexPath.value = detectedCodexPath;
    showToast(t("codexDetected"));
  } catch (error) {
    showToast(t("codexDetectFailed", { message: error.message }));
  } finally {
    ui.detectCodex.disabled = false;
    ui.detectCodex.textContent = t("autoDetect");
  }
}

function openCodexPathInput() {
  ui.codexPathInput.value = detectedCodexPath || "";
  ui.codexPathBackdrop.hidden = false;
  ui.codexPathInput.focus();
  ui.codexPathInput.select();
}

function closeCodexPathInput() { ui.codexPathBackdrop.hidden = true; }

async function saveCodexPathInput() {
  ui.saveCodexPath.disabled = true;
  try {
    const result = await window.workBridge.setCodexPath(ui.codexPathInput.value);
    detectedCodexPath = result.path;
    ui.codexPath.value = result.path;
    closeCodexPathInput();
    showToast(t("codexPathSaved"));
  } catch (error) { showToast(error.message); }
  finally { ui.saveCodexPath.disabled = false; }
}

ui.nav.forEach((button) => button.addEventListener("click", () => {
  if (button.dataset.view === "imports" && imports.length) openImport(imports[0].id);
  else switchView(button.dataset.view);
}));
document.querySelector("#load-codex").addEventListener("click", loadCodex);
document.querySelector("#load-cursor").addEventListener("click", loadCursor);
document.querySelector("#load-claude").addEventListener("click", loadClaude);
document.querySelector("#load-chatgpt").addEventListener("click", loadChatGpt);
document.querySelector("#import-bundle").addEventListener("click", importBundle);
document.querySelector("#delete-export").addEventListener("click", deleteExport);
ui.createBundle.addEventListener("click", createBundle);
ui.cloudUpload.addEventListener("click", uploadCloud);
ui.search.addEventListener("input", renderList);
ui.selectAll.addEventListener("change", () => {
  for (const chat of filteredChats()) ui.selectAll.checked ? selected.add(chat.id) : selected.delete(chat.id);
  renderList();
  renderToolbar();
});
ui.deleteSelected.addEventListener("click", openDeleteConfirmation);
ui.cancelDelete.addEventListener("click", closeDeleteConfirmation);
ui.confirmDelete.addEventListener("click", deleteSelectedSource);
ui.deleteBackdrop.addEventListener("click", (event) => { if (event.target === ui.deleteBackdrop) closeDeleteConfirmation(); });
ui.closeSettings.addEventListener("click", closeSettings);
ui.cancelSettings.addEventListener("click", closeSettings);
ui.saveSettings.addEventListener("click", saveSettings);
ui.detectCodex.addEventListener("click", detectCodex);
ui.inputCodex.addEventListener("click", openCodexPathInput);
ui.closeCodexPath.addEventListener("click", closeCodexPathInput);
ui.cancelCodexPath.addEventListener("click", closeCodexPathInput);
ui.saveCodexPath.addEventListener("click", saveCodexPathInput);
ui.codexPathBackdrop.addEventListener("click", (event) => { if (event.target === ui.codexPathBackdrop) closeCodexPathInput(); });
ui.codexPathInput.addEventListener("keydown", (event) => { if (event.key === "Enter") saveCodexPathInput(); });
ui.closeCloudAuth.addEventListener("click", closeCloudAuth);
ui.cloudSignup.addEventListener("click", () => authenticateCloud("signup"));
ui.cloudLogin.addEventListener("click", () => authenticateCloud("login"));
ui.cloudAuthBackdrop.addEventListener("click", (event) => { if (event.target === ui.cloudAuthBackdrop) closeCloudAuth(); });
ui.toggleSidebar.addEventListener("click", () => {
  sidebarCollapsed = !sidebarCollapsed;
  localStorage.setItem("workbridge.sidebarCollapsed", String(sidebarCollapsed));
  applySidebar();
});
ui.settingsBackdrop.addEventListener("click", (event) => { if (event.target === ui.settingsBackdrop) closeSettings(); });
window.workBridge.onOpenSettings(openSettings);

ui.nav[1].addEventListener("contextmenu", (event) => { event.preventDefault(); importBundle(); });

window.workBridge.getState().then((state) => {
  imports = state.imports;
  preferences = state.preferences || preferences;
  detectedCodexPath = state.detectedCodexPath || null;
  cloudState = state.cloud || cloudState;
  applyTheme(preferences.theme);
  refreshLanguage();
  if (imports.length) {
    updateImportBadge();
  }
  updateCloudBadge();
}).catch((error) => showToast(error.message));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !ui.settingsBackdrop.hidden) closeSettings();
  if (event.key === "Escape" && !ui.cloudAuthBackdrop.hidden) closeCloudAuth();
  if (event.key === "Escape" && !ui.deleteBackdrop.hidden) closeDeleteConfirmation();
  if (event.key === "Escape" && !ui.codexPathBackdrop.hidden) closeCodexPathInput();
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "o") {
    event.preventDefault();
    importBundle();
  }
});

applyTheme(preferences.theme);
applySidebar();
