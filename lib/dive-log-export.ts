import jsPDF from "jspdf";
import {
  convertDepth,
  convertTemperature,
  depthUnit,
  temperatureUnit,
  type PublicDive,
  type UnitSystem,
} from "./firestore/dive-log";

const SEA_SABA_BLUE: [number, number, number] = [23, 28, 143];
const LIGHT_GRAY: [number, number, number] = [247, 248, 250];
const DARK_TEXT: [number, number, number] = [33, 37, 41];
const MUTED_TEXT: [number, number, number] = [108, 117, 125];
const CARD_BORDER_GRAY: [number, number, number] = [209, 213, 219];
const BORDER_GRAY: [number, number, number] = [220, 220, 225];

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const CARD_GAP = 14;
const FOOTER_HEIGHT = 40;
const HEADER_HEIGHT = 64;
const LOGO_URL = "/images/Full%20color%20SEA%20SABA%20logo%20transparent.png";
const LOGO_NATURAL_WIDTH = 675;
const LOGO_NATURAL_HEIGHT = 150;

function logoDimensions(desiredWidth: number): { width: number; height: number } {
  return {
    width: desiredWidth,
    height: Math.round((desiredWidth * LOGO_NATURAL_HEIGHT) / LOGO_NATURAL_WIDTH),
  };
}

interface DiveLogStats {
  averageDepth: string;
  deepestDepth: string;
  averageTemperature: string;
  mostVisitedSite: string | null;
}

function formatPdfDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDiveSlot(slot: string): string {
  const match = slot.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!match) return slot;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2] || "0", 10);
  const meridian = match[3].toUpperCase();
  if (meridian === "PM" && hours !== 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;
  const formattedHours = hours === 0 || hours === 12 ? 12 : hours % 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");
  return `${formattedHours}:${formattedMinutes} ${meridian}`;
}

class DiveLogPdfBuilder {
  private doc: jsPDF;
  private unitSystem: UnitSystem;
  private dives: PublicDive[];
  private logoData: string | null = null;
  private currentY = 0;

  constructor(dives: PublicDive[], unitSystem: UnitSystem) {
    this.doc = new jsPDF("p", "pt", "letter");
    this.dives = dives;
    this.unitSystem = unitSystem;
  }

