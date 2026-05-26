/** その日が属する週（月曜〜日曜）の開始・終了日を YYYY-MM-DD で返す。 */
export function weekRange(base: Date = new Date()): { start: string; end: string } {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=日 ... 6=土
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: fmt(monday), end: fmt(sunday) };
}

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
