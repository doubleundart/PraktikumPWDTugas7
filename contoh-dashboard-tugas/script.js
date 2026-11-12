"use strict";
// Kunci penyimpanan data untuk proyek praktikum ini.
const STORAGE_KEY = "praktikum-vercel-tugas-v1";
const exampleTasks = [
  { id: "contoh-1", title: "Membuat struktur HTML", course: "Pemrograman Web Dasar", due: "", done: true },
  { id: "contoh-2", title: "Mengatur tampilan responsif", course: "Pemrograman Web Dasar", due: "", done: false },
  { id: "contoh-3", title: "Deployment ke Vercel", course: "Pemrograman Web Dasar", due: "", done: false }
];
// Ambil data tersimpan; bila belum ada, gunakan contoh tugas.
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [...exampleTasks];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [...exampleTasks];
  } catch (error) {
    console.warn("Data tidak dapat dibaca:", error);
    return [...exampleTasks];
  }
}
let tasks = loadTasks();
const form = document.querySelector("#task-form");
const list = document.querySelector("#task-list");
const filter = document.querySelector("#status-filter");
const feedback = document.querySelector("#form-feedback");
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    feedback.textContent = "Penyimpanan browser tidak tersedia; data aktif hanya selama halaman terbuka.";
    console.warn("Penyimpanan gagal:", error);
  }
}
function createTaskNode(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.done ? " is-done" : ""}`;
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = Boolean(task.done);
  checkbox.setAttribute("aria-label", `Tandai selesai: ${task.title}`);
  checkbox.addEventListener("change", () => toggleTask(task.id));
  const detail = document.createElement("div");
  detail.className = "task-detail";
  const name = document.createElement("span");
  name.className = "task-name";
  name.textContent = task.title; // textContent mencegah HTML dari input dieksekusi.
  const meta = document.createElement("span");
  meta.className = "task-meta";
  meta.textContent = `${task.course}${task.due ? ` · Tenggat: ${task.due}` : ""}`;
  detail.append(name, meta);
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete-btn";
  remove.textContent = "Hapus";
  remove.setAttribute("aria-label", `Hapus tugas ${task.title}`);
  remove.addEventListener("click", () => removeTask(task.id));
  item.append(checkbox, detail, remove);
  return item;
}
function renderTasks() {
  list.replaceChildren();
  const mode = filter.value;
  const visible = tasks.filter(task =>
    mode === "semua" || (mode === "selesai" && task.done) || (mode === "aktif" && !task.done)
  );
  visible.forEach(task => list.appendChild(createTaskNode(task)));
  document.querySelector("#empty-message").hidden = visible.length > 0;
  const done = tasks.filter(task => task.done).length;
  const pending = tasks.length - done;
  const progress = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  document.querySelector("#total-count").textContent = tasks.length;
  document.querySelector("#pending-count").textContent = pending;
  document.querySelector("#done-count").textContent = done;
  document.querySelector("#progress-text").textContent = `${progress}%`;
  document.querySelector("#progress-fill").style.width = `${progress}%`;
  document.querySelector("#progress-bar").setAttribute("aria-valuenow", String(progress));
}
function toggleTask(id) {
  tasks = tasks.map(task => task.id === id ? { ...task, done: !task.done } : task);
  saveTasks();
  renderTasks();
}
function removeTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}
form.addEventListener("submit", event => {
  event.preventDefault(); // Mencegah reload halaman saat formulir dikirim.
  const title = document.querySelector("#task-name").value.trim();
  const course = document.querySelector("#task-course").value;
  const due = document.querySelector("#task-date").value;
  if (!title) {
    feedback.textContent = "Nama tugas wajib diisi.";
    return;
  }
  const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  tasks.unshift({ id, title, course, due, done: false });
  saveTasks();
  filter.value = "semua";
  renderTasks();
  form.reset();
  feedback.textContent = `Tugas “${title}” berhasil ditambahkan.`;
});
filter.addEventListener("change", renderTasks);
renderTasks(); // Render awal saat halaman selesai dimuat.
