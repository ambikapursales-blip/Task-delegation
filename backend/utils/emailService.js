const nodemailer = require("nodemailer");

// Create transporter using SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send email notification
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 */
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send task assignment email
 */
const sendTaskAssignmentEmail = async (userEmail, userName, taskDetails) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0F6E56;">New Task Assigned</h2>
      <p>Hello ${userName},</p>
      <p>You have been assigned a new task:</p>
      <div style="background: #f4f1ec; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">${taskDetails.title}</h3>
        <p style="margin: 0 0 10px 0; color: #666;">${taskDetails.description || "No description"}</p>
        <p style="margin: 0;"><strong>Priority:</strong> ${taskDetails.priority}</p>
        <p style="margin: 0;"><strong>Deadline:</strong> ${taskDetails.deadline ? new Date(taskDetails.deadline).toLocaleDateString() : "No deadline"}</p>
      </div>
      <p>Please log in to the system to view and complete this task.</p>
      <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
    </div>
  `;
  return sendEmail(userEmail, "New Task Assigned", html);
};

/**
 * Send task completion email to assigner
 */
const sendTaskCompletionEmail = async (assignerEmail, taskDetails, completedBy) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0F6E56;">Task Completed</h2>
      <p>Hello,</p>
      <p>The following task has been completed by ${completedBy}:</p>
      <div style="background: #f4f1ec; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">${taskDetails.title}</h3>
        <p style="margin: 0 0 10px 0; color: #666;">${taskDetails.description || "No description"}</p>
        <p style="margin: 0;"><strong>Priority:</strong> ${taskDetails.priority}</p>
      </div>
      <p>Please log in to the system to review the completed task.</p>
      <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
    </div>
  `;
  return sendEmail(assignerEmail, "Task Completed", html);
};

/**
 * Send task reminder email
 */
const sendTaskReminderEmail = async (userEmail, userName, taskDetails) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Task Reminder - Deadline Approaching</h2>
      <p>Hello ${userName},</p>
      <p>This is a reminder that your task deadline is approaching:</p>
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3 style="margin: 0 0 10px 0;">${taskDetails.title}</h3>
        <p style="margin: 0 0 10px 0; color: #666;">${taskDetails.description || "No description"}</p>
        <p style="margin: 0;"><strong>Deadline:</strong> ${taskDetails.deadline ? new Date(taskDetails.deadline).toLocaleDateString() : "No deadline"}</p>
      </div>
      <p>Please complete this task as soon as possible.</p>
      <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
    </div>
  `;
  return sendEmail(userEmail, "Task Reminder", html);
};

module.exports = {
  sendEmail,
  sendTaskAssignmentEmail,
  sendTaskCompletionEmail,
  sendTaskReminderEmail,
};
