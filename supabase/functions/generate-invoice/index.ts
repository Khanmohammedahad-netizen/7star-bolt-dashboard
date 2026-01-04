// Enable Supabase Edge Runtime types
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import PDFDocument from "https://esm.sh/pdfkit@0.15.0";

serve(async (req) => {
  try {
    /* ───────────── AUTH GUARD ───────────── */
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    /* ───────────── REQUEST BODY ───────────── */
    const { event, materials } = await req.json();

    if (!event) {
      return new Response("Invalid payload", { status: 400 });
    }

    /* ───────────── TAX LOGIC ───────────── */
    const TAX_RATE =
      event.region === "UAE"
        ? 0.05   // 5% VAT UAE
        : event.region === "SAUDI"
        ? 0.15   // 15% VAT Saudi
        : 0;

    const materialTotal = materials.reduce(
      (sum: number, m: { cost: number }) => sum + m.cost,
      0
    );

    const taxAmount = materialTotal * TAX_RATE;
    const grandTotal = materialTotal + taxAmount;

    /* ───────────── PDF GENERATION ───────────── */
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Uint8Array[] = [];

    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => {});

    // Header
    doc.fontSize(20).text("INVOICE", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Event: ${event.name}`);
    doc.text(`Client: ${event.client}`);
    doc.text(`Region: ${event.region}`);
    doc.text(`Date: ${new Date(event.date).toDateString()}`);
    doc.moveDown();

    // Materials
    doc.fontSize(14).text("Materials");
    doc.moveDown(0.5);

    materials.forEach((m: { name: string; cost: number }) => {
      doc
        .fontSize(11)
        .text(`${m.name}`, { continued: true })
        .text(`₹ ${m.cost.toLocaleString()}`, { align: "right" });
    });

    doc.moveDown();

    // Totals
    doc.fontSize(12).text(`Subtotal: ₹ ${materialTotal.toLocaleString()}`);
    doc.text(
      `VAT (${TAX_RATE * 100}%): ₹ ${taxAmount.toLocaleString()}`
    );
    doc.fontSize(14).text(
      `Grand Total: ₹ ${grandTotal.toLocaleString()}`,
      { underline: true }
    );

    doc.moveDown();

    // Footer
    doc
      .fontSize(10)
      .text(
        "This is a system-generated invoice. No signature required.",
        { align: "center" }
      );

    doc.end();

    const pdfBytes = new Uint8Array(
      await new Promise<ArrayBuffer>((resolve) => {
        doc.on("end", () => {
          resolve(
            new Blob(chunks, { type: "application/pdf" }).arrayBuffer()
          );
        });
      })
    );

    /* ───────────── RESPONSE ───────────── */
    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Invoice-${event.name}.pdf`,
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
