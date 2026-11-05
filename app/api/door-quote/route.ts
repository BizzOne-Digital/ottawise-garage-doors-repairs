import { describeConfig, type DoorConfig } from "@/lib/doorCatalog";
import { sendNotification } from "@/lib/mailer";
import { DoorQuote } from "@/lib/models";
import { handlePublicSubmit } from "@/lib/publicSubmit";
import { doorQuoteSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Saves the configurator request first (the lead is never lost), then emails the business.
 * An email failure is recorded on the record and shown in the admin, but does not fail the submission.
 */
export function POST(req: Request) {
  return handlePublicSubmit(req, "door-quote", doorQuoteSchema, async (d) => {
    const config = d.config as DoorConfig;
    const summary = describeConfig(config);
    const doc = await DoorQuote.create({ ...d, config, summary, service: "New Garage Door (Configurator)", status: "New" });
    const emailStatus = await sendNotification({
      subject: `New garage door quote request: ${d.name}`,
      replyTo: d.email,
      rows: [
        ["Name", d.name], ["Email", d.email], ["Phone", d.phone], ["Area", d.area], ["Door size", d.doorSize],
        ["Door style", summary.style], ["Colour", summary.colour], ["Windows", summary.windows], ["Glass", summary.glass],
        ["Message", d.message || "-"],
        ["Received", new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", dateStyle: "medium", timeStyle: "short" }).format(new Date()) + " (Ottawa time)"],
      ],
    });
    await DoorQuote.updateOne({ _id: doc._id }, { $set: { emailStatus } });
  });
}
