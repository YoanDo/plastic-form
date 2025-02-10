import { NextRequest, NextResponse } from "next/server";
import SftpClient from "ssh2-sftp-client";
import { writeFileSync } from "fs";
import { format } from "date-fns";
import path from "path";

// Configuration SFTP
const sftpConfig = {
  host: "sftp.iraiser.eu",
  port: 22,
  username: "surfrider-causeaeffet",
  password: process.env.SFTP_PASS!,
};

export async function POST(req: NextRequest) {
  console.log("📡 API /api/upload appelée avec :", req.method);

  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers });
  }

  try {
    const { firstName, lastName, email, interest } = await req.json();

    if (!firstName || !lastName || !email || !interest) {
      return new NextResponse(JSON.stringify({ error: "Tous les champs sont requis" }), { status: 400, headers });
    }

    console.log("✅ Données reçues :", { firstName, lastName, email, interest });

    const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
    const contactFileName = `plcontact_${timestamp}.csv`;
    const interactionFileName = `plinter_${timestamp}.csv`;

    const contactCSV = `firstname;lastname;email;use_email_as_key;non_overridable_data;optout_email;active;subscriptions\n${firstName};${lastName};${email};1;firstname,lastname;0;1;PLASTIC_ORIGINS\n`;
    const formattedDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const interactionCSV = `partner_firstname;partner_lastname;partner_email;interaction_date;interaction_state_code;partner_use_email_as_key;partner_non_overridable_data;action_code;action_direction;interaction_state_code\n${firstName};${lastName};${email};${formattedDate};${interest};1;firstname,lastname;PLASTIC_ORIGINS;in;PLASTIC_ORIGINS\n`;

    const contactFilePath = path.join("/tmp", contactFileName);
    const interactionFilePath = path.join("/tmp", interactionFileName);

    writeFileSync(contactFilePath, contactCSV, "utf8");
    writeFileSync(interactionFilePath, interactionCSV, "utf8");

    console.log("📂 Fichiers créés localement :", contactFilePath, interactionFilePath);

    const sftp = new SftpClient();
    try {
      await sftp.connect(sftpConfig);
      await sftp.put(contactFilePath, `/surfrider-causeaeffet/plastic_origins/contacts/${contactFileName}`);
      await sftp.put(interactionFilePath, `/surfrider-causeaeffet/plastic_origins/interactions/${interactionFileName}`);

      console.log("✅ Fichiers envoyés avec succès via SFTP");
      return new NextResponse(JSON.stringify({ message: "Fichiers envoyés avec succès" }), { status: 200, headers });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("❌ Erreur SFTP :", err);
      return new NextResponse(JSON.stringify({ error: "Erreur d'envoi SFTP", details: err.message }), { status: 500, headers });
    } finally {
      await sftp.end();
    }
  } catch (error) {
    console.error("❌ Erreur API :", error);
    return new NextResponse(JSON.stringify({ error: "Erreur interne" }), { status: 500, headers });
  }
}