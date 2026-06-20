"use server";

export async function submitContactForm(formData: FormData) {
  const honeypot = String(formData.get("company") ?? "");
  if (honeypot) {
    return { success: true, message: "Thank you for your message." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !subject || !message) {
    return { success: false, message: "All fields are required." };
  }

  if (!email.includes("@")) {
    return { success: false, message: "Enter a valid email address." };
  }

  return {
    success: true,
    message:
      "Demonstration submission received. No email provider is connected, so this message was not delivered.",
    mailto: `mailto:hello@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${name} (${email})\n\n${message}`)}`,
  };
}
