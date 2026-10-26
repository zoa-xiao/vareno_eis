"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Activity, ArrowRight, BarChart3, Boxes, CalendarDays, ChevronDown, CirclePlus, Download, Factory, Filter, Layers, Package, Plus, Search, ShoppingBag, ShoppingCart, SlidersHorizontal, Users, WalletCards, X, type LucideIcon } from "lucide-react";
import type { ModuleDefinition, ModuleRecord } from "@/lib/erp-data";

const moduleStories: Record<string, { title: string; description: string }> = {
  products: { title: "Koleksi yang siap masuk ritme produksi.", description: "Spesifikasi, komposisi, dan harga produk berada dalam satu alur." },
  purchases: { title: "Pengadaan bergerak dari rencana ke penerimaan.", description: "Pantau permintaan, pemasok, dan pesanan tanpa kehilangan konteks." },
  inventory: { title: "Persediaan terjaga, kebutuhan lebih terbaca.", description: "Pergerakan bahan dan barang tersusun dalam satu pandangan." },
  production: { title: "Rencana kerja bertemu hasil yang terukur.", description: "Setiap perintah produksi memiliki progres yang mudah dipantau." },
  sales: { title: "Pesanan pelanggan terus bergerak.", description: "Hubungkan transaksi, ketersediaan produk, dan pelunasan." },
  finance: { title: "Arus keuangan lebih jelas untuk mengambil keputusan.", description: "Baca posisi pembayaran dan pergerakan kas dari satu ruang." },
  reports: { title: "Data operasional menjadi arah yang mudah dibaca.", description: "Ringkas kinerja tim dan bisnis dalam tampilan yang terhubung." },
  users: { title: "Kolaborasi tim dengan akses yang tertata.", description: "Atur peran dan tanggung jawab setiap anggota dengan jelas." },
  activity: { title: "Jejak aktivitas tersimpan dalam satu linimasa.", description: "Ikuti perubahan penting dan tindak lanjut di seluruh proses." },
};

const moduleIcons: Record<string, LucideIcon> = {
  products: Package, purchases: ShoppingCart, inventory: Boxes, production: Factory,
  sales: ShoppingBag, finance: WalletCards, reports: BarChart3, users: Users, activity: Activity,
};

const moduleFlows: Record<string, [string, string, string]> = {
  products: ["Rancang", "Komposisi", "Aktifkan"],
  purchases: ["Ajukan", "Pesan", "Terima"],
  inventory: ["Masuk", "Pindah", "Keluar"],
  production: ["Siapkan", "Jahit", "Periksa"],
  sales: ["Pilih", "Pesan", "Bayar"],
  finance: ["Catat", "Cocokkan", "Laporkan"],
  reports: ["Kumpulkan", "Baca", "Tindak"],
  users: ["Undang", "Atur", "Kolaborasi"],
  activity: ["Catat", "Tinjau", "Selesaikan"],
};

