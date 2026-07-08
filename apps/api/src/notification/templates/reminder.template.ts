export function reminderTemplate(data: {
  userName: string;
  equipmentName: string;
  endDate: Date;
  reservationId: string;
}): { subject: string; html: string } {
  return {
    subject: `Reminder: Return ${data.equipmentName} by ${data.endDate.toLocaleDateString()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Return Reminder</h2>
        <p>Hi ${data.userName},</p>
        <p>This is a reminder that your reservation for
           <strong>${data.equipmentName}</strong>
           expires on <strong>${data.endDate.toLocaleDateString()}</strong>.
        </p>
        <p>Please return the equipment on time.</p>
        <p>Best regards,<br/>EquipRent Team</p>
      </div>
    `,
  };
}