  async loadLogo(): Promise<void> {
    try {
      const response = await fetch(LOGO_URL);
      if (!response.ok) throw new Error("Logo not found");
      const blob = await response.blob();
      this.logoData = await this.blobToBase64(blob);
    } catch {
      this.logoData = null;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  build(): void {
    this.addTitlePage();
    this.addSummaryBox();
    this.addDiveCards();
    this.addFooters();
    this.save();
  }

  private addTitlePage(): void {
    this.currentY = MARGIN + 10;

    const titleBlockX = MARGIN;
    const titleBlockY = this.currentY;
    const titleLogo = logoDimensions(130);
    const logoX = PAGE_WIDTH - MARGIN - titleLogo.width;

    if (this.logoData) {
      this.doc.addImage(this.logoData, "PNG", logoX, titleBlockY, titleLogo.width, titleLogo.height);
    }

    const today = new Date();
    const exportDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    this.doc.setFontSize(14);
    this.doc.setTextColor(...DARK_TEXT);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Personal Dive Log", titleBlockX, titleBlockY + 18);

    this.currentY = titleBlockY + 38;

    this.doc.setFontSize(10);
    this.doc.setTextColor(...MUTED_TEXT);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(`Export Date: ${exportDate}`, titleBlockX, this.currentY);
    this.currentY += 15;
    this.doc.text(`Number of dives: ${this.dives.length}`, titleBlockX, this.currentY);
    this.currentY += 15;
    this.doc.text(
      `Units: ${this.unitSystem === "metric" ? "Metric" : "Imperial"}`,
      titleBlockX,
      this.currentY
    );

    this.currentY = Math.max(this.currentY + 24, titleBlockY + titleLogo.height + 10);

    this.doc.setDrawColor(...SEA_SABA_BLUE);
    this.doc.setLineWidth(1);
    this.doc.line(MARGIN, this.currentY, PAGE_WIDTH - MARGIN, this.currentY);

    this.currentY += 22;
  }

  private addSummaryBox(): void {
    if (this.dives.length === 0) return;

    const stats = this.calculateStats();
    const boxHeight = 88;

    this.checkPageBreak(boxHeight);
    this.drawRoundedRect(MARGIN, this.currentY, PAGE_WIDTH - 2 * MARGIN, boxHeight, 8, LIGHT_GRAY);

    this.doc.setFontSize(14);
    this.doc.setTextColor(...SEA_SABA_BLUE);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Summary", MARGIN + 14, this.currentY + 20);

    this.doc.setFontSize(9);
    this.doc.setTextColor(...DARK_TEXT);
    this.doc.setFont("helvetica", "normal");

    const leftColumn = [
      `${this.dives.length} dive${this.dives.length !== 1 ? "s" : ""}`,
      `Average depth: ${stats.averageDepth}`,
      `Deepest dive: ${stats.deepestDepth}`,
    ];
    const rightColumn = [`Average water temperature: ${stats.averageTemperature}`];
    if (stats.mostVisitedSite) {
      rightColumn.push(`Most visited site: ${stats.mostVisitedSite}`);
    }

    let y = this.currentY + 40;
    for (const line of leftColumn) {
      this.doc.text(line, MARGIN + 14, y);
      y += 14;
    }

    y = this.currentY + 40;
    const rightX = MARGIN + (PAGE_WIDTH - 2 * MARGIN) / 2 + 8;
    for (const line of rightColumn) {
      this.doc.text(line, rightX, y);
      y += 14;
    }

    this.currentY += boxHeight + CARD_GAP;
  }

  private addDiveCards(): void {
    for (const dive of this.dives) {
      this.addDiveCard(dive);
    }
  }

  private addDiveCard(dive: PublicDive): void {
    const cardWidth = PAGE_WIDTH - 2 * MARGIN;
    const cardHeight = this.calculateCardHeight(dive);

    this.checkPageBreak(cardHeight);
    this.drawRoundedRect(
      MARGIN,
      this.currentY,
      cardWidth,
      cardHeight,
      11,
      [255, 255, 255],
      CARD_BORDER_GRAY,
      1.2
    );

    let y = this.currentY + 24;

    this.doc.setFontSize(9);
    this.doc.setTextColor(...MUTED_TEXT);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      `${formatPdfDate(dive.date)}  •  ${dive.diveSlot ? formatDiveSlot(dive.diveSlot) : "—"}`,
      MARGIN + 18,
      y
    );

    y += 18;

    this.doc.setFontSize(19);
    this.doc.setTextColor(...SEA_SABA_BLUE);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(dive.diveSite || "—", MARGIN + 18, y);

    y += 24;

    this.doc.setFontSize(9);
    this.doc.setTextColor(...MUTED_TEXT);
    this.doc.setFont("helvetica", "normal");

    const metadata = [
      { label: "Boat", value: dive.boat || "Not recorded" },
      { label: "Guide(s)", value: dive.diveGuide || "Not recorded" },
      {
        label: "Max Depth",
        value:
          dive.maxDepth !== undefined
            ? `${convertDepth(dive.maxDepth, this.unitSystem)} ${depthUnit(this.unitSystem)}`
            : "—",
      },
      {
        label: "Water Temp",
        value:
          dive.waterTemperature !== undefined
            ? `${convertTemperature(dive.waterTemperature, this.unitSystem)}${temperatureUnit(
                this.unitSystem
              )}`
            : "—",
      },
    ];

    const col1X = MARGIN + 18;
    const col2X = MARGIN + 18 + cardWidth / 2;
    const labelOffset = 60;
    for (let i = 0; i < metadata.length; i += 2) {
      const rowItems = metadata.slice(i, i + 2);
      for (let j = 0; j < rowItems.length; j++) {
        const item = rowItems[j];
        const x = j === 0 ? col1X : col2X;
        this.doc.text(`${item.label}:`, x, y);
        this.doc.setTextColor(...DARK_TEXT);
        this.doc.setFont("helvetica", "bold");
        this.doc.text(item.value, x + labelOffset, y);
        this.doc.setTextColor(...MUTED_TEXT);
        this.doc.setFont("helvetica", "normal");
      }
      y += 15;
    }

    y += 10;

    this.doc.setFontSize(11);
    this.doc.setTextColor(...SEA_SABA_BLUE);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Sightings", col1X, y);

    y += 15;

    const sortedSightings = [...dive.sightings].sort((a, b) =>
      a.speciesName.localeCompare(b.speciesName)
    );

    if (sortedSightings.length === 0) {
      this.doc.setFontSize(9);
      this.doc.setTextColor(...MUTED_TEXT);
      this.doc.setFont("helvetica", "italic");
      this.doc.text("No sightings recorded.", col1X, y);
    } else {
      this.doc.setFontSize(9);
      this.doc.setTextColor(...DARK_TEXT);
      this.doc.setFont("helvetica", "normal");

      const useTwoColumns = sortedSightings.length > 5;
      const itemWidth = useTwoColumns ? (cardWidth - 32) / 2 : cardWidth - 32;
      for (let i = 0; i < sortedSightings.length; i++) {
        const s = sortedSightings[i];
        const countText = s.count === undefined || s.count === null ? "seen" : `×${s.count}`;
        const row = useTwoColumns ? Math.floor(i / 2) : i;
        const col = useTwoColumns ? i % 2 : 0;
        const itemX = col1X + col * (itemWidth + 16);
        const itemY = y + row * 12;
        this.doc.text(`• ${s.speciesName} ${countText}`, itemX, itemY);
      }
    }

    this.currentY += cardHeight + CARD_GAP;
  }

  private calculateCardHeight(dive: PublicDive): number {
    const baseHeight = 124;
    const sortedSightings = [...dive.sightings].sort((a, b) =>
      a.speciesName.localeCompare(b.speciesName)
    );
    const useTwoColumns = sortedSightings.length > 5;
    const rows = useTwoColumns
      ? Math.ceil(Math.max(sortedSightings.length, 1) / 2)
      : Math.max(sortedSightings.length, 1);
    const sightingsHeight = rows * 12 + 28;
    return baseHeight + sightingsHeight;
  }

  private checkPageBreak(requiredHeight: number): void {
    if (this.currentY + requiredHeight > PAGE_HEIGHT - FOOTER_HEIGHT) {
      this.doc.addPage();
      this.currentY = MARGIN + HEADER_HEIGHT;
      this.addPageHeader();
    }
  }

  private addPageHeader(): void {
    const headerLogo = logoDimensions(70);
    if (this.logoData) {
      this.doc.addImage(this.logoData, "PNG", MARGIN, MARGIN - 32, headerLogo.width, headerLogo.height);
    }

    const today = new Date();
    const exportDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const rightX = PAGE_WIDTH - MARGIN;
    const baseY = MARGIN - 32;

    this.doc.setFontSize(11);
    this.doc.setTextColor(...SEA_SABA_BLUE);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Dive Log Summary", rightX, baseY + 12, { align: "right" });

    this.doc.setFontSize(9);
    this.doc.setTextColor(...MUTED_TEXT);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(`Export Date: ${exportDate}`, rightX, baseY + 26, { align: "right" });

    this.doc.setDrawColor(...SEA_SABA_BLUE);
    this.doc.setLineWidth(0.75);
    this.doc.line(MARGIN, MARGIN + 2, PAGE_WIDTH - MARGIN, MARGIN + 2);
  }

  private addFooters(): void {
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(9);
      this.doc.setTextColor(150, 150, 150);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(`Page ${i} of ${totalPages}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 24, {
        align: "right",
      });
    }
  }

  private save(): void {
    const filename = `sea-saba-dive-log-${new Date().toISOString().split("T")[0]}.pdf`;
    this.doc.save(filename);
  }

  private calculateStats(): DiveLogStats {
    const convertedDepths = this.dives
      .map((d) => (d.maxDepth !== undefined ? convertDepth(d.maxDepth, this.unitSystem) : undefined))
      .filter((d): d is number => d !== undefined);

    const convertedTemps = this.dives
      .map((d) =>
        d.waterTemperature !== undefined
          ? convertTemperature(d.waterTemperature, this.unitSystem)
          : undefined
      )
      .filter((t): t is number => t !== undefined);

    const averageDepth = convertedDepths.length
      ? `${Math.round(convertedDepths.reduce((a, b) => a + b, 0) / convertedDepths.length)} ${depthUnit(
          this.unitSystem
        )}`
      : "—";

    const deepestDepth = convertedDepths.length
      ? `${Math.max(...convertedDepths)} ${depthUnit(this.unitSystem)}`
      : "—";

    const averageTemperature = convertedTemps.length
      ? `${Math.round(convertedTemps.reduce((a, b) => a + b, 0) / convertedTemps.length)}${temperatureUnit(
          this.unitSystem
        )}`
      : "—";

    const siteCounts = new Map<string, number>();
    for (const d of this.dives) {
      siteCounts.set(d.diveSite, (siteCounts.get(d.diveSite) ?? 0) + 1);
    }

    const sortedSites = Array.from(siteCounts.entries()).sort((a, b) => b[1] - a[1]);
    const mostVisitedSite =
      sortedSites.length >= 2 && sortedSites[0][1] > sortedSites[1][1]
        ? sortedSites[0][0]
        : sortedSites.length === 1
          ? sortedSites[0][0]
          : null;

    return { averageDepth, deepestDepth, averageTemperature, mostVisitedSite };
  }

  private drawRoundedRect(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fillColor: [number, number, number],
    borderColor: [number, number, number] = BORDER_GRAY,
    lineWidth: number = 0.5
  ): void {
    this.doc.setFillColor(...fillColor);
    this.doc.setDrawColor(...borderColor);
    this.doc.setLineWidth(lineWidth);
    this.doc.roundedRect(x, y, w, h, r, r, "FD");
  }
}

export async function exportDiveLogToPdf(
  selectedDives: PublicDive[],
  unitSystem: UnitSystem
): Promise<void> {
  if (selectedDives.length === 0) return;
  const builder = new DiveLogPdfBuilder(selectedDives, unitSystem);
  await builder.loadLogo();
  builder.build();
}