function ModuleIllustration({ moduleKey }: { moduleKey: string }) {
  switch (moduleKey) {
    case "products":
      return (
        <svg className="scene-art scene-products" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="184" cy="76" r="66" fill="#E5DCFF" /><circle cx="184" cy="76" r="54" stroke="#BBAAF1" strokeDasharray="3 7" />
          <path d="M166 26C166 18 179 18 179 26L208 40L232 54L221 73L209 67L206 119H154L151 67L139 73L128 54L152 40L166 26Z" fill="#FFF" stroke="#9B83E8" strokeWidth="2" strokeLinejoin="round" className="products-garment" />
          <path d="M166 29L180 44L194 29M180 44V111M156 72L166 67M205 67L215 72" stroke="#C5B8EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="181" cy="58" r="2" fill="#8D72D6" /><circle cx="181" cy="70" r="2" fill="#8D72D6" /><circle cx="181" cy="82" r="2" fill="#8D72D6" />
          <path d="M62 59L87 43L111 59M87 43V53" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <g className="products-swatch"><rect x="47" y="59" width="78" height="63" rx="12" fill="#B49EEB" /><path d="M57 72C69 62 82 86 94 72C104 62 112 71 117 77" stroke="#EAE3FF" strokeWidth="2" strokeLinecap="round" /><circle cx="75" cy="94" r="3" fill="#34275B" /><circle cx="94" cy="94" r="3" fill="#34275B" /><path d="M77 105Q84 111 92 105" stroke="#34275B" strokeWidth="2" strokeLinecap="round" /><path d="M47 88L38 82M125 88L134 80" stroke="#B49EEB" strokeWidth="5" strokeLinecap="round" /></g>
          <path className="products-spark" d="M228 28V40M222 34H234" stroke="#D59558" strokeWidth="2" strokeLinecap="round" />
          <path d="M36 128H245" stroke="#D9D0F2" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "purchases":
      return (
        <svg className="scene-art scene-purchases" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M44 119H247" stroke="#D7CFF0" strokeWidth="2" strokeLinecap="round" />
          <g className="purchase-receipt"><rect x="62" y="27" width="47" height="67" rx="8" fill="#FFF" stroke="#D9CFF7" strokeWidth="2" /><path d="M73 42H97M73 51H91M73 61H98" stroke="#C1B4E6" strokeWidth="3" strokeLinecap="round" /><path d="M73 75L80 81L94 68" stroke="#62B58F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></g>
          <path d="M42 47L132 47L145 109H55L42 47Z" fill="#8C70DB" /><path d="M42 47L69 28L108 28L132 47" fill="#A993E9" stroke="#7458C8" strokeWidth="2" strokeLinejoin="round" />
          <g className="purchase-box"><path d="M143 59L188 43L234 59V111L188 128L143 111V59Z" fill="#C3A0E7" stroke="#7554BD" strokeWidth="2" strokeLinejoin="round" /><path className="purchase-flap" d="M143 59L188 77L234 59M188 77V127" stroke="#8C64C5" strokeWidth="2" strokeLinejoin="round" /><path d="M172 55L188 61L204 55" stroke="#F2E8FF" strokeWidth="7" strokeLinejoin="round" /><ellipse cx="180" cy="91" rx="3" ry="4" fill="#38265B" /><ellipse cx="197" cy="91" rx="3" ry="4" fill="#38265B" /><path d="M181 103Q188 109 196 102" stroke="#38265B" strokeWidth="2" strokeLinecap="round" /></g>
          <path className="purchase-motion" d="M229 34L237 27M239 44H250" stroke="#D59558" strokeWidth="2" strokeLinecap="round" />
          <circle className="purchase-dot" cx="53" cy="108" r="4" fill="#62B58F" /><circle cx="249" cy="75" r="4" fill="#E0C16F" />
        </svg>
      );
    case "inventory":
      return (
        <svg className="scene-art scene-inventory" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M48 37V119M132 37V119M218 37V119M39 65H229M39 94H229M39 120H229" stroke="#8C74D4" strokeWidth="3" strokeLinecap="round" />
          <g className="inventory-crate crate-one"><rect x="57" y="46" width="59" height="18" rx="5" fill="#B8A5EA" /><path d="M70 47V63M84 47V63M99 47V63" stroke="#D7CCF4" strokeWidth="2" /></g>
          <g className="inventory-crate crate-two"><rect x="148" y="72" width="58" height="21" rx="5" fill="#D1B6E9" /><path d="M161 73V92M177 73V92M191 73V92" stroke="#EFE3FA" strokeWidth="2" /></g>
          <rect x="62" y="99" width="53" height="19" rx="5" fill="#9380D5" /><rect x="147" y="43" width="61" height="21" rx="5" fill="#D5C9F2" />
          <g className="inventory-scanner"><circle cx="232" cy="45" r="24" fill="#FFF" stroke="#A891E7" strokeWidth="3" /><path d="M249 63L263 77" stroke="#7659CB" strokeWidth="7" strokeLinecap="round" /><circle cx="226" cy="43" r="3" fill="#362758" /><circle cx="237" cy="43" r="3" fill="#362758" /><path d="M227 53Q232 58 237 52" stroke="#362758" strokeWidth="2" strokeLinecap="round" /></g>
          <path className="inventory-scanline" d="M213 40H249" stroke="#61B78E" strokeWidth="2" strokeLinecap="round" />
          <path d="M39 28H229" stroke="#D9D0F2" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "production":
      return (
        <svg className="scene-art scene-production" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M38 119H246" stroke="#D7CFF0" strokeWidth="3" strokeLinecap="round" />
          <path d="M73 110V60Q73 38 96 38H167V68H135V91H107V110H73Z" fill="#9C82E4" stroke="#7055C6" strokeWidth="2" strokeLinejoin="round" />
          <path d="M96 39V67H134M135 68V92M75 91H108" stroke="#DCD2FF" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="180" cy="83" r="19" fill="#E8E1FF" stroke="#8165D5" strokeWidth="3" /><g className="production-wheel"><circle cx="180" cy="83" r="7" fill="#A48CE5" /><path d="M180 67V73M196 83H190M180 99V93M164 83H170" stroke="#8165D5" strokeWidth="2.5" strokeLinecap="round" /></g>
          <path className="production-needle" d="M135 67V94L129 104" stroke="#47376D" strokeWidth="3" strokeLinecap="round" /><path d="M132 94H160" stroke="#DBB6CF" strokeWidth="7" strokeLinecap="round" />
          <path className="production-stitch" d="M133 103H158" pathLength="1" stroke="#F7EFFF" strokeWidth="2" strokeDasharray="2 4" />
          <g className="production-motif"><circle cx="219" cy="42" r="19" fill="#FFF" stroke="#E8D7AC" strokeWidth="2" /><path d="M211 42L217 48L228 35" stroke="#62AE89" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></g>
          <path d="M52 39V51M46 45H58" stroke="#D59558" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "sales":
      return (
        <svg className="scene-art scene-sales" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="168" cy="79" r="60" fill="#EDE4FF" /><circle cx="168" cy="79" r="48" stroke="#C8B6F5" strokeDasharray="3 7" />
          <g className="sales-bag"><path d="M111 53H210L202 119H119L111 53Z" fill="#9D83E2" stroke="#6C50C1" strokeWidth="2" strokeLinejoin="round" /><path d="M135 56V44Q135 27 159 27Q184 27 184 44V56" stroke="#6C50C1" strokeWidth="6" strokeLinecap="round" /><path d="M138 82Q146 73 153 82M171 82Q179 73 186 82" stroke="#38265B" strokeWidth="4" strokeLinecap="round" /><path d="M150 98Q162 108 175 97" stroke="#38265B" strokeWidth="3" strokeLinecap="round" /><path d="M141 112L137 120M181 112L185 120" stroke="#6C50C1" strokeWidth="4" strokeLinecap="round" /></g>
          <g className="sales-card"><rect x="47" y="66" width="48" height="34" rx="7" fill="#FFF" stroke="#D8CFF1" strokeWidth="2" /><path d="M49 77H93" stroke="#D0C3EF" strokeWidth="5" /><circle cx="58" cy="88" r="3" fill="#8B71D8" /></g>
          <path className="sales-star" d="M228 38L232 47L242 49L234 55L236 65L228 59L220 65L222 55L214 49L224 47L228 38Z" fill="#E8BF73" />
          <path d="M41 123H239" stroke="#D8D0EB" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "finance":
      return (
        <svg className="scene-art scene-finance" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M47 119H241" stroke="#D7D0EB" strokeWidth="2" strokeLinecap="round" />
          <path d="M57 100L100 83L137 93L193 47L224 58" pathLength="1" stroke="#7A61CE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="finance-trend" />
          <path d="M212 51L224 58L217 69" stroke="#7A61CE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <g className="finance-coin coin-back"><ellipse cx="87" cy="103" rx="22" ry="9" fill="#C5A6E5" /><path d="M65 87V103C65 108 75 112 87 112C99 112 109 108 109 103V87" fill="#D9B5EA" stroke="#8C69CA" strokeWidth="2" /><ellipse cx="87" cy="87" rx="22" ry="9" fill="#E6C9F1" stroke="#8C69CA" strokeWidth="2" /></g>
          <g className="finance-coin coin-front"><ellipse cx="157" cy="107" rx="28" ry="10" fill="#CAAAE8" /><path d="M129 87V107C129 113 141 117 157 117C173 117 185 113 185 107V87" fill="#D8B8EA" stroke="#8665C9" strokeWidth="2" /><ellipse cx="157" cy="87" rx="28" ry="10" fill="#F1D57F" stroke="#B38943" strokeWidth="2" /><path d="M157 80V95M164 84Q160 80 155 82Q149 84 154 88L160 90Q166 92 161 96Q156 99 150 95" stroke="#986D2C" strokeWidth="2" strokeLinecap="round" /></g>
          <circle cx="220" cy="35" r="17" fill="#FFF" stroke="#D4C6F3" strokeWidth="2" /><path d="M214 35L219 40L227 30" stroke="#5DAA82" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path className="finance-spark" d="M53 49V61M47 55H59" stroke="#D59558" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "reports":
      return (
        <svg className="scene-art scene-reports" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="164" cy="75" r="61" fill="#EAE4FF" />
          <g className="report-sheet"><path d="M94 25H180L205 50V121H94V25Z" fill="#FFF" stroke="#BFB0EC" strokeWidth="2" strokeLinejoin="round" /><path d="M180 25V50H205" fill="#F1ECFF" stroke="#BFB0EC" strokeWidth="2" strokeLinejoin="round" /><path d="M108 46H158M108 54H148" stroke="#C9C1DD" strokeWidth="3" strokeLinecap="round" /><path d="M110 99V80" stroke="#967EE0" strokeWidth="8" strokeLinecap="round" className="report-bar bar-one" /><path d="M126 99V66" stroke="#967EE0" strokeWidth="8" strokeLinecap="round" className="report-bar bar-two" /><path d="M142 99V73" stroke="#967EE0" strokeWidth="8" strokeLinecap="round" className="report-bar bar-three" /><path d="M158 99V58" stroke="#967EE0" strokeWidth="8" strokeLinecap="round" className="report-bar bar-four" /><path d="M106 104H177" stroke="#D5CEE7" strokeWidth="2" strokeLinecap="round" /></g>
          <g className="report-lens"><circle cx="205" cy="99" r="21" fill="#FFF" fillOpacity=".8" stroke="#7E63D0" strokeWidth="4" /><path d="M220 115L238 132" stroke="#7E63D0" strokeWidth="7" strokeLinecap="round" /><path d="M195 100L202 106L215 91" stroke="#62AE89" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></g>
          <path className="report-star" d="M65 42L69 50L78 52L71 58L72 67L65 62L57 67L59 58L52 52L61 50L65 42Z" fill="#D6A957" />
          <path d="M50 123H236" stroke="#D7D0EB" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "users":
      return (
        <svg className="scene-art scene-users" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M57 81C76 49 103 46 132 71C156 91 187 89 222 54" stroke="#B7A5EA" strokeWidth="2" strokeDasharray="4 6" className="users-connection" />
          <g className="user-person user-left"><circle cx="76" cy="59" r="21" fill="#F0C7A7" /><path d="M55 61Q53 35 76 36Q98 36 97 59L88 53L85 44L69 48L60 57Z" fill="#534276" /><circle cx="70" cy="61" r="2.5" fill="#392C54" /><circle cx="82" cy="61" r="2.5" fill="#392C54" /><path d="M70 70Q76 75 83 69" stroke="#8E5657" strokeWidth="2" strokeLinecap="round" /><path d="M45 121Q48 89 76 89Q104 89 107 121" fill="#9A83DA" /><path d="M46 98L34 87" stroke="#F0C7A7" strokeWidth="8" strokeLinecap="round" /></g>
          <g className="user-person user-center"><circle cx="145" cy="49" r="24" fill="#D99572" /><path d="M121 50Q119 22 146 22Q172 22 169 50L160 43L155 32L136 37L128 48Z" fill="#3F315A" /><circle cx="138" cy="51" r="2.5" fill="#392C54" /><circle cx="152" cy="51" r="2.5" fill="#392C54" /><path d="M139 61Q145 67 152 60" stroke="#713E3D" strokeWidth="2" strokeLinecap="round" /><path d="M111 121Q113 82 145 82Q177 82 180 121" fill="#7559CB" /><path d="M171 92L185 77" stroke="#D99572" strokeWidth="8" strokeLinecap="round" /></g>
          <g className="user-person user-right"><circle cx="215" cy="61" r="20" fill="#F2D2B6" /><path d="M195 62Q193 37 215 39Q237 38 236 62L229 54L224 47L208 51L200 60Z" fill="#866044" /><circle cx="210" cy="63" r="2.3" fill="#392C54" /><circle cx="221" cy="63" r="2.3" fill="#392C54" /><path d="M210 71Q215 76 222 70" stroke="#9D6558" strokeWidth="2" strokeLinecap="round" /><path d="M190 121Q192 91 215 91Q238 91 241 121" fill="#B28DE2" /><path d="M237 98L249 89" stroke="#F2D2B6" strokeWidth="8" strokeLinecap="round" /></g>
          <circle className="users-spark" cx="145" cy="14" r="4" fill="#E2B966" />
          <path d="M39 126H249" stroke="#D7D0EB" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "activity":
      return (
        <svg className="scene-art scene-activity" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M66 24V121" stroke="#BDADEB" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 7" />
          <g className="activity-clock"><circle cx="66" cy="42" r="28" fill="#9278DD" stroke="#6F52C6" strokeWidth="3" /><path d="M66 25V43L78 50" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="58" cy="58" r="2.5" fill="#38265B" /><circle cx="73" cy="58" r="2.5" fill="#38265B" /><path d="M60 67Q66 72 72 66" stroke="#38265B" strokeWidth="2" strokeLinecap="round" /></g>
          <g className="activity-event event-one"><circle cx="66" cy="91" r="7" fill="#FFF" stroke="#62B18C" strokeWidth="3" /><rect x="91" y="80" width="116" height="23" rx="8" fill="#FFF" stroke="#E1DCF0" /><circle cx="104" cy="91" r="4" fill="#62B18C" /><path d="M116 89H188M116 95H169" stroke="#C9C2DB" strokeWidth="2" strokeLinecap="round" /></g>
          <g className="activity-event event-two"><circle cx="66" cy="122" r="7" fill="#FFF" stroke="#A18AE4" strokeWidth="3" /><rect x="91" y="110" width="144" height="23" rx="8" fill="#FFF" stroke="#E1DCF0" /><circle cx="104" cy="121" r="4" fill="#A18AE4" /><path d="M116 119H216M116 125H188" stroke="#C9C2DB" strokeWidth="2" strokeLinecap="round" /></g>
          <path className="activity-spark" d="M225 34V48M218 41H232" stroke="#E0AF58" strokeWidth="2" strokeLinecap="round" />
          <circle className="activity-live" cx="239" cy="63" r="5" fill="#62B18C" />
        </svg>
      );
    default:
      return (
        <svg className="scene-art scene-default" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="153" cy="72" r="57" fill="#E7DFFF" /><path d="M59 111C83 46 127 114 159 68C181 37 207 47 227 29" stroke="#8D72DC" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 7" className="default-flow" /><circle cx="62" cy="110" r="9" fill="#FFF" stroke="#A38CE6" strokeWidth="3" /><circle cx="227" cy="29" r="9" fill="#FFF" stroke="#A38CE6" strokeWidth="3" /><path d="M119 49H187V96H119Z" fill="#FFF" stroke="#A38CE6" strokeWidth="2" /><path d="M132 63H173M132 73H164M132 83H178" stroke="#C5B9E8" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
  }
}

function ModuleVisual({ moduleKey }: { moduleKey: string }) {
  const story = moduleStories[moduleKey] ?? { title: "Semua proses bisnis saling terhubung.", description: "Pantau pekerjaan tim dalam satu ruang kerja yang rapi." };
  const Icon = moduleIcons[moduleKey] ?? Layers;
  const flow = moduleFlows[moduleKey] ?? ["Catat", "Proses", "Pantau"];

  return (
    <section className={`module-visual module-visual-${moduleKey}`} aria-label="Ringkasan alur modul">
      <div className="module-visual-copy">
        <span className="module-visual-kicker"><i /> ALUR KERJA TERHUBUNG</span>
        <h2>{story.title}</h2>
        <p>{story.description}</p>
        <div className="module-flow-steps"><span><b>01</b> {flow[0]}</span><i /><span><b>02</b> {flow[1]}</span><i /><span><b>03</b> {flow[2]}</span></div>
      </div>
      <div className="module-visual-art" aria-hidden="true">
        <ModuleIllustration moduleKey={moduleKey} />
        <div className="module-visual-badge"><span /><div><small>STATUS</small><strong>Terpantau</strong></div><Icon size={15} /></div>
      </div>
    </section>
  );
}

function statusClass(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("selesai") || normalized.includes("aktif") || normalized.includes("lunas") || normalized.includes("aman") || normalized.includes("terverifikasi")) return "status-success";
  if (normalized.includes("menunggu") || normalized.includes("rendah") || normalized.includes("belum") || normalized.includes("perlu")) return "status-pending";
  if (normalized.includes("proses") || normalized.includes("dipesan") || normalized.includes("diproses")) return "status-progress";
  return "status-neutral";
}

export function ModuleView({ moduleKey, definition }: { moduleKey: string; definition: ModuleDefinition }) {
  const [rows, setRows] = useState(definition.rows);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState<ModuleRecord | null>(null);
  const [toast, setToast] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});

  const filteredRows = useMemo(() => rows.filter((row) => Object.values(row).some((value) => value.toLowerCase().includes(query.toLowerCase()))), [rows, query]);
  const fields = definition.columns.slice(0, Math.min(3, definition.columns.length));

  function addRow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newRecord: ModuleRecord = {};
    definition.columns.forEach((column, index) => { newRecord[column] = values[`field-${index}`]?.trim() || "—"; });
    if (definition.columns.includes("Status")) newRecord.Status = "Draft";
    setRows((current) => [newRecord, ...current]);
    setValues({});
    setModalOpen(false);
    setToast("Item ditambahkan ke pratinjau ini.");
    window.setTimeout(() => setToast(""), 2600);
  }

  function exportCsv() {
    const csv = [definition.columns.join(","), ...filteredRows.map((row) => definition.columns.map((column) => `"${row[column] ?? ""}"`).join(","))].join("\n");
    const href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `${moduleKey}-vareno.csv`;
    anchor.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="module-page">
      <div className="page-heading module-heading">
        <div><div className="eyebrow-row"><span className="eyebrow">{definition.eyebrow}</span><span className="sample-pill">DATA CONTOH</span></div><h1>{definition.title}</h1><p>{definition.description}</p></div>
        <div className="heading-actions"><button className="secondary-button date-button"><CalendarDays size={16} />Oktober 2026<ChevronDown size={15} /></button><button className="primary-button" onClick={() => setModalOpen(true)}><Plus size={17} />{definition.action}</button></div>
      </div>
      <ModuleVisual moduleKey={moduleKey} />
      <section className="module-metrics">{definition.metrics.map((metric, index) => <article className="module-metric-card" key={metric.label}><span className={`module-metric-mark mark-${index}`} /> <div><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.note}</small></div></article>)}</section>
      <section className="panel module-table-panel">
        <div className="module-toolbar"><div><div className="panel-title">Daftar {definition.title.toLowerCase()}</div><div className="panel-subtitle">{filteredRows.length} data ditampilkan</div></div><div className="table-tools"><label className="table-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari data..." aria-label="Cari data" />{query && <button aria-label="Hapus pencarian" onClick={() => setQuery("")}><X size={14} /></button>}</label><button className="secondary-button tool-button" onClick={() => setToast("Filter lanjutan akan mengikuti periode dan hak akses Anda.")}><Filter size={15} /><span>Filter</span></button><button className="secondary-button tool-button export-button" onClick={exportCsv}><Download size={15} /><span>Ekspor</span></button></div></div>
        <div className="table-scroll"><table className="data-table module-table"><thead><tr>{definition.columns.map((column) => <th key={column}>{column}</th>)}<th aria-label="Aksi" /></tr></thead><tbody>{filteredRows.length ? filteredRows.map((row, index) => <tr key={`${moduleKey}-${index}`} onClick={() => setDetail(row)} className="clickable-row">{definition.columns.map((column, cellIndex) => <td key={column} className={cellIndex === 0 ? "module-primary-cell" : ""}>{column.toLowerCase().includes("status") || ["kondisi", "pembayaran"].includes(column.toLowerCase()) ? <span className={`status-pill ${statusClass(row[column] ?? "")}`}><i />{row[column] ?? "—"}</span> : row[column] ?? "—"}</td>)}<td><button className="row-open-button" aria-label={`Lihat ${row[definition.columns[0]]}`}><ArrowRight size={15} /></button></td></tr>) : <tr><td colSpan={definition.columns.length + 1}><div className="empty-state">Tidak ada data yang cocok. Coba ubah kata pencarian.</div></td></tr>}</tbody></table></div>
        <div className="table-footer"><span>Menampilkan <strong>{filteredRows.length}</strong> dari <strong>{rows.length}</strong> data</span><div className="pagination"><button disabled aria-label="Halaman sebelumnya">‹</button><button className="page-current">1</button><button onClick={() => setToast("Semua data contoh sudah ditampilkan.")}>2</button><button aria-label="Halaman berikutnya" onClick={() => setToast("Semua data contoh sudah ditampilkan.")}>›</button></div></div>
      </section>
      <div className="module-footnote"><span className="module-footnote-icon"><SlidersHorizontal size={15} /></span><span>Data terhubung antarbagian untuk menjaga konsistensi transaksi dan persediaan.</span><button onClick={() => setToast("Panduan modul tersedia di Pusat bantuan.")}>Pelajari alur kerja <ArrowRight size={14} /></button></div>

      {modalOpen && <div className="modal-backdrop" role="presentation" onClick={() => setModalOpen(false)}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">VARENO ERP</span><h2 id="modal-title">{definition.action}</h2></div><button className="icon-button" onClick={() => setModalOpen(false)} aria-label="Tutup dialog"><X size={19} /></button></div><p className="modal-description">Isi informasi awal untuk menambahkan item ke daftar pratinjau.</p><form onSubmit={addRow}><div className="form-grid">{fields.map((field, index) => <label key={field} className="form-field"><span>{field}</span><input autoFocus={index === 0} required={index === 0} placeholder={`Masukkan ${field.toLowerCase()}`} value={values[`field-${index}`] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [`field-${index}`]: event.target.value }))} /></label>)}</div><div className="modal-hint"><CirclePlus size={15} />Perubahan ini tersimpan pada pratinjau antarmuka.</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Batal</button><button type="submit" className="primary-button">Simpan pratinjau</button></div></form></section></div>}
      {detail && <div className="modal-backdrop" role="presentation" onClick={() => setDetail(null)}><section className="modal-card detail-card" role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">RINCIAN DATA</span><h2 id="detail-title">{detail[definition.columns[0]]}</h2></div><button className="icon-button" onClick={() => setDetail(null)} aria-label="Tutup rincian"><X size={19} /></button></div><div className="detail-list">{definition.columns.map((column) => <div key={column}><span>{column}</span><strong>{detail[column] || "—"}</strong></div>)}</div><div className="modal-actions"><button className="secondary-button" onClick={() => setDetail(null)}>Tutup</button><button className="primary-button" onClick={() => { setDetail(null); setToast("Rincian berhasil dibuka."); }}>Selesai <ArrowRight size={15} /></button></div></section></div>}
      {toast && <div className="toast-message" role="status">{toast}<button onClick={() => setToast("")} aria-label="Tutup">×</button></div>}
    </div>
  );
}
