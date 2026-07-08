export function overdueTemplate(data: {
  userName: string;
  equipmentName: string;
  endDate: Date;
  reservationId: string;
}): { subject: string; html: string } {
  return {
    subject: `Overdue Notice: Please return ${data.equipmentName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Overdue Equipment Notice</h2>

        <p>Hi ${data.userName},</p>

        <p>
          Our records show that your reservation for
          <strong>${data.equipmentName}</strong>
          was due on
          <strong>${data.endDate.toLocaleDateString()}</strong>
          and has not yet been returned.
        </p>

        <p>
          Please return the equipment as soon as possible. If you have already
          returned it, please disregard this message.
        </p>

        <p>
          Reservation ID:
          <strong>${data.reservationId}</strong>
        </p>

        <p>Thank you for your cooperation.</p>

        <p>
          Best regards,<br />
          EquipRent Team
        </p>
      </div>
    `,
  };
}
