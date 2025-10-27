module.exports = function generateEmailTemplate(userName, todos, total, completed, pending, quote) {
  const formatDate = (date) =>
    date ? new Date(date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—';

  const rows = todos.map((todo, index) => {
    const status = todo.completed ? 'Completed' : 'Pending';
    return `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align:center;">${index + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${todo.title}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align:center;">${status}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align:center;">${formatDate(todo.createdAt)} </td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align:center;">
          ${todo.completedAt ? formatDate(todo.completedAt) : '—'}
        </td>
      </tr>
    `;
  }).join('');

   const today = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f8ff;">
      <h2 style="color: #8758ff;">Hi ${userName || 'User'}, here's your Daily To-Do Summary ✨</h2>
      <p style="font-size: 16px;">🗓️ Date:<strong>${today}</strong></p>

      <div style="margin: 15px 0; font-size: 16px;">
        <strong>Total Todos:</strong> ${total}<br>
        <strong>Completed:</strong> ${completed}<br>
        <strong>Pending:</strong> ${pending}
      </div>

      <table style="width:100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background-color:#8758ff; color:white;">
            <th style="border: 1px solid #ddd; padding: 8px;">S.No</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Task</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Created Time</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Completed Time</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <blockquote style="margin-top: 20px; font-style: italic; color: #555;">"${quote}"</blockquote>

      <footer style="margin-top: 25px; font-size: 14px; color: #666;">
        <p>Keep going, you're doing great! 👏</p>
        <p>- Your To-Do App</p>
      </footer>
    </div>
  `;
};
